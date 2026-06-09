import { TransactionResponse } from "@ethersproject/providers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents, initMainnetUser, pinResilientOraclePriceViaRedstone } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import CHAINLINK_ORACLE_ABI from "../../src/vip-framework/abi/chainlinkOracle.json";
import vip630, { ASSETS_TO_ENABLE, DEVIATION_BOUNDED_ORACLE, NEW_ASSET_CONFIGS } from "../../vips/vip-630/bscmainnet";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 103018310;

const ONE_E18 = BigNumber.from(10).pow(18);

// All 5 newly-configured assets are stablecoins, so they bypass the VIP-617 CF-derived
// formula and use a flat, tight trigger (resetThreshold 2% < trigger).
const STABLECOIN_TRIGGER = BigNumber.from("50000000000000000"); // 5%
const STABLECOINS = new Set(["DAI", "FDUSD", "lisUSD", "sUSDe", "USDe"]);

// Assets already enabled before this VIP: TRX (enabled in VIP-617, the DBO deploy
// VIP) plus AAVE, ADA, BCH, DOGE, LINK, LTC, TWT and UNI (enabled in VIP-626).
// These must remain enabled and untouched across VIP-630.
const ALREADY_ENABLED = [
  { name: "AAVE", asset: "0xfb6115445Bff7b52FeB98650C87f44907E58f802" },
  { name: "ADA", asset: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47" },
  { name: "BCH", asset: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf" },
  { name: "DOGE", asset: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43" },
  { name: "LINK", asset: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD" },
  { name: "LTC", asset: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94" },
  { name: "TRX", asset: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3" },
  { name: "TWT", asset: "0x4B0F1812e5Df2A09796481Ff14017e6005508003" },
  { name: "UNI", asset: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1" },
];

// Every asset this VIP newly enables: the 15 flipped via setAssetBoundedPricingEnabled
// plus the 5 configured-and-enabled in the same setTokenConfigs call.
const NEWLY_ENABLED = [...ASSETS_TO_ENABLE, ...NEW_ASSET_CONFIGS];

forking(FORK_BLOCK, async () => {
  const provider = ethers.provider;

  let dbo: Contract;
  let resilient: Contract;

  before(async () => {
    dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, provider);
    resilient = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

    // Fork-only oracle freshness fix. The governance flow mines days past the
    // real-world feed heartbeats, so the window-seeding getPrice() calls during
    // execution (and the post-VIP reads) would otherwise revert as stale.
    //
    // We don't need the production feed paths here, so for every asset we hard-pin
    // the price at the live spot via Redstone: this rewrites each token config to
    // a single MAIN=Redstone feed (PIVOT/FALLBACK disabled) and freezes the price,
    // which survives the time-advance.
    for (const c of NEWLY_ENABLED) {
      await pinResilientOraclePriceViaRedstone(resilient, c.asset);
    }
  });

  // ────────────────────────────────────────────────────────────────────
  // Pre-VIP state
  // ────────────────────────────────────────────────────────────────────
  describe("Pre-VIP state", () => {
    it("the 5 newly-configured assets have no DBO token config yet", async () => {
      for (const c of NEW_ASSET_CONFIGS) {
        const cfg = await dbo.assetProtectionConfig(c.asset);
        expect(cfg.asset, `${c.name}.asset`).to.equal(ethers.constants.AddressZero);
        expect(cfg.cooldownPeriod, `${c.name}.cooldownPeriod`).to.equal(0);
        expect(cfg.isBoundedPricingEnabled, `${c.name}.isBoundedPricingEnabled`).to.equal(false);
      }
    });

    it("all target assets have isBoundedPricingEnabled === false", async () => {
      for (const c of ASSETS_TO_ENABLE) {
        expect(await dbo.isBoundedPricingEnabled(c.asset), `${c.name}.isBoundedPricingEnabled`).to.equal(false);
      }
    });

    it("the 9 already-enabled assets are enabled", async () => {
      for (const c of ALREADY_ENABLED) {
        expect(await dbo.isBoundedPricingEnabled(c.asset), `${c.name}.isBoundedPricingEnabled`).to.equal(true);
      }
    });

    it("getAllBoundedPricingEnabledAssets() returns exactly the 9 already-enabled assets", async () => {
      const enabled: string[] = await dbo.getAllBoundedPricingEnabledAssets();
      expect(enabled.length).to.equal(ALREADY_ENABLED.length);
    });
  });

  testVip("VIP-630 Enable bounded pricing for the remaining Core Pool assets", await vip630(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // setTokenConfigs emits one BoundedPricingWhitelistUpdated per newly-configured
      // asset (5), and setAssetBoundedPricingEnabled emits one per enabled asset (15) — 20 total.
      await expectEvents(
        txResponse,
        [DBO_ABI],
        ["BoundedPricingWhitelistUpdated"],
        [ASSETS_TO_ENABLE.length + NEW_ASSET_CONFIGS.length],
      );
    },
  });

  // ────────────────────────────────────────────────────────────────────
  // Post-VIP state
  // ────────────────────────────────────────────────────────────────────
  describe("Post-VIP state", () => {
    describe("New token configs", () => {
      it("DAI, FDUSD, lisUSD, sUSDe, USDe are configured with the expected parameters", async () => {
        for (const c of NEW_ASSET_CONFIGS) {
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.asset.toLowerCase(), `${c.name}.asset`).to.equal(c.asset.toLowerCase());
          expect(cfg.cooldownPeriod, `${c.name}.cooldownPeriod`).to.equal(c.cooldownPeriod);
          expect(cfg.triggerThreshold, `${c.name}.triggerThreshold`).to.equal(BigNumber.from(c.triggerThreshold));
          expect(cfg.resetThreshold, `${c.name}.resetThreshold`).to.equal(BigNumber.from(c.resetThreshold));
          expect(cfg.cachingEnabled, `${c.name}.cachingEnabled`).to.equal(c.cachingEnabled);
          expect(cfg.isBoundedPricingEnabled, `${c.name}.isBoundedPricingEnabled`).to.equal(c.isBoundedPricingEnabled);
        }
      });

      // All 5 newly-configured assets are stablecoins, so each gets the flat 5% trigger.
      it("triggerThreshold per new asset is the flat 5% stablecoin trigger", async () => {
        for (const c of NEW_ASSET_CONFIGS) {
          expect(STABLECOINS.has(c.name), `${c.name} expected to be a stablecoin`).to.equal(true);
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.triggerThreshold, `${c.name}.triggerThreshold (vToken=${c.vToken})`).to.equal(STABLECOIN_TRIGGER);
        }
      });
    });

    describe("Whitelist flipped", () => {
      it("every target asset now has isBoundedPricingEnabled === true", async () => {
        for (const c of NEWLY_ENABLED) {
          expect(await dbo.isBoundedPricingEnabled(c.asset), `${c.name}.isBoundedPricingEnabled`).to.equal(true);
        }
      });

      it("getAllBoundedPricingEnabledAssets() returns the 9 prior + 20 newly-enabled (15 flipped + 5 newly-configured) assets", async () => {
        const enabled: string[] = await dbo.getAllBoundedPricingEnabledAssets();
        expect(enabled.length).to.equal(ALREADY_ENABLED.length + NEWLY_ENABLED.length);
        const set = new Set(enabled.map(a => a.toLowerCase()));
        for (const c of NEWLY_ENABLED) {
          expect(set.has(c.asset.toLowerCase()), `${c.name} (${c.asset}) missing from enabled set`).to.equal(true);
        }
      });
    });

    describe("Window reset on enable", () => {
      it("each newly-enabled asset has minPrice == maxPrice == current spot, protection inactive", async () => {
        for (const c of NEWLY_ENABLED) {
          const spot: BigNumber = await resilient.getPrice(c.asset);
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.minPrice, `${c.name}.minPrice`).to.equal(spot);
          expect(cfg.maxPrice, `${c.name}.maxPrice`).to.equal(spot);
          expect(cfg.currentlyUsingProtectedPrice, `${c.name}.currentlyUsingProtectedPrice`).to.equal(false);
        }
      });

      it("each newly-enabled asset still returns (spot, spot) — no protection armed yet", async () => {
        for (const c of NEWLY_ENABLED) {
          const spot: BigNumber = await resilient.getUnderlyingPrice(c.vToken);
          const [coll, debt] = await dbo.getBoundedPricesView(c.vToken);
          expect(coll, `${c.name}.collateralPrice`).to.equal(spot);
          expect(debt, `${c.name}.debtPrice`).to.equal(spot);
        }
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // E2E — bounded-pricing lifecycle, run against every newly-enabled asset.
  //
  // The `before` above leaves each asset with only its Redstone MAIN feed enabled,
  // so a single redstone.setDirectPrice call fully drives the spot the DBO reads —
  // no need to touch the ResilientOracle again. Every asset in this VIP is 18
  // decimals, so the ResilientOracle price passes straight through to Redstone.
  //
  // The spike is sized off each asset's on-chain triggerThreshold (+50% buffer) so
  // protection always arms regardless of the per-asset threshold.
  // ────────────────────────────────────────────────────────────────────

  // DBO keeper — granted the keeper-action permissions in VIP-617, so it can drive
  // the protection lifecycle (updateProtectionState / updateMin|MaxPrice / exit).
  const KEEPER = "0xa44eb88198a7a94dc6d2507bc0e5a216c2410d79";

  const runLifecycleE2E = ({ name, asset, vToken }: { name: string; asset: string; vToken: string }) => {
    describe(`E2E — bounded pricing on ${name}`, () => {
      let redstone: Contract;
      let timelockSigner: Awaited<ReturnType<typeof initMainnetUser>>;
      let keeperSigner: Awaited<ReturnType<typeof initMainnetUser>>;
      let originalSpot: BigNumber;
      let pumpTarget: BigNumber;
      let crashTarget: BigNumber;
      let outerSnapshot: string;

      // Write a spot price via Redstone, return the realized spot.
      const setSpot = async (target: BigNumber): Promise<BigNumber> => {
        await redstone.connect(timelockSigner).setDirectPrice(asset, target);
        return resilient.getPrice(asset);
      };

      before(async () => {
        outerSnapshot = await provider.send("evm_snapshot", []);
        timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        keeperSigner = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
        redstone = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);

        // Pin Redstone to the live spot so subsequent moves are deterministic.
        originalSpot = await setSpot(await resilient.getPrice(asset));

        // Size the spike past triggerThreshold with a 50% buffer so protection always
        // arms; cap the downward move so the crashed price stays positive.
        const dev = BigNumber.from((await dbo.assetProtectionConfig(asset)).triggerThreshold).add(
          ethers.utils.parseEther("0.5"),
        );
        const downDev = dev.gt(ethers.utils.parseEther("0.99")) ? ethers.utils.parseEther("0.99") : dev;
        pumpTarget = originalSpot.mul(ONE_E18.add(dev)).div(ONE_E18);
        crashTarget = originalSpot.mul(ONE_E18.sub(downDev)).div(ONE_E18);
      });

      after(async () => {
        await provider.send("evm_revert", [outerSnapshot]);
      });

      it("1. with protection inactive, bounded pricing returns spot on both sides", async () => {
        const [coll, debt] = await dbo.getBoundedPricesView(vToken);
        expect(coll).to.equal(originalSpot);
        expect(debt).to.equal(originalSpot);
        expect(await dbo.currentlyUsingProtectedPrice(asset)).to.equal(false);
      });

      it("2. an upward spike arms protection — debt stays above spot, collateral tracks spot", async () => {
        const snapshot = await provider.send("evm_snapshot", []);

        const pumpedSpot = await setSpot(pumpTarget);
        await expect(dbo.connect(keeperSigner).updateProtectionState(vToken)).to.emit(dbo, "ProtectionTriggered");
        expect(await dbo.currentlyUsingProtectedPrice(asset)).to.equal(true);

        // Spot retreats to the original level; the latched maxPrice stays at the peak.
        await setSpot(originalSpot);
        const liveSpot = await resilient.getPrice(asset);
        const [coll, debt] = await dbo.getBoundedPricesView(vToken);
        // debt = max(spot, maxPrice) = max(original, pumped) = pumped > spot
        expect(debt).to.equal(pumpedSpot);
        expect(debt).to.be.gt(liveSpot);
        // collateral = min(spot, minPrice); the upward move never lowered minPrice, so it tracks spot
        expect(coll).to.equal(liveSpot);

        await provider.send("evm_revert", [snapshot]);
      });

      it("3. a downward spike arms protection — collateral stays below spot, debt tracks spot", async () => {
        const snapshot = await provider.send("evm_snapshot", []);

        const crashedSpot = await setSpot(crashTarget);
        await expect(dbo.connect(keeperSigner).updateProtectionState(vToken)).to.emit(dbo, "ProtectionTriggered");
        expect(await dbo.currentlyUsingProtectedPrice(asset)).to.equal(true);

        // Spot recovers to the original level; the latched minPrice stays at the trough.
        await setSpot(originalSpot);
        const liveSpot = await resilient.getPrice(asset);
        const [coll, debt] = await dbo.getBoundedPricesView(vToken);
        // collateral = min(spot, minPrice) = min(original, crashed) = crashed < spot
        expect(coll).to.equal(crashedSpot);
        expect(coll).to.be.lt(liveSpot);
        // debt = max(spot, maxPrice); the downward move never raised maxPrice, so it tracks spot
        expect(debt).to.equal(liveSpot);

        await provider.send("evm_revert", [snapshot]);
      });

      it("4. after protection is exited, bounded pricing returns spot again — though min/max stay stored", async () => {
        const snapshot = await provider.send("evm_snapshot", []);

        // Arm protection with an upward spike.
        await setSpot(pumpTarget);
        await dbo.connect(keeperSigner).updateProtectionState(vToken);
        expect(await dbo.currentlyUsingProtectedPrice(asset)).to.equal(true);

        // Keeper narrows the window around the restored spot, the cooldown elapses, then exits.
        // The ±0.5% band gives a (max-min)/min spread of ~1.005%, which converges within the
        // 2% stablecoin resetThreshold used across this VIP. A ±1% band would be a ~2.02%
        // spread and exceed that 2% reset.
        await setSpot(originalSpot);
        const tightMin = originalSpot.mul(995).div(1000);
        const tightMax = originalSpot.mul(1005).div(1000);
        await dbo.connect(keeperSigner).updateMinPrice(asset, tightMin);
        await dbo.connect(keeperSigner).updateMaxPrice(asset, tightMax);

        const cfgBeforeExit = await dbo.assetProtectionConfig(asset);
        await time.increase(BigNumber.from(cfgBeforeExit.cooldownPeriod).toNumber() + 1);
        await dbo.connect(keeperSigner).exitProtectionMode(asset);
        expect(await dbo.currentlyUsingProtectedPrice(asset)).to.equal(false);

        // Protection inactive → the view bypasses the window and returns (spot, spot)...
        const liveSpot = await resilient.getPrice(asset);
        const [coll, debt] = await dbo.getBoundedPricesView(vToken);
        expect(coll).to.equal(liveSpot);
        expect(debt).to.equal(liveSpot);
        // ...even though exit only clears the flag, leaving the narrowed window in storage.
        const cfgAfterExit = await dbo.assetProtectionConfig(asset);
        expect(cfgAfterExit.minPrice).to.equal(tightMin);
        expect(cfgAfterExit.maxPrice).to.equal(tightMax);

        await provider.send("evm_revert", [snapshot]);
      });
    });
  };

  // Run the full lifecycle against every asset this VIP newly enables.
  for (const c of NEWLY_ENABLED) {
    runLifecycleE2E(c);
  }
});
