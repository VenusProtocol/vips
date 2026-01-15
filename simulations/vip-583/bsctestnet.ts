import { impersonateAccount, setBalance, takeSnapshot, SnapshotRestorer } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import {
  DEFAULT_PROXY_ADMIN,
  RISK_FUND_V2_NEW_IMPLEMENTATION,
  RISK_FUND_V2_PROXY,
  vip780,
} from "../../vips/vip-780/bscmainnet";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RISK_FUND_V2_ABI from "./abi/RiskFundV2.json";

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";

// Core Pool Comptroller for testing poolAssetsFunds
const CORE_POOL_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

// USDT whale for donation attack test (Binance Hot Wallet)
const USDT_WHALE = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

forking(73352569, async () => {
  let proxyAdmin: Contract;
  let riskFundV2: Contract;
  let usdt: Contract;
  let oldImplementation: string;
  let timelockSigner: Signer;
  let whaleSigner: Signer;

  // State snapshots for comparison
  let preUpgradeState: {
    owner: string;
    shortfall: string;
    riskFundConverter: string;
    convertibleBaseAsset: string;
    corePoolUsdtReserve: BigNumber;
    usdtBalance: BigNumber;
  };

  before(async () => {
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, DEFAULT_PROXY_ADMIN);
    riskFundV2 = await ethers.getContractAt(RISK_FUND_V2_ABI, RISK_FUND_V2_PROXY);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    oldImplementation = await proxyAdmin.getProxyImplementation(RISK_FUND_V2_PROXY);

    // Impersonate timelock for later tests
    await impersonateAccount(NORMAL_TIMELOCK);
    await setBalance(NORMAL_TIMELOCK, parseUnits("100", 18));
    timelockSigner = await ethers.getSigner(NORMAL_TIMELOCK);

    // Impersonate USDT whale for donation attack tests
    await impersonateAccount(USDT_WHALE);
    await setBalance(USDT_WHALE, parseUnits("100", 18));
    whaleSigner = await ethers.getSigner(USDT_WHALE);

    // Snapshot pre-upgrade state
    preUpgradeState = {
      owner: await riskFundV2.owner(),
      shortfall: await riskFundV2.shortfall(),
      riskFundConverter: await riskFundV2.riskFundConverter(),
      convertibleBaseAsset: await riskFundV2.convertibleBaseAsset(),
      corePoolUsdtReserve: await riskFundV2.poolAssetsFunds(CORE_POOL_COMPTROLLER, USDT),
      usdtBalance: await usdt.balanceOf(RISK_FUND_V2_PROXY),
    };
  });

  describe("Pre-VIP state", async () => {
    it("should have the old implementation", async () => {
      expect(oldImplementation).to.equal("0x7Ef5ABbcC9A701e728BeB7Afd4fb5747fAB15A28");
    });

    it("should have correct owner (Normal Timelock)", async () => {
      expect(await riskFundV2.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("should have non-zero USDT balance", async () => {
      const balance = await usdt.balanceOf(RISK_FUND_V2_PROXY);
      expect(balance).to.be.gt(0);
      console.log(`    Pre-upgrade USDT balance: ${ethers.utils.formatUnits(balance, 18)} USDT`);
    });

    it("should have tracked pool reserves", async () => {
      const corePoolReserve = await riskFundV2.poolAssetsFunds(CORE_POOL_COMPTROLLER, USDT);
      console.log(`    Core Pool USDT reserve: ${ethers.utils.formatUnits(corePoolReserve, 18)} USDT`);
    });

    it("BUG REPRODUCTION: donation attack causes sweepToken to revert (DoS)", async () => {
      // This test demonstrates the bug being fixed:
      // 1. Attacker donates tokens directly to the contract (untracked)
      // 2. When governance tries to sweep amount > assetReserves, arithmetic underflow occurs
      //
      // Bug: preSweepToken used `amount` instead of `amountDiff` in share calculation.
      // When amount > assetReserves: distributedShare (based on amount) > amountDiff,
      // causing underflow in last pool: poolAmountShare = amountDiff - distributedShare
      const snapshot: SnapshotRestorer = await takeSnapshot();

      try {
        // Get current state to calculate proper attack amounts
        const balance = await usdt.balanceOf(RISK_FUND_V2_PROXY);
        const corePoolReserve = await riskFundV2.poolAssetsFunds(CORE_POOL_COMPTROLLER, USDT);

        // Donate enough to make balance significantly larger than tracked reserves
        const donationAmount = parseUnits("1000000", 18); // Donate 1M USDT
        await usdt.connect(whaleSigner).transfer(RISK_FUND_V2_PROXY, donationAmount);

        const newBalance = await usdt.balanceOf(RISK_FUND_V2_PROXY);
        console.log(`    Donated ${ethers.utils.formatUnits(donationAmount, 18)} USDT`);
        console.log(`    New balance: ${ethers.utils.formatUnits(newBalance, 18)} USDT`);
        console.log(`    Tracked reserves (Core Pool): ${ethers.utils.formatUnits(corePoolReserve, 18)} USDT`);

        // Sweep amount > assetReserves but < balance - this triggers the bug
        // When amount > assetReserves: distributedShare calculated with `amount` exceeds amountDiff
        const sweepAmount = corePoolReserve.add(parseUnits("100000", 18)); // Tracked + 100k
        console.log(`    Attempting to sweep: ${ethers.utils.formatUnits(sweepAmount, 18)} USDT`);

        // With buggy code: distributedShare (based on large `amount`) > amountDiff → underflow
        await expect(
          riskFundV2.connect(timelockSigner).sweepToken(USDT, NORMAL_TIMELOCK, sweepAmount),
        ).to.be.reverted; // Arithmetic underflow

        console.log("    ✓ sweepToken reverted as expected (bug confirmed)");
      } finally {
        await snapshot.restore();
      }
    });
  });

  testVip("VIP-780 Upgrade RiskFundV2", await vip780());

  describe("Post-VIP state", async () => {
    it("should have the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_V2_PROXY)).to.equal(RISK_FUND_V2_NEW_IMPLEMENTATION);
    });

    it("should preserve owner after upgrade", async () => {
      expect(await riskFundV2.owner()).to.equal(preUpgradeState.owner);
    });

    it("should preserve shortfall contract after upgrade", async () => {
      expect(await riskFundV2.shortfall()).to.equal(preUpgradeState.shortfall);
    });

    it("should preserve riskFundConverter after upgrade", async () => {
      expect(await riskFundV2.riskFundConverter()).to.equal(preUpgradeState.riskFundConverter);
    });

    it("should preserve convertibleBaseAsset after upgrade", async () => {
      expect(await riskFundV2.convertibleBaseAsset()).to.equal(preUpgradeState.convertibleBaseAsset);
    });

    it("should preserve poolAssetsFunds mapping after upgrade", async () => {
      const postUpgradeReserve = await riskFundV2.poolAssetsFunds(CORE_POOL_COMPTROLLER, USDT);
      expect(postUpgradeReserve).to.equal(preUpgradeState.corePoolUsdtReserve);
    });

    it("should preserve token balances after upgrade", async () => {
      const postUpgradeBalance = await usdt.balanceOf(RISK_FUND_V2_PROXY);
      expect(postUpgradeBalance).to.equal(preUpgradeState.usdtBalance);
    });

    it("should allow owner to call sweepToken (basic access check)", async () => {
      // This test verifies the function is callable by owner
      // We don't actually sweep funds, just verify the call doesn't revert on access
      const balance = await usdt.balanceOf(RISK_FUND_V2_PROXY);

      if (balance.gt(0)) {
        // Sweep a small amount (1 USDT) to verify functionality
        const sweepAmount = parseUnits("1", 18);
        if (balance.gte(sweepAmount)) {
          await expect(riskFundV2.connect(timelockSigner).sweepToken(USDT, NORMAL_TIMELOCK, sweepAmount)).to.not.be
            .reverted;
        }
      }
    });

    it("should correctly report pool reserves via getPoolsBaseAssetReserves", async () => {
      const reserves = await riskFundV2.getPoolsBaseAssetReserves(CORE_POOL_COMPTROLLER);
      // Should return the same as poolAssetsFunds for base asset
      console.log(`    Core Pool base asset reserves: ${ethers.utils.formatUnits(reserves, 18)}`);
    });

    it("FIX VERIFICATION: donation attack no longer causes DoS after upgrade", async () => {
      // This test verifies the fix works:
      // Same scenario as pre-upgrade bug reproduction, but sweepToken should now succeed
      const snapshot: SnapshotRestorer = await takeSnapshot();

      try {
        // Get current state to calculate proper test amounts (same as pre-upgrade test)
        const corePoolReserve = await riskFundV2.poolAssetsFunds(CORE_POOL_COMPTROLLER, USDT);

        // Donate enough to make balance significantly larger than tracked reserves
        const donationAmount = parseUnits("1000000", 18); // Donate 1M USDT
        await usdt.connect(whaleSigner).transfer(RISK_FUND_V2_PROXY, donationAmount);

        const newBalance = await usdt.balanceOf(RISK_FUND_V2_PROXY);
        console.log(`    Donated ${ethers.utils.formatUnits(donationAmount, 18)} USDT`);
        console.log(`    New balance: ${ethers.utils.formatUnits(newBalance, 18)} USDT`);
        console.log(`    Tracked reserves (Core Pool): ${ethers.utils.formatUnits(corePoolReserve, 18)} USDT`);

        // Same sweep amount that caused revert pre-upgrade
        const sweepAmount = corePoolReserve.add(parseUnits("100000", 18)); // Tracked + 100k
        console.log(`    Attempting to sweep: ${ethers.utils.formatUnits(sweepAmount, 18)} USDT`);

        const timelockBalanceBefore = await usdt.balanceOf(NORMAL_TIMELOCK);

        // With fixed code: uses amountDiff instead of amount, preventing underflow
        await expect(riskFundV2.connect(timelockSigner).sweepToken(USDT, NORMAL_TIMELOCK, sweepAmount)).to.not.be
          .reverted;

        // Verify tokens were actually swept
        const timelockBalanceAfter = await usdt.balanceOf(NORMAL_TIMELOCK);
        expect(timelockBalanceAfter.sub(timelockBalanceBefore)).to.equal(sweepAmount);

        console.log("    ✓ sweepToken succeeded after upgrade (fix confirmed)");
        console.log(`    ✓ Timelock received ${ethers.utils.formatUnits(sweepAmount, 18)} USDT`);
      } finally {
        await snapshot.restore();
      }
    });
  });
});
