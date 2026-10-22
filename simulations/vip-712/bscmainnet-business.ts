import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodForAllAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip712, {
  COLLATERAL_GATEWAY,
  ENTER_MARKET_FOR_ACCOUNT_SIGNATURE,
  PRIME,
  PRIME_LENS,
} from "../../vips/vip-712/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { parseEther } = ethers.utils;
const { MaxUint256 } = ethers.constants;
const { bscmainnet } = NETWORK_ADDRESSES;
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VHUSDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
const VVHUSDT = "0xc0768948e668B7BacFf8b4BD1BaBe0eD2b512d3c";
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const SUPPLY = parseEther("1000");
const STAKE = parseEther("10000");
const VTOKEN_ABI = [
  "function underlying() view returns (address)",
  "function mint(uint256) returns (uint256)",
  "function borrow(uint256) returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function borrowBalanceStored(address) view returns (uint256)",
  "function borrowIndex() view returns (uint256)",
  "function exchangeRateStored() view returns (uint256)",
];
const GATEWAY_ABI = [
  "function COMPTROLLER() view returns (address)",
  "function supplyFromWallet(uint256,address,uint256) returns (uint256)",
  "function supplyFromCollateral(address,uint256,address,uint256) returns (uint256)",
  "function withdrawPosition(address,uint256,uint256) returns (uint256)",
  "error InsufficientShares(uint256,uint256)",
  "error InsufficientAssets(uint256,uint256)",
];
const PRIME_ABI = [
  "function getAllMarkets() view returns (address[])",
  "function totalTokens() view returns (uint256)",
  "function setLimit(uint256)",
  "function issue(address)",
  "function addMarket(address,uint256,uint256)",
  "function updateScores(address[])",
  "function interests(address,address) view returns (uint256 accrued,uint256 score,uint256 rewardIndex,uint256 lifetimeAccrued)",
  "function markets(address) view returns (uint256 supplyMultiplier,uint256 borrowMultiplier,uint256 rewardIndex,uint256 sumOfMembersScore,bool exists)",
];
const LENS_ABI = [
  "function estimateAPR(address,address,uint256,uint256,uint256) view returns (tuple(uint256 supplyAPR,uint256 borrowAPR,uint256 totalScore,uint256 userScore,uint256 xvsBalanceForScore,uint256 capital,uint256 cappedSupply,uint256 cappedBorrow,uint256 supplyCapUSD,uint256 borrowCapUSD) aprInfo)",
];

// Use the deployed Gateway, Prime implementation and Lens after the actual governance lifecycle.
// No new implementation deployment, bytecode replacement or manual Gateway permission grants.
forking(129099700, async () => {
  const provider = ethers.provider;
  const core = new Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
  const acm = new Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, provider);
  const prime = new Contract(PRIME, PRIME_ABI, provider);
  const oracle = new Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const flashEvents = new Contract(
    core.address,
    ["event FlashLoanExecuted(address indexed receiver,address[] assets,uint256[] amounts)"],
    provider,
  );

  before(async () => {
    // Voting/time travel ages the real feeds. Extend their stale windows, keeping actual prices
    // and oracle routing. Prime's existing markets must remain priceable when issuing a token.
    const markets: string[] = await prime.getAllMarkets();
    const assets = new Set([USDT, bscmainnet.XVS]);
    for (const market of markets) {
      assets.add(await new Contract(market, VTOKEN_ABI, provider).underlying());
    }
    await setMaxStalePeriodForAllAssets(
      oracle,
      [...assets].map(address => new Contract(address, ERC20_ABI, provider)),
    );
  });

  testVip("VIP-712 business scenarios", await vip712());

  async function userFixture() {
    const [, user] = await ethers.getSigners();
    const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseEther("10"));
    const whale = await initMainnetUser(USDT_WHALE, parseEther("1"));
    const usdt = new Contract(USDT, ERC20_ABI, user);
    const vUsdt = new Contract(VUSDT, VTOKEN_ABI, user);
    const vvhUsdt = new Contract(VVHUSDT, VTOKEN_ABI, user);
    const hub = new Contract(
      VHUSDT,
      [
        ...ERC20_ABI,
        "function deposit(uint256,address) returns (uint256)",
        "function previewDeposit(uint256) view returns (uint256)",
      ],
      user,
    );
    const gateway = new Contract(COLLATERAL_GATEWAY, GATEWAY_ABI, user);
    expect(await gateway.COMPTROLLER()).to.equal(core.address);
    expect(await hub.decimals()).to.equal(24);
    await usdt.connect(whale).transfer(user.address, SUPPLY.mul(5));
    await usdt.approve(gateway.address, MaxUint256);
    await usdt.approve(vUsdt.address, MaxUint256);
    await usdt.approve(hub.address, MaxUint256);
    return { user, timelock, usdt, vUsdt, vvhUsdt, hub, gateway };
  }

  async function noResidue() {
    for (const token of [USDT, VHUSDT, VUSDT, VVHUSDT]) {
      expect(await new Contract(token, ERC20_ABI, provider).balanceOf(COLLATERAL_GATEWAY)).to.equal(0);
    }
    for (const [token, spender] of [
      [USDT, VHUSDT],
      [USDT, VUSDT],
      [VHUSDT, VVHUSDT],
    ]) {
      expect(await new Contract(token, ERC20_ABI, provider).allowance(COLLATERAL_GATEWAY, spender)).to.equal(0);
    }
  }

  async function corePosition(borrow = false) {
    const f = await loadFixture(userFixture);
    expect(await f.vUsdt.callStatic.mint(SUPPLY)).to.equal(0);
    await f.vUsdt.mint(SUPPLY);
    await core.connect(f.user).enterMarkets([VUSDT]);
    await core.connect(f.user).updateDelegate(COLLATERAL_GATEWAY, true);
    if (borrow) {
      expect(await f.vUsdt.callStatic.borrow(parseEther("700"))).to.equal(0);
      await f.vUsdt.borrow(parseEther("700"));
    }
    return { ...f, receipts: (await f.vUsdt.balanceOf(f.user.address)) as BigNumber };
  }

  async function userPosition(f: Awaited<ReturnType<typeof userFixture>>) {
    return {
      wallet: (await f.usdt.balanceOf(f.user.address)).toString(),
      shares: (await f.hub.balanceOf(f.user.address)).toString(),
      oldReceipts: (await f.vUsdt.balanceOf(f.user.address)).toString(),
      newReceipts: (await f.vvhUsdt.balanceOf(f.user.address)).toString(),
      debt: (await f.vUsdt.borrowBalanceStored(f.user.address)).toString(),
      membership: await core.checkMembership(f.user.address, VVHUSDT),
    };
  }

  describe("Post-VIP CollateralGateway Core flows", () => {
    it("supplies from the wallet, auto-enters collateral and supports a repeat supply", async () => {
      const f = await loadFixture(userFixture);
      expect(await core.checkMembership(f.user.address, VVHUSDT)).to.equal(false);
      const walletBefore = await f.usdt.balanceOf(f.user.address);
      await f.gateway.supplyFromWallet(SUPPLY, VVHUSDT, 0);
      const firstReceipts = await f.vvhUsdt.balanceOf(f.user.address);
      expect(firstReceipts).to.be.gt(0);
      expect(await core.checkMembership(f.user.address, VVHUSDT)).to.equal(true);
      const [err, liquidity, shortfall] = await core.getAccountLiquidity(f.user.address);
      expect(err).to.equal(0);
      expect(liquidity).to.be.gt(0);
      expect(shortfall).to.equal(0);
      await f.gateway.supplyFromWallet(SUPPLY, VVHUSDT, 0);
      expect(await f.vvhUsdt.balanceOf(f.user.address)).to.be.gt(firstReceipts);
      expect(await f.usdt.balanceOf(f.user.address)).to.equal(walletBefore.sub(SUPPLY.mul(2)));
      await noResidue();
    });

    for (const mode of ["no debt", "borrow with headroom", "leveraged full migration"]) {
      it(`migrates Core collateral: ${mode}`, async () => {
        const f = await corePosition(mode !== "no debt");
        const amount = mode === "borrow with headroom" ? f.receipts.div(10) : f.receipts;
        const [, , hypotheticalShortfall] = await core.getHypotheticalAccountLiquidity(
          f.user.address,
          VUSDT,
          amount,
          0,
        );
        const flash = mode === "leveraged full migration";
        expect(hypotheticalShortfall.gt(0)).to.equal(flash);
        const debtBefore = await f.vUsdt.borrowBalanceStored(f.user.address);
        const borrowIndexBefore = await f.vUsdt.borrowIndex();
        const [, liquidityBefore] = await core.getAccountLiquidity(f.user.address);
        const tx = f.gateway.supplyFromCollateral(VUSDT, amount, VVHUSDT, 0);
        if (flash) await expect(tx).to.emit(flashEvents, "FlashLoanExecuted");
        else await expect(tx).not.to.emit(flashEvents, "FlashLoanExecuted");
        expect(await f.vUsdt.balanceOf(f.user.address)).to.equal(f.receipts.sub(amount));
        expect(await f.vvhUsdt.balanceOf(f.user.address)).to.be.gt(0);
        expect(await core.checkMembership(f.user.address, VVHUSDT)).to.equal(true);
        const debtAfter = await f.vUsdt.borrowBalanceStored(f.user.address);
        // Account for real interest accrual without tolerating any extra borrowed principal.
        const expectedDebt = debtBefore.mul(await f.vUsdt.borrowIndex()).div(borrowIndexBefore);
        expect(debtAfter).to.be.closeTo(expectedDebt, 1);
        const [err, liquidityAfter, shortfall] = await core.getAccountLiquidity(f.user.address);
        expect(err).to.equal(0);
        expect(shortfall).to.equal(0);
        expect(liquidityAfter).to.be.closeTo(liquidityBefore, liquidityBefore.div(100));
        await noResidue();
      });
    }

    it("rolls back migration without the user's delegation", async () => {
      const f = await corePosition();
      await core.connect(f.user).updateDelegate(COLLATERAL_GATEWAY, false);
      const before = await userPosition(f);
      await expect(f.gateway.supplyFromCollateral(VUSDT, f.receipts, VVHUSDT, 0)).to.be.reverted;
      expect(await userPosition(f)).to.deep.equal(before);
      await noResidue();
    });

    it("rolls back a leveraged migration if the VIP flashloan grant is removed", async () => {
      const f = await corePosition(true);
      await core.connect(f.timelock).setWhiteListFlashLoanAccount(COLLATERAL_GATEWAY, false);
      const before = await userPosition(f);
      await expect(f.gateway.supplyFromCollateral(VUSDT, f.receipts, VVHUSDT, 0)).to.be.reverted;
      expect(await userPosition(f)).to.deep.equal(before);
      await noResidue();
    });

    it("rolls back wallet supply and market entry when minShares cannot be met", async () => {
      const f = await loadFixture(userFixture);
      const before = await userPosition(f);
      await expect(f.gateway.supplyFromWallet(SUPPLY, VVHUSDT, MaxUint256)).to.be.revertedWithCustomError(
        f.gateway,
        "InsufficientShares",
      );
      expect(await userPosition(f)).to.deep.equal(before);
      await noResidue();
    });

    it("rolls back wallet supply if the VIP enter-market permission is removed", async () => {
      const f = await loadFixture(userFixture);
      await acm
        .connect(f.timelock)
        .revokeCallPermission(core.address, ENTER_MARKET_FOR_ACCOUNT_SIGNATURE, COLLATERAL_GATEWAY);
      const before = await userPosition(f);
      await expect(f.gateway.supplyFromWallet(SUPPLY, VVHUSDT, 0)).to.be.reverted;
      expect(await userPosition(f)).to.deep.equal(before);
      await noResidue();
    });

    it("rolls back the flashloan and collateral migration when minShares cannot be met", async () => {
      const f = await corePosition(true);
      const before = await userPosition(f);
      const marketCash = await f.usdt.balanceOf(VUSDT);
      await expect(
        f.gateway.supplyFromCollateral(VUSDT, f.receipts, VVHUSDT, MaxUint256),
      ).to.be.revertedWithCustomError(f.gateway, "InsufficientShares");
      expect(await userPosition(f)).to.deep.equal(before);
      expect(await f.usdt.balanceOf(VUSDT)).to.equal(marketCash);
      await noResidue();
    });

    for (const source of ["wallet", "Core", "wallet and Core"]) {
      it(`withdraws a position from ${source}`, async () => {
        const f = await loadFixture(userFixture);
        if (source !== "wallet") {
          await f.gateway.supplyFromWallet(SUPPLY, VVHUSDT, 0);
          await core.connect(f.user).updateDelegate(COLLATERAL_GATEWAY, true);
        }
        if (source !== "Core") {
          await f.hub.deposit(SUPPLY, f.user.address);
          await f.hub.approve(COLLATERAL_GATEWAY, MaxUint256);
        }
        const before = await f.usdt.balanceOf(f.user.address);
        const principal = source === "wallet and Core" ? SUPPLY.mul(2) : SUPPLY;
        const shares = source === "wallet" ? await f.hub.balanceOf(f.user.address) : MaxUint256;
        await f.gateway.withdrawPosition(VVHUSDT, shares, principal.mul(99).div(100));
        const received = (await f.usdt.balanceOf(f.user.address)).sub(before);
        expect(received).to.be.closeTo(principal, principal.div(100));
        expect(await f.hub.balanceOf(f.user.address)).to.equal(0);
        expect(await f.vvhUsdt.balanceOf(f.user.address)).to.equal(0);
        await noResidue();
      });
    }

    it("rolls back withdrawal when minAssets cannot be met", async () => {
      const f = await loadFixture(userFixture);
      await f.gateway.supplyFromWallet(SUPPLY, VVHUSDT, 0);
      await core.connect(f.user).updateDelegate(COLLATERAL_GATEWAY, true);
      const before = await userPosition(f);
      await expect(f.gateway.withdrawPosition(VVHUSDT, MaxUint256, MaxUint256)).to.be.revertedWithCustomError(
        f.gateway,
        "InsufficientAssets",
      );
      expect(await userPosition(f)).to.deep.equal(before);
      await noResidue();
    });

    it("uses wallet shares first without requiring delegation or touching Core receipts", async () => {
      const f = await loadFixture(userFixture);
      await f.gateway.supplyFromWallet(SUPPLY, VVHUSDT, 0);
      await f.hub.deposit(SUPPLY, f.user.address);
      await f.hub.approve(COLLATERAL_GATEWAY, MaxUint256);
      const receipts = await f.vvhUsdt.balanceOf(f.user.address);
      const shares = await f.hub.balanceOf(f.user.address);
      await f.gateway.withdrawPosition(VVHUSDT, shares, SUPPLY.mul(99).div(100));
      expect(await f.hub.balanceOf(f.user.address)).to.equal(0);
      expect(await f.vvhUsdt.balanceOf(f.user.address)).to.equal(receipts);
      await noResidue();
    });
  });

  describe("Post-VIP Prime with 24-decimal vhUSDT and the deployed Gateway", () => {
    it("scores a Gateway-created vvhUSDT position and agrees with the deployed PrimeLens", async () => {
      const f = await loadFixture(userFixture);
      const xvs = new Contract(bscmainnet.XVS, ERC20_ABI, f.user);
      const vault = new Contract(
        bscmainnet.XVS_VAULT_PROXY,
        ["function deposit(address,uint256,uint256)", "function requestWithdrawal(address,uint256,uint256)"],
        f.user,
      );
      const store = await initMainnetUser(XVS_STORE, parseEther("1"));
      await xvs.connect(store).transfer(f.user.address, STAKE.add(parseEther("100")));
      await xvs.approve(vault.address, MaxUint256);
      await vault.deposit(xvs.address, 0, STAKE);

      // Test-only market onboarding, NOT extra VIP commands: this proposal enables 24 decimals
      // but does not list a Prime market. Initialise PLP before any scoring callback can run.
      for (const signature of ["setLimit(uint256)", "issue(address)", "addMarket(address,uint256,uint256)"]) {
        await acm.connect(f.timelock).giveCallPermission(PRIME, signature, f.timelock.address);
      }
      const adminPrime = prime.connect(f.timelock);
      await adminPrime.setLimit((await prime.totalTokens()).add(1));
      await adminPrime.issue(f.user.address);
      const plp = new Contract(PLP, ["function initializeTokens(address[])"], f.timelock);
      await plp.initializeTokens([VHUSDT]);
      await adminPrime.addMarket(VVHUSDT, parseEther("2"), 0);
      expect((await prime.markets(VVHUSDT)).exists).to.equal(true);

      // This goes through Gateway -> Hub -> mintBehalf -> Comptroller -> upgraded Prime.
      await f.gateway.supplyFromWallet(SUPPLY, VVHUSDT, 0);
      await f.vUsdt.mint(SUPPLY);
      await prime.connect(f.user).updateScores([f.user.address]);
      const stored = (await prime.interests(VVHUSDT, f.user.address)).score;
      const standard = (await prime.interests(VUSDT, f.user.address)).score;
      expect(stored).to.be.gt(0);
      expect(standard).to.be.gt(0);
      expect(stored).to.be.closeTo(standard, standard.div(50));

      const lens = new Contract(PRIME_LENS, LENS_ABI, provider);
      const underlyingSupply = (await f.vvhUsdt.balanceOf(f.user.address))
        .mul(await f.vvhUsdt.exchangeRateStored())
        .div(parseEther("1"));
      const apr = await lens.estimateAPR(VVHUSDT, f.user.address, 0, underlyingSupply, STAKE);
      expect(apr.userScore).to.be.gt(0);
      expect(apr.userScore).to.be.closeTo(stored, stored.div(100));

      await vault.deposit(xvs.address, 0, parseEther("100"));
      await vault.requestWithdrawal(xvs.address, 0, parseEther("50"));
      await core.connect(f.user).updateDelegate(COLLATERAL_GATEWAY, true);
      await f.gateway.withdrawPosition(VVHUSDT, MaxUint256, SUPPLY.mul(99).div(100));
      expect(await f.vvhUsdt.balanceOf(f.user.address)).to.equal(0);
      expect((await prime.interests(VVHUSDT, f.user.address)).score).to.equal(0);
      await noResidue();
    });
  });
});
