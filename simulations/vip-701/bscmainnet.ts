import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { vip622 } from "../../vips/vip-622/bscmainnet";
import vip701, {
  ACM,
  CORE_POOL_MARKET_CONFIGS,
  EBRAKE,
  EBRAKE_EXECUTOR_PERMS,
  EXECUTOR,
  EXECUTOR_GOVERNANCE_PERMS,
  EXECUTOR_MONITOR_PERMS,
  FLUX_MARKETING_WALLET,
  SIGNAL_MONITOR,
  USDT,
  USDT_AMOUNT,
} from "../../vips/vip-701/bscmainnet";
import coreMarketCaps from "../../vips/vip-701/coreMarketCaps.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import ERC20_ABI from "./abi/ERC20.json";
import EXECUTOR_ABI from "./abi/Executor.json";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN, UNITROLLER, VTREASURY } =
  NETWORK_ADDRESSES.bscmainnet;
const EXECUTOR_GOVERNANCE_ACCOUNTS = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// Listed Core Pool market driving the happy-path round-trip.
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
// Unlisted address used to exercise MarketNotConfigured (every Core Pool market is configured by the VIP).
const UNLISTED_MARKET = "0x000000000000000000000000000000000000bEEF";

// IExecutor.CapType wire values — load-bearing.
const CAP_TYPE_BORROW = 0;
const CAP_TYPE_SUPPLY = 1;

// Block after Executor is deployed on BSC mainnet.
const BLOCK_NUMBER = 98248415;

forking(BLOCK_NUMBER, async () => {
  let accessControlManager: Contract;
  let executor: Contract;
  let eBrake: Contract;
  let comptroller: Contract;
  let usdt: Contract;

  // BSC mainnet ACM's isAllowedToCall keys on msg.sender == target contract.
  // We impersonate the relevant target contract for each permission lookup.
  let impersonatedExecutor: SignerWithAddress;
  let impersonatedEBrake: SignerWithAddress;

  let monitorSigner: SignerWithAddress;
  let criticalTimelockSigner: SignerWithAddress;
  let randomSigner: SignerWithAddress;

  // Captured before VIP execution so post-VIP assertions can verify the delta.
  let treasuryUsdtBefore: BigNumber;
  let fluxWalletUsdtBefore: BigNumber;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    executor = await ethers.getContractAt(EXECUTOR_ABI, EXECUTOR);
    eBrake = await ethers.getContractAt(EBRAKE_ABI, EBRAKE);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);

    impersonatedExecutor = await initMainnetUser(EXECUTOR, ethers.utils.parseEther("1"));
    impersonatedEBrake = await initMainnetUser(EBRAKE, ethers.utils.parseEther("1"));

    monitorSigner = await initMainnetUser(SIGNAL_MONITOR, ethers.utils.parseEther("1"));
    criticalTimelockSigner = await initMainnetUser(CRITICAL_TIMELOCK, ethers.utils.parseEther("1"));
    randomSigner = await initMainnetUser("0x000000000000000000000000000000000000bEEF", ethers.utils.parseEther("1"));

    // VIP-622 is queued at this fork block. coreMarketCaps.json was built off the same
    // VIP-622 data file, so pre-executing it here makes on-chain caps match the snapshot
    // the VIP-701 floors were computed from — the post-VIP-701 assertion below can then
    // verify each stored floor equals 20% of the comptroller's live cap.
    await pretendExecutingVip(await vip622(), NORMAL_TIMELOCK);

    treasuryUsdtBefore = await usdt.balanceOf(VTREASURY);
    fluxWalletUsdtBefore = await usdt.balanceOf(FLUX_MARKETING_WALLET);
  });

  describe("Pre-VIP behavior", () => {
    it("Signal monitor should not yet have Executor action permissions", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const sig of EXECUTOR_MONITOR_PERMS) {
        expect(await acm.isAllowedToCall(SIGNAL_MONITOR, sig)).to.equal(false, `unexpected permission: ${sig}`);
      }
    });

    it("Executor should not yet have EBrake permissions", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of EBRAKE_EXECUTOR_PERMS) {
        expect(await acm.isAllowedToCall(EXECUTOR, sig)).to.equal(false, `unexpected permission: ${sig}`);
      }
    });

    it("Guardian and Timelocks should not yet have setMarketConfig permission on Executor", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const account of EXECUTOR_GOVERNANCE_ACCOUNTS) {
        for (const sig of EXECUTOR_GOVERNANCE_PERMS) {
          expect(await acm.isAllowedToCall(account, sig)).to.equal(
            false,
            `unexpected permission ${sig} for ${account}`,
          );
        }
      }
    });

    it("Signal monitor cannot call Executor handlers before the VIP runs", async () => {
      await expect(executor.connect(monitorSigner).handleLTVAdjust(VUSDC, 0)).to.be.reverted;
    });

    it("Executor and EBrake are not yet owned by Normal Timelock (pendingOwner is set)", async () => {
      expect(await executor.owner()).to.not.equal(NORMAL_TIMELOCK);
      expect(await executor.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await eBrake.owner()).to.not.equal(NORMAL_TIMELOCK);
      expect(await eBrake.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-701 [BNB Chain] Configure tighten-only Executor", await vip701(), {
    callbackAfterExecution: async txResponse => {
      // 13 RoleGranted, 2 OwnershipTransferred (Executor + EBrake), 1 MarketConfigSet per Core Pool market.
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [13]);
      await expectEvents(txResponse, [EXECUTOR_ABI], ["OwnershipTransferred"], [2]);
      await expectEvents(txResponse, [EXECUTOR_ABI], ["MarketConfigSet"], [CORE_POOL_MARKET_CONFIGS.length]);
    },
  });

  describe("Post-VIP permission state", () => {
    it("Signal monitor should have all Executor action permissions", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const sig of EXECUTOR_MONITOR_PERMS) {
        expect(await acm.isAllowedToCall(SIGNAL_MONITOR, sig)).to.equal(true, `missing permission: ${sig}`);
      }
    });

    it("Executor should have all EBrake permissions", async () => {
      const acm = accessControlManager.connect(impersonatedEBrake);
      for (const sig of EBRAKE_EXECUTOR_PERMS) {
        expect(await acm.isAllowedToCall(EXECUTOR, sig)).to.equal(true, `missing permission: ${sig}`);
      }
    });

    it("Guardian and Timelocks should have setMarketConfig permission on Executor", async () => {
      const acm = accessControlManager.connect(impersonatedExecutor);
      for (const account of EXECUTOR_GOVERNANCE_ACCOUNTS) {
        for (const sig of EXECUTOR_GOVERNANCE_PERMS) {
          expect(await acm.isAllowedToCall(account, sig)).to.equal(true, `missing permission ${sig} for ${account}`);
        }
      }
    });
  });

  describe("Executor deployment linkage", () => {
    it("Executor.EBRAKE should equal the configured EBrake address", async () => {
      expect(await executor.EBRAKE()).to.equal(EBRAKE);
    });

    it("Executor.COMPTROLLER should equal the Core Pool Unitroller", async () => {
      expect(await executor.COMPTROLLER()).to.equal(UNITROLLER);
    });

    it("Executor.IS_CORE_POOL should be true (BSC Diamond comptroller)", async () => {
      expect(await executor.IS_CORE_POOL()).to.equal(true);
    });
  });

  describe("Post-VIP ownership state", () => {
    it("Executor.owner() is Normal Timelock and pendingOwner is cleared", async () => {
      expect(await executor.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await executor.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("EBrake.owner() is Normal Timelock and pendingOwner is cleared", async () => {
      expect(await eBrake.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await eBrake.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP Core Pool market configs", () => {
    // With VIP-622 pre-executed in `before`, the comptroller's borrow/supply caps now reflect
    // the post-VIP-622 state. The script computed VIP-701's floors off the same VIP-622 data,
    // so the Executor's stored floor for every configured market must equal 20% of the live cap
    // and the live cap must equal the snapshot the script saw. Catches drift between the two.
    it("every Core Pool market's stored floors equal 20% of the post-VIP-622 on-chain caps", async () => {
      for (const m of CORE_POOL_MARKET_CONFIGS) {
        const [liveBorrowCap, liveSupplyCap, cfg] = await Promise.all([
          comptroller.borrowCaps(m.address),
          comptroller.supplyCaps(m.address),
          executor.marketConfigs(m.address),
        ]);
        const expectedMinBorrow = liveBorrowCap.mul(20).div(100);
        const expectedMinSupply = liveSupplyCap.mul(20).div(100);

        expect(cfg.minBorrowCap).to.equal(
          expectedMinBorrow,
          `minBorrowCap for ${m.symbol} (${
            m.address
          }): stored ${cfg.minBorrowCap.toString()} vs 20% of live ${liveBorrowCap.toString()}`,
        );
        expect(cfg.minSupplyCap).to.equal(
          expectedMinSupply,
          `minSupplyCap for ${m.symbol} (${
            m.address
          }): stored ${cfg.minSupplyCap.toString()} vs 20% of live ${liveSupplyCap.toString()}`,
        );
        expect(cfg.enabled).to.equal(true, `enabled for ${m.symbol} (${m.address})`);
      }
    });
  });

  describe("Skipped markets are skipped for the right reason", () => {
    for (const s of coreMarketCaps.skipped) {
      const label = `${s.symbol ?? "(unknown symbol)"} ${s.address}`;
      if (s.reason.includes("not listed in core pool")) {
        it(`${label}: isListed === false in core pool`, async () => {
          const [isListed] = await comptroller.markets(s.address);
          expect(isListed).to.equal(false);
        });
      } else if (s.reason.includes("20% floors are both zero")) {
        // VIP-622 has been pre-executed, so live caps already reflect the effective state
        // the script used. Both 20% values must round to zero — otherwise the script
        // dropped a market that should have stayed in.
        it(`${label}: 20% of live borrow & supply caps both round to zero`, async () => {
          const [liveBorrow, liveSupply] = await Promise.all([
            comptroller.borrowCaps(s.address),
            comptroller.supplyCaps(s.address),
          ]);
          expect(liveBorrow.mul(20).div(100)).to.equal(
            0,
            `unexpected non-zero 20% borrow floor (cap ${liveBorrow.toString()})`,
          );
          expect(liveSupply.mul(20).div(100)).to.equal(
            0,
            `unexpected non-zero 20% supply floor (cap ${liveSupply.toString()})`,
          );
        });
      } else {
        it(`${label}: unknown skip reason "${s.reason}"`, () => {
          throw new Error(`Unhandled skip reason: ${s.reason}. Update the test or the script.`);
        });
      }
    }

    it("Executor was NOT configured for any skipped market", async () => {
      for (const s of coreMarketCaps.skipped) {
        const cfg = await executor.marketConfigs(s.address);
        expect(cfg.enabled).to.equal(false, `${s.symbol ?? s.address} should be unconfigured`);
        expect(cfg.minBorrowCap).to.equal(0, `${s.symbol ?? s.address} should have zero stored borrow floor`);
        expect(cfg.minSupplyCap).to.equal(0, `${s.symbol ?? s.address} should have zero stored supply floor`);
      }
    });
  });

  describe("Post-VIP behaviour — setMarketConfig", () => {
    it("reverts when called from an unauthorized account", async () => {
      await expect(
        executor.connect(randomSigner).setMarketConfig(VUSDC, { minBorrowCap: 0, minSupplyCap: 0, enabled: true }),
      ).to.be.reverted;
    });

    it("reverts with ZeroAddress when market is the zero address", async () => {
      await expect(
        executor
          .connect(criticalTimelockSigner)
          .setMarketConfig(ethers.constants.AddressZero, { minBorrowCap: 0, minSupplyCap: 0, enabled: true }),
      ).to.be.revertedWithCustomError(executor, "ZeroAddress");
    });

    it("reverts when market is not listed in the comptroller", async () => {
      const unlistedMarket = "0x000000000000000000000000000000000000DEAD";
      await expect(
        executor
          .connect(criticalTimelockSigner)
          .setMarketConfig(unlistedMarket, { minBorrowCap: 0, minSupplyCap: 0, enabled: true }),
      ).to.be.reverted;
    });

    it("Critical timelock can configure a listed market and the config is stored", async () => {
      const currentBorrowCap: BigNumber = await comptroller.borrowCaps(VUSDC);
      const currentSupplyCap: BigNumber = await comptroller.supplyCaps(VUSDC);
      // Floor at half the live caps — high enough to actually reject below-floor adjustments,
      // low enough that the tightening round-trip further down still has room to move.
      const minBorrowCap = currentBorrowCap.div(2);
      const minSupplyCap = currentSupplyCap.div(2);

      await expect(
        executor.connect(criticalTimelockSigner).setMarketConfig(VUSDC, { minBorrowCap, minSupplyCap, enabled: true }),
      )
        .to.emit(executor, "MarketConfigSet")
        .withArgs(VUSDC, [minBorrowCap, minSupplyCap, true]);

      const stored = await executor.marketConfigs(VUSDC);
      expect(stored.minBorrowCap).to.equal(minBorrowCap);
      expect(stored.minSupplyCap).to.equal(minSupplyCap);
      expect(stored.enabled).to.equal(true);
    });
  });

  describe("Post-VIP behaviour — handler access control", () => {
    it("non-monitor caller cannot invoke handleLTVAdjust", async () => {
      await expect(executor.connect(randomSigner).handleLTVAdjust(VUSDC, 0)).to.be.reverted;
    });

    it("non-monitor caller cannot invoke handleCapAdjust", async () => {
      await expect(executor.connect(randomSigner).handleCapAdjust(VUSDC, CAP_TYPE_BORROW, 0)).to.be.reverted;
    });

    it("non-monitor caller cannot invoke handleSupplyCapExceeding", async () => {
      await expect(executor.connect(randomSigner).handleSupplyCapExceeding(VUSDC)).to.be.reverted;
    });

    it("non-monitor caller cannot invoke handleBorrowCapExceeding", async () => {
      await expect(executor.connect(randomSigner).handleBorrowCapExceeding(VUSDC)).to.be.reverted;
    });

    it("handler reverts with MarketNotConfigured for a market never registered", async () => {
      await expect(executor.connect(monitorSigner).handleLTVAdjust(UNLISTED_MARKET, 0)).to.be.revertedWithCustomError(
        executor,
        "MarketNotConfigured",
      );
    });
  });

  describe("Post-VIP behaviour — end-to-end signal → Executor → EBrake → Comptroller", () => {
    it("handleLTVAdjust(newCF >= currentCF) traverses Executor + EBrake without reverting (idempotent path)", async () => {
      // Forcing a real CF decrease at this fork block hits Comptroller's resilient-oracle
      // validation ("invalid resilient oracle price"). Setting adjustedLTV to the current CF
      // exercises the Monitor → Executor → EBrake auth chain — EBrake.decreaseCF then skips
      // every pool's comptroller call (newCF >= currentCF → continue) and the Executor still
      // emits the event. State-changing E2E is covered below via cap adjustments.
      const [, currentCF] = await comptroller.markets(VUSDC);
      expect(currentCF).to.be.gt(0);

      await expect(executor.connect(monitorSigner).handleLTVAdjust(VUSDC, currentCF))
        .to.emit(executor, "LTVAdjusted")
        .withArgs(SIGNAL_MONITOR, VUSDC, currentCF);
    });

    it("handleCapAdjust(BORROW) lowers the borrow cap on the Comptroller and rejects below minBorrowCap", async () => {
      const currentCap: BigNumber = await comptroller.borrowCaps(VUSDC);
      const { minBorrowCap } = await executor.marketConfigs(VUSDC);

      // Below the configured floor — must revert.
      await expect(
        executor.connect(monitorSigner).handleCapAdjust(VUSDC, CAP_TYPE_BORROW, minBorrowCap.sub(1)),
      ).to.be.revertedWithCustomError(executor, "CapBelowMinimum");

      // Tighten within bounds.
      const newCap = currentCap.sub(1);
      await expect(executor.connect(monitorSigner).handleCapAdjust(VUSDC, CAP_TYPE_BORROW, newCap))
        .to.emit(executor, "CapAdjusted")
        .withArgs(SIGNAL_MONITOR, VUSDC, CAP_TYPE_BORROW, currentCap, newCap);

      expect(await comptroller.borrowCaps(VUSDC)).to.equal(newCap);
    });

    it("handleCapAdjust(SUPPLY) lowers the supply cap on the Comptroller and rejects below minSupplyCap", async () => {
      const currentCap: BigNumber = await comptroller.supplyCaps(VUSDC);
      const { minSupplyCap } = await executor.marketConfigs(VUSDC);

      await expect(
        executor.connect(monitorSigner).handleCapAdjust(VUSDC, CAP_TYPE_SUPPLY, minSupplyCap.sub(1)),
      ).to.be.revertedWithCustomError(executor, "CapBelowMinimum");

      const newCap = currentCap.sub(1);
      await expect(executor.connect(monitorSigner).handleCapAdjust(VUSDC, CAP_TYPE_SUPPLY, newCap))
        .to.emit(executor, "CapAdjusted")
        .withArgs(SIGNAL_MONITOR, VUSDC, CAP_TYPE_SUPPLY, currentCap, newCap);

      expect(await comptroller.supplyCaps(VUSDC)).to.equal(newCap);
    });

    it("handleSupplyCapExceeding reverts with CapNotBreached on a healthy market", async () => {
      await expect(executor.connect(monitorSigner).handleSupplyCapExceeding(VUSDC)).to.be.revertedWithCustomError(
        executor,
        "CapNotBreached",
      );
    });

    it("handleBorrowCapExceeding reverts with CapNotBreached on a healthy market", async () => {
      await expect(executor.connect(monitorSigner).handleBorrowCapExceeding(VUSDC)).to.be.revertedWithCustomError(
        executor,
        "CapNotBreached",
      );
    });

    it("handler reverts with MarketDisabled once config.enabled is flipped off", async () => {
      const { minBorrowCap, minSupplyCap } = await executor.marketConfigs(VUSDC);
      await executor
        .connect(criticalTimelockSigner)
        .setMarketConfig(VUSDC, { minBorrowCap, minSupplyCap, enabled: false });

      await expect(executor.connect(monitorSigner).handleLTVAdjust(VUSDC, 0)).to.be.revertedWithCustomError(
        executor,
        "MarketDisabled",
      );
    });
  });

  describe("Post-VIP behaviour — treasury transfer", () => {
    it("treasury USDT balance decreased by 25,000 USDT", async () => {
      expect(await usdt.balanceOf(VTREASURY)).to.equal(treasuryUsdtBefore.sub(USDT_AMOUNT));
    });

    it("Flux marketing wallet received 25,000 USDT", async () => {
      expect(await usdt.balanceOf(FLUX_MARKETING_WALLET)).to.equal(fluxWalletUsdtBefore.add(USDT_AMOUNT));
    });
  });
});
