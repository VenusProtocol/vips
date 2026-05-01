import { TransactionResponse } from "@ethersproject/providers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  pinResilientOraclePriceViaRedstone,
  setMaxStalePeriod,
  setMaxStalePeriodForAllAssets,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";
import CHAINLINK_ORACLE_ABI from "src/vip-framework/abi/chainlinkOracle.json";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import VTOKEN_ABI from "src/vip-framework/abi/vToken.json";

import vip665, {
  ASSET_CONFIGS,
  COMPTROLLER_DBO_SETTER,
  COMPTROLLER_LENS,
  DBO_GOVERNANCE_FUNCTIONS_3TL,
  DBO_GOVERNANCE_FUNCTIONS_3TL_GUARDIAN,
  DBO_KEEPER_FUNCTIONS,
  DEVIATION_BOUNDED_ORACLE,
  KEEPER,
  KEEPER_CALLERS,
  TIMELOCKS,
  UNITROLLER_IMPLEMENTATION,
  VAI_CONTROLLER_IMPL,
} from "../../vips/vip-665/bscmainnet";
import { cutParams } from "../../vips/vip-665/utils/cut-params-bscmainnet.json";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import VAI_UNITROLLER_ABI from "./abi/VAIUnitroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const {
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  GUARDIAN,
  ACCESS_CONTROL_MANAGER,
  UNITROLLER,
  VAI_UNITROLLER,
} = bscmainnet;

const FORK_BLOCK = 95609070;
const SUPPORTER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";

// Step 1 grants: 4×3 (3TL) + 2×4 (3TL+G) + 4×5 (3TL+G+K) + 1×2 (Normal+G) = 42
// + 1 extra RoleGranted from grantRole(DEFAULT_ADMIN_ROLE, ACMCommandsAggregator) = 43
const EXPECTED_ROLE_GRANTED_EVENTS = 43;

const SET_DBO_SELECTOR = ethers.utils.id("setDeviationBoundedOracle(address)").slice(0, 10);
// Hardcoded from the ADD entry in cut-params-bscmainnet.json: the SetterFacet address
// that gains the new setDeviationBoundedOracle selector.
const SETTER_FACET = "0x4a45FBAf2A736bdF025DEd1D0Af3dF80070EDac0";

// BSC mainnet ACM exposes hasRole(bytes32, address) only; role = keccak256(packed target+sig).
const roleHash = (target: string, signature: string): string =>
  ethers.utils.keccak256(ethers.utils.solidityPack(["address", "string"], [target, signature]));

const getAssetConfig = (name: string): { asset: string; vToken: string } => {
  const cfg = ASSET_CONFIGS.find(c => c.name === name);
  if (!cfg) throw new Error(`Asset "${name}" not present in asset-configs-bscmainnet.json`);
  return { asset: cfg.asset, vToken: cfg.vToken };
};
const getAsset = (name: string): string => getAssetConfig(name).asset;
const ETH_ASSET = getAssetConfig("ETH").asset;
const ETH_VTOKEN = getAssetConfig("ETH").vToken;
const TRX_UNDERLYING = getAssetConfig("TRX").asset;
const TRX_VTOKEN = getAssetConfig("TRX").vToken;

type Signer = Awaited<ReturnType<typeof initMainnetUser>>;

// Fixed VIP-1 rollout parameters.
const FIXED_COOLDOWN = 3600; // 1h
const FIXED_RESET_THRESHOLD = BigNumber.from("50000000000000000"); // 5%
const TRIGGER_DEFAULT_BORROW_ONLY = BigNumber.from("166700000000000000"); // 16.67% — used when CF=0

// triggerThreshold = ((1/LTV) - 1) / 2  →  (1e36/cf - 1e18) / 2
const ONE_E18 = BigNumber.from(10).pow(18);
const ONE_E36 = BigNumber.from(10).pow(36);
const triggerFromCF = (cf: BigNumber): BigNumber => ONE_E36.div(cf).sub(ONE_E18).div(2);

forking(FORK_BLOCK, async () => {
  const provider = ethers.provider;

  let comptroller: Contract;
  let acm: Contract;
  let dbo: Contract;
  let vaiUnitroller: Contract;

  let oldComptrollerLens: string;
  let oldVaiImpl: string;
  let oldDiamondImpl: string;
  let oldFacetAddresses: string[];
  let oldSelectorsByFacet: Record<string, string[]>;

  // V1 storage slots — must remain unchanged through V19 upgrade.
  // Restricted to getters confirmed exposed on the pre-VIP Diamond; most newer
  // Comptroller fields (e.g. liquidationIncentiveMantissa, protocolPaused) are
  // only added by this VIP's facet replacement and would revert if probed early.
  let oldAdmin: string;
  let oldCloseFactorMantissa: BigNumber;
  let oldMaxAssets: BigNumber;
  let oldPendingAdmin: string;
  let oldEthMarket: { isListed: boolean; collateralFactorMantissa: BigNumber };

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
    acm = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, provider);
    dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, provider);
    vaiUnitroller = new ethers.Contract(VAI_UNITROLLER, VAI_UNITROLLER_ABI, provider);

    oldComptrollerLens = await comptroller.comptrollerLens();
    oldVaiImpl = await vaiUnitroller.vaiControllerImplementation();
    oldDiamondImpl = await comptroller.comptrollerImplementation();
    oldFacetAddresses = [...(await comptroller.facetAddresses())];

    oldSelectorsByFacet = {};
    for (const facet of oldFacetAddresses) {
      oldSelectorsByFacet[facet] = [...(await comptroller.facetFunctionSelectors(facet))];
    }

    oldAdmin = await comptroller.admin();
    oldCloseFactorMantissa = await comptroller.closeFactorMantissa();
    oldMaxAssets = await comptroller.maxAssets();
    oldPendingAdmin = await comptroller.pendingAdmin();
    const ethVToken = ASSET_CONFIGS.find(c => c.name === "ETH")!.vToken;
    const m = await comptroller.markets(ethVToken);
    oldEthMarket = { isListed: m.isListed, collateralFactorMantissa: m.collateralFactorMantissa };

    // Stretch every DBO-configured asset's resilient-oracle freshness window
    // out to 1y on the fork. The proposal lifecycle (propose→queue→execute)
    // mines blocks past real-world heartbeats, so a CF/price check during
    // execution would otherwise revert with "invalid resilient oracle price".
    // Fork-only — does not become part of the on-chain VIP.
    const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    const assetContracts = await Promise.all(ASSET_CONFIGS.map(c => ethers.getContractAt(ERC20_ABI, c.asset)));
    await setMaxStalePeriodForAllAssets(resilientOracle, assetContracts);

    // SolvBTC, xSolvBTC, and TWT use feeds that enforce their own internal
    // staleness window — the check lives inside the feed contract itself, not in
    // the ResilientOracle config that setMaxStalePeriod writes to. Bumping the
    // ResilientOracle's freshness window therefore has no effect on these feeds,
    // and they still revert as stale across the proposal lifecycle. Rewrite their
    // token configs fork-side to a Redstone-only feed pinned at the live spot.
    const REDSTONE_PIN_ASSETS = [getAsset("SolvBTC"), getAsset("xSolvBTC"), getAsset("TWT")];
    for (const asset of REDSTONE_PIN_ASSETS) {
      await pinResilientOraclePriceViaRedstone(resilientOracle, asset);
    }
  });

  describe("Pre-VIP state", () => {
    describe("Step 1 — ACM permissions are NOT yet granted", () => {
      it("3-timelock governance setters are not callable by any timelock", async () => {
        for (const sig of DBO_GOVERNANCE_FUNCTIONS_3TL) {
          const role = roleHash(DEVIATION_BOUNDED_ORACLE, sig);
          for (const caller of TIMELOCKS) {
            expect(
              await acm.hasRole(role, caller),
              `${caller} should NOT be allowed to call ${sig} on DBO pre-VIP`,
            ).to.equal(false);
          }
        }
      });

      it("3TL+Guardian setters are not callable by timelocks or guardian", async () => {
        for (const sig of DBO_GOVERNANCE_FUNCTIONS_3TL_GUARDIAN) {
          const role = roleHash(DEVIATION_BOUNDED_ORACLE, sig);
          for (const caller of [...TIMELOCKS, GUARDIAN]) {
            expect(await acm.hasRole(role, caller)).to.equal(false);
          }
        }
      });

      it("keeper actions are not callable by 3 timelocks + Guardian + Keeper", async () => {
        for (const sig of DBO_KEEPER_FUNCTIONS) {
          const role = roleHash(DEVIATION_BOUNDED_ORACLE, sig);
          for (const caller of KEEPER_CALLERS) {
            expect(
              await acm.hasRole(role, caller),
              `${caller} should NOT be allowed to call ${sig} on DBO pre-VIP`,
            ).to.equal(false);
          }
        }
      });

      it("setDeviationBoundedOracle is not callable by Normal or Guardian", async () => {
        const role = roleHash(UNITROLLER, COMPTROLLER_DBO_SETTER);
        for (const caller of [NORMAL_TIMELOCK, GUARDIAN]) {
          expect(await acm.hasRole(role, caller)).to.equal(false);
        }
      });
    });

    describe("Steps 2–5 — Comptroller / VAI upgrades have NOT been applied", () => {
      it("Unitroller does not yet point at the new Diamond implementation", async () => {
        expect(oldDiamondImpl).to.not.equal(UNITROLLER_IMPLEMENTATION);
      });

      it("setDeviationBoundedOracle selector resolves to the zero address", async () => {
        const facet = await comptroller.facetAddress(SET_DBO_SELECTOR);
        expect(facet.facetAddress).to.equal(ethers.constants.AddressZero);
      });

      it("current comptrollerLens is NOT the newly deployed one", async () => {
        expect(oldComptrollerLens).to.not.equal(COMPTROLLER_LENS);
      });

      it("VaiUnitroller does not yet point at the new implementation", async () => {
        expect(oldVaiImpl).to.not.equal(VAI_CONTROLLER_IMPL);
      });
    });

    describe("Steps 6–7 — DBO wiring has NOT happened yet", () => {
      it("DBO pendingOwner is the normal timelock", async () => {
        expect(await dbo.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      });

      it("DBO owner is not yet the normal timelock", async () => {
        expect(await dbo.owner()).to.not.equal(NORMAL_TIMELOCK);
      });

      it("Comptroller.deviationBoundedOracle() reverts — selector not installed pre-cut", async () => {
        await expect(comptroller.deviationBoundedOracle()).to.be.reverted;
      });
    });

    describe("Step 8 — DBO has no initialized assets yet", () => {
      it("getInitializedAssets() is empty", async () => {
        expect((await dbo.getInitializedAssets()).length).to.equal(0);
      });
    });
  });

  testVip("VIP-665 DBO Rollout on BSC mainnet", await vip665(), {
    supporter: SUPPORTER,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // Step 1 — ACM grants (BSC mainnet ACM emits OZ RoleGranted, not PermissionGranted)
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [EXPECTED_ROLE_GRANTED_EVENTS]);

      // Steps 2 + 5 — Unitroller & VAIController upgrades (each pair emits 1 NewImpl + 2 NewPendingImpl).
      // VaiUnitroller emits the same Comptroller-style event signatures, so a single ABI suffices —
      // adding VAI_UNITROLLER_ABI here would double-count any log that matches both ABIs.
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewImplementation", "NewPendingImplementation"], [2, 4]);

      // Step 3 — diamondCut
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);

      // Step 4 — ComptrollerLens swap
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewComptrollerLens"], [1]);

      // Step 6 — DBO ownership accept
      await expectEvents(txResponse, [DBO_ABI], ["OwnershipTransferred"], [1]);

      // Step 7 — DBO wired into Comptroller
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewDeviationBoundedOracle"], [1]);

      // Step 8 — one ProtectionInitialized + BoundedPricingWhitelistUpdated per asset
      const N = ASSET_CONFIGS.length;
      await expectEvents(txResponse, [DBO_ABI], ["ProtectionInitialized", "BoundedPricingWhitelistUpdated"], [N, N]);
    },
  });

  describe("Post-VIP state", () => {
    describe("Step 1 — ACM matrix matches the spec", () => {
      it("3-timelock governance setters callable by every timelock; not by Guardian/Keeper", async () => {
        for (const sig of DBO_GOVERNANCE_FUNCTIONS_3TL) {
          const role = roleHash(DEVIATION_BOUNDED_ORACLE, sig);
          for (const caller of TIMELOCKS) {
            expect(await acm.hasRole(role, caller)).to.equal(true);
          }
          for (const caller of [GUARDIAN, KEEPER]) {
            expect(await acm.hasRole(role, caller), `${caller} should NOT have ${sig} (3TL-only)`).to.equal(false);
          }
        }
      });

      it("3TL+Guardian setters callable by 3 timelocks + Guardian; not by Keeper", async () => {
        for (const sig of DBO_GOVERNANCE_FUNCTIONS_3TL_GUARDIAN) {
          const role = roleHash(DEVIATION_BOUNDED_ORACLE, sig);
          for (const caller of [...TIMELOCKS, GUARDIAN]) {
            expect(await acm.hasRole(role, caller)).to.equal(true);
          }
          expect(await acm.hasRole(role, KEEPER)).to.equal(false);
        }
      });

      it("keeper actions callable by 3 timelocks + Guardian + Keeper", async () => {
        for (const sig of DBO_KEEPER_FUNCTIONS) {
          const role = roleHash(DEVIATION_BOUNDED_ORACLE, sig);
          for (const caller of KEEPER_CALLERS) {
            expect(await acm.hasRole(role, caller), `${caller} should be allowed to call ${sig} on DBO`).to.equal(true);
          }
        }
      });

      it("setDeviationBoundedOracle callable by Normal + Guardian only", async () => {
        const role = roleHash(UNITROLLER, COMPTROLLER_DBO_SETTER);
        expect(await acm.hasRole(role, NORMAL_TIMELOCK)).to.equal(true);
        expect(await acm.hasRole(role, GUARDIAN)).to.equal(true);
        for (const caller of [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, KEEPER]) {
          expect(await acm.hasRole(role, caller), `${caller} should NOT have setDeviationBoundedOracle`).to.equal(
            false,
          );
        }
      });
    });

    describe("Steps 2–5 — Comptroller / VAI upgrades applied", () => {
      it("Unitroller points at the new Diamond implementation", async () => {
        expect(await comptroller.comptrollerImplementation()).to.equal(UNITROLLER_IMPLEMENTATION);
      });

      it("every selector in cutParams resolves to its new facet address", async () => {
        for (const [facetAddr, , selectors] of cutParams as [string, number, string[]][]) {
          for (const sel of selectors) {
            expect((await comptroller.facetAddress(sel)).facetAddress).to.equal(facetAddr);
          }
        }
      });

      it("setDeviationBoundedOracle selector is installed on the SetterFacet", async () => {
        const resolved = (await comptroller.facetAddress(SET_DBO_SELECTOR)).facetAddress;
        expect(resolved).to.equal(SETTER_FACET);
        const setterSels = await comptroller.facetFunctionSelectors(SETTER_FACET);
        expect(setterSels).to.include(SET_DBO_SELECTOR);
      });

      it("all old facet addresses have been replaced", async () => {
        for (const oldFacet of oldFacetAddresses) {
          const selectorsOnOldFacet = await comptroller.facetFunctionSelectors(oldFacet);
          expect(selectorsOnOldFacet).to.deep.equal([]);
        }
      });

      it("each old facet's selectors are preserved on its replacement (SetterFacet gains setDeviationBoundedOracle)", async () => {
        for (const [oldFacet, oldSels] of Object.entries(oldSelectorsByFacet)) {
          const newFacet = (await comptroller.facetAddress(oldSels[0])).facetAddress;
          const newSels = [...(await comptroller.facetFunctionSelectors(newFacet))].sort();
          const newSelsBaseline = newSels.filter(s => s !== SET_DBO_SELECTOR);
          expect(
            newSelsBaseline,
            `Selectors drifted between facet roles for old facet ${oldFacet} → new facet ${newFacet}`,
          ).to.deep.equal([...oldSels].sort());
        }
      });

      it("comptrollerLens points at the new contract", async () => {
        expect(await comptroller.comptrollerLens()).to.equal(COMPTROLLER_LENS);
      });

      it("VaiUnitroller points at the new implementation", async () => {
        expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(VAI_CONTROLLER_IMPL);
      });

      describe("Storage layout preserved across Diamond upgrade", () => {
        it("admin slot unchanged", async () => {
          expect(await comptroller.admin()).to.equal(oldAdmin);
        });

        it("closeFactorMantissa slot unchanged", async () => {
          expect(await comptroller.closeFactorMantissa()).to.equal(oldCloseFactorMantissa);
        });

        it("maxAssets slot unchanged", async () => {
          expect(await comptroller.maxAssets()).to.equal(oldMaxAssets);
        });

        it("pendingAdmin slot unchanged", async () => {
          expect(await comptroller.pendingAdmin()).to.equal(oldPendingAdmin);
        });

        it("markets[vETH] entry unchanged (isListed, collateralFactorMantissa)", async () => {
          const ethVToken = ASSET_CONFIGS.find(c => c.name === "ETH")!.vToken;
          const m = await comptroller.markets(ethVToken);
          expect(m.isListed).to.equal(oldEthMarket.isListed);
          expect(m.collateralFactorMantissa).to.equal(oldEthMarket.collateralFactorMantissa);
        });
      });
    });

    describe("Steps 6–7 — DBO wiring complete", () => {
      it("DBO owner is the normal timelock", async () => {
        expect(await dbo.owner()).to.equal(NORMAL_TIMELOCK);
      });

      it("DBO pendingOwner is cleared", async () => {
        expect(await dbo.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });

      it("Comptroller.deviationBoundedOracle() returns the deployed DBO", async () => {
        expect(await comptroller.deviationBoundedOracle()).to.equal(DEVIATION_BOUNDED_ORACLE);
      });
    });

    describe("Step 8 — Asset configs seeded", () => {
      it("getInitializedAssets() returns every configured asset", async () => {
        const initialized = await dbo.getInitializedAssets();
        expect(initialized.length).to.equal(ASSET_CONFIGS.length);
        const set = new Set(initialized.map((a: string) => a.toLowerCase()));
        for (const c of ASSET_CONFIGS) {
          expect(set.has(c.asset.toLowerCase()), `${c.name} (${c.asset}) missing from getInitializedAssets`).to.equal(
            true,
          );
        }
      });

      it("every asset has cooldownPeriod=3600 (1H) and resetThreshold=5%", async () => {
        for (const c of ASSET_CONFIGS) {
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.cooldownPeriod, `${c.name}.cooldownPeriod`).to.equal(FIXED_COOLDOWN);
          expect(cfg.resetThreshold, `${c.name}.resetThreshold`).to.equal(FIXED_RESET_THRESHOLD);
          expect(cfg.currentlyUsingProtectedPrice, `${c.name}.currentlyUsingProtectedPrice`).to.equal(false);
        }
      });

      // Borrow-only markets (CF=0) use the 16.67% default since the formula is undefined for LTV=0.
      it("triggerThreshold per asset matches ((1/LTV)-1)/2 from live Comptroller CF", async () => {
        for (const c of ASSET_CONFIGS) {
          const market = await comptroller.markets(c.vToken);
          const cf: BigNumber = market.collateralFactorMantissa;
          const expected = cf.isZero() ? TRIGGER_DEFAULT_BORROW_ONLY : triggerFromCF(cf);
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.triggerThreshold, `${c.name}.triggerThreshold (vToken=${c.vToken}, CF=${cf.toString()})`).to.equal(
            expected,
          );
        }
      });

      it("vTRX is the only asset with isBoundedPricingEnabled=true; all others false", async () => {
        for (const c of ASSET_CONFIGS) {
          const expected = c.asset.toLowerCase() === TRX_UNDERLYING.toLowerCase();
          expect(await dbo.isBoundedPricingEnabled(c.asset), `${c.name}.isBoundedPricingEnabled`).to.equal(expected);
        }
      });

      it("cachingEnabled is false for every asset", async () => {
        for (const c of ASSET_CONFIGS) {
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.cachingEnabled, `${c.name}.cachingEnabled`).to.equal(false);
        }
      });
    });

    // Wrapped in evm_snapshot/evm_revert because the tests in this block
    // mutate DBO state (setCooldownPeriod, setAssetBoundedPricingEnabled,
    // updateMaxPrice). Without isolation those mutations leak into the
    // "DBO pass-through behaviour" and "Comptroller post-upgrade smoke"
    // blocks that follow, which assert against the VIP-seeded state.
    describe("Functional ACM verification", () => {
      let acmSnapshotId: string;
      before(async () => {
        acmSnapshotId = await provider.send("evm_snapshot", []);
      });
      after(async () => {
        await provider.send("evm_revert", [acmSnapshotId]);
      });

      it("Normal Timelock can call setCooldownPeriod (3TL governance)", async () => {
        const signer = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        await expect(dbo.connect(signer).setCooldownPeriod(ETH_ASSET, 7200)).to.not.be.reverted;
        const cfg = await dbo.assetProtectionConfig(ETH_ASSET);
        expect(cfg.cooldownPeriod).to.equal(7200);
      });

      it("Guardian can call setAssetBoundedPricingEnabled (3TL+G)", async () => {
        const signer = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
        // Toggle on→off so we end disabled regardless of starting flag.
        await dbo.connect(signer).setAssetBoundedPricingEnabled(ETH_ASSET, true);
        await dbo.connect(signer).setAssetBoundedPricingEnabled(ETH_ASSET, false);
        expect(await dbo.isBoundedPricingEnabled(ETH_ASSET)).to.equal(false);
      });

      it("Keeper can call updateMaxPrice (keeper band)", async () => {
        const keeperSigner = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
        const { maxPrice } = await dbo.assetProtectionConfig(ETH_ASSET);
        await expect(dbo.connect(keeperSigner).updateMaxPrice(ETH_ASSET, maxPrice)).to.not.be.reverted;
      });

      it("Random address CANNOT call any keeper function", async () => {
        const signer = await initMainnetUser(
          NETWORK_ADDRESSES.bscmainnet.GENERIC_TEST_USER_ACCOUNT,
          ethers.utils.parseEther("1"),
        );
        await expect(dbo.connect(signer).updateMinPrice(ETH_ASSET, 1)).to.be.reverted;
        await expect(dbo.connect(signer).updateMaxPrice(ETH_ASSET, 1)).to.be.reverted;
        await expect(dbo.connect(signer).exitProtectionMode(ETH_ASSET)).to.be.reverted;
      });

      it("Critical Timelock CANNOT call setDeviationBoundedOracle on Unitroller (Normal+Guardian only)", async () => {
        const signer = await initMainnetUser(CRITICAL_TIMELOCK, ethers.utils.parseEther("1"));
        await expect(comptroller.connect(signer).setDeviationBoundedOracle(DEVIATION_BOUNDED_ORACLE)).to.be.reverted;
      });
    });

    describe("DBO pass-through behaviour", () => {
      const resilientOracle = () =>
        new ethers.Contract(
          NETWORK_ADDRESSES.bscmainnet.RESILIENT_ORACLE,
          [
            "function getPrice(address asset) view returns (uint256)",
            "function getUnderlyingPrice(address vToken) view returns (uint256)",
          ],
          provider,
        );

      it("disabled assets: getBoundedPricesView returns (spot, spot) from ResilientOracle", async () => {
        const ro = resilientOracle();
        for (const c of ASSET_CONFIGS) {
          if (c.isBoundedPricingEnabled) continue;
          const spot: BigNumber = await ro.getUnderlyingPrice(c.vToken);
          const [collateral, debt] = await dbo.getBoundedPricesView(c.vToken);
          expect(collateral, `${c.name}.collateralPrice`).to.equal(spot);
          expect(debt, `${c.name}.debtPrice`).to.equal(spot);
        }
      });

      it("disabled assets: window seeded at spot (minPrice == maxPrice == spot, protection inactive)", async () => {
        const ro = resilientOracle();
        for (const c of ASSET_CONFIGS) {
          if (c.isBoundedPricingEnabled) continue;
          const spot: BigNumber = await ro.getPrice(c.asset);
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.minPrice, `${c.name}.minPrice`).to.equal(spot);
          expect(cfg.maxPrice, `${c.name}.maxPrice`).to.equal(spot);
          expect(cfg.currentlyUsingProtectedPrice, `${c.name}.currentlyUsingProtectedPrice`).to.equal(false);
        }
      });

      it("vTRX (enabled): window seeded at spot and getBoundedPricesView returns (spot, spot) at activation", async () => {
        const ro = resilientOracle();
        const spotAsset: BigNumber = await ro.getPrice(TRX_UNDERLYING);
        const spotVToken: BigNumber = await ro.getUnderlyingPrice(TRX_VTOKEN);
        const cfg = await dbo.assetProtectionConfig(TRX_UNDERLYING);
        expect(cfg.minPrice, "TRX.minPrice").to.equal(spotAsset);
        expect(cfg.maxPrice, "TRX.maxPrice").to.equal(spotAsset);
        expect(cfg.currentlyUsingProtectedPrice, "TRX.currentlyUsingProtectedPrice").to.equal(false);
        const [collateral, debt] = await dbo.getBoundedPricesView(TRX_VTOKEN);
        expect(collateral, "TRX.collateralPrice").to.equal(spotVToken);
        expect(debt, "TRX.debtPrice").to.equal(spotVToken);
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // E2E scenarios — full DBO lifecycle on a representative asset (ETH).
  //
  // Spot price is driven on the live ResilientOracle by writing into the
  // ChainlinkOracle (the MAIN oracle for ETH on BSC) via setDirectPrice.
  // PIVOT validation is disabled for ETH on the ResilientOracle so the
  // BoundValidator does not reject manipulated prices.
  //
  // The whole block is wrapped in evm_snapshot/evm_revert so it does not
  // leak fork state to anything that runs after it.
  // ────────────────────────────────────────────────────────────────────
  describe("E2E scenarios — DBO lifecycle on ETH", () => {
    const ORACLE_ROLE_PIVOT = 1;

    let chainlink: Contract;
    let resilient: Contract;
    let timelockSigner: Signer;
    let guardianSigner: Signer;
    let keeperSigner: Signer;
    let snapshotId: string;
    let originalEthSpot: BigNumber;

    before(async () => {
      snapshotId = await provider.send("evm_snapshot", []);

      chainlink = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      resilient = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

      timelockSigner = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      guardianSigner = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      keeperSigner = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));

      // Disable PIVOT for ETH so a deviated MAIN price is returned through.
      await resilient.connect(timelockSigner).enableOracle(ETH_ASSET, ORACLE_ROLE_PIVOT, false);

      // Pin ChainlinkOracle storage to the live spot. Chainlink is the MAIN
      // oracle for ETH on BSC, so setDirectPrice fully drives ResilientOracle's
      // reading; ETH is 18 decimals so the value passes through unchanged.
      // Once pinned, every subsequent price move in this block can be driven
      // by a single setDirectPrice call on Chainlink — no need to touch the
      // ResilientOracle or the underlying Chainlink aggregator separately.
      originalEthSpot = await resilient.getPrice(ETH_ASSET);
      await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, originalEthSpot);
      expect(await resilient.getPrice(ETH_ASSET)).to.equal(originalEthSpot);
    });

    after(async () => {
      await provider.send("evm_revert", [snapshotId]);
    });

    describe("E2E-1: default behaviour at activation", () => {
      it("every disabled asset has minPrice == maxPrice == spot and bounded == (spot, spot)", async () => {
        for (const c of ASSET_CONFIGS) {
          if (c.isBoundedPricingEnabled) continue;
          const spot: BigNumber = await resilient.getPrice(c.asset);
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.minPrice, `${c.name}.minPrice`).to.equal(spot);
          expect(cfg.maxPrice, `${c.name}.maxPrice`).to.equal(spot);
          expect(cfg.currentlyUsingProtectedPrice, `${c.name}.currentlyUsingProtectedPrice`).to.equal(false);

          const [collateral, debt] = await dbo.getBoundedPricesView(c.vToken);
          expect(collateral, `${c.name}.collateralPrice`).to.equal(spot);
          expect(debt, `${c.name}.debtPrice`).to.equal(spot);
        }
      });
    });

    describe("E2E-2: enable bounded pricing → trigger → divergence", () => {
      // 50% pump — well above the ~16.67% triggerThreshold seeded for ETH.
      let pumpedSpot: BigNumber;

      before(async () => {
        pumpedSpot = originalEthSpot.mul(150).div(100);
      });

      it("Guardian enables ETH whitelist; window seeds at current spot", async () => {
        await dbo.connect(guardianSigner).setAssetBoundedPricingEnabled(ETH_ASSET, true);
        const cfg = await dbo.assetProtectionConfig(ETH_ASSET);
        expect(cfg.minPrice).to.equal(originalEthSpot);
        expect(cfg.maxPrice).to.equal(originalEthSpot);
        expect(cfg.currentlyUsingProtectedPrice).to.equal(false);
        expect(await dbo.isBoundedPricingEnabled(ETH_ASSET)).to.equal(true);
      });

      it("oracle pump + updateProtectionState activates protection", async () => {
        // Pre-pump: spot == window bounds, deviation is zero, so getBoundedPricesView
        // is a pure passthrough — (spot, spot).
        const [collateralBefore, debtBefore] = await dbo.getBoundedPricesView(ETH_VTOKEN);
        expect(collateralBefore).to.equal(originalEthSpot);
        expect(debtBefore).to.equal(originalEthSpot);

        await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, pumpedSpot);
        expect(await resilient.getPrice(ETH_ASSET)).to.equal(pumpedSpot);

        // Pre-call storage: window still seeded at originalEthSpot and the protection
        // flag is unset — updateProtectionState has not run, so nothing has been latched.
        const cfgBefore = await dbo.assetProtectionConfig(ETH_ASSET);
        expect(cfgBefore.minPrice).to.equal(originalEthSpot);
        expect(cfgBefore.maxPrice).to.equal(originalEthSpot);
        expect(cfgBefore.currentlyUsingProtectedPrice).to.equal(false);

        const tx = await dbo.connect(keeperSigner).updateProtectionState(ETH_VTOKEN);
        await expect(tx).to.emit(dbo, "ProtectionTriggered");
        expect(await dbo.currentlyUsingProtectedPrice(ETH_ASSET)).to.equal(true);

        // Post-call storage: maxPrice latches to pumpedSpot, minPrice stays at originalEthSpot,
        // and currentlyUsingProtectedPrice is set so the whitelist can no longer be flipped off.
        const cfgAfter = await dbo.assetProtectionConfig(ETH_ASSET);
        expect(cfgAfter.minPrice).to.equal(originalEthSpot);
        expect(cfgAfter.maxPrice).to.equal(pumpedSpot);
        expect(cfgAfter.minPrice).to.not.equal(cfgAfter.maxPrice);

        // Post-call view: now clips. collateral = min(spot, minPrice) = min(pumped, original) = original;
        // debt = max(spot, maxPrice) = max(pumped, pumped) = pumped. The view has shifted away from
        // the pre-pump passthrough — collateral is pinned at the seed and debt tracks the pump.
        const [collateralAfter, debtAfter] = await dbo.getBoundedPricesView(ETH_VTOKEN);
        expect(collateralAfter).to.equal(originalEthSpot);
        expect(debtAfter).to.equal(pumpedSpot);
        expect(collateralAfter).to.equal(collateralBefore); // collateral unchanged: still pinned at original
        expect(debtAfter).to.not.equal(debtBefore); // debt diverged: original → pumped
      });

      it("getBoundedPricesView clips both sides — spot strictly between minPrice and maxPrice", async () => {
        // Dip spot below the pumped peak so three distinct prices are in play:
        //   originalEthSpot (low / minPrice) < dippedSpot (current) < pumpedSpot (high / maxPrice).
        // Without this, debt == spot trivially and the upper-bound clip isn't exercised.
        const dippedSpot = pumpedSpot.mul(95).div(100);
        await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, dippedSpot);
        expect(await resilient.getPrice(ETH_ASSET)).to.equal(dippedSpot);

        const cfg = await dbo.assetProtectionConfig(ETH_ASSET);
        // Window unchanged: min still at originalEthSpot, max latched at pumpedSpot from the trigger.
        expect(cfg.minPrice).to.equal(originalEthSpot);
        expect(cfg.maxPrice).to.equal(pumpedSpot);

        const [collateral, debt] = await dbo.getBoundedPricesView(ETH_VTOKEN);
        // collateral = min(spot, minPrice) = min(dipped, original) = original
        expect(collateral).to.equal(originalEthSpot);
        // debt = max(spot, maxPrice) = max(dipped, pumped) = pumped
        expect(debt).to.equal(pumpedSpot);
        // Both bounds diverge from the live ResilientOracle spot — clipping is doing
        // work on each side rather than passing spot through.
        const liveSpot = await resilient.getPrice(ETH_ASSET);
        expect(liveSpot).to.equal(dippedSpot);
        expect(collateral).to.not.equal(liveSpot);
        expect(debt).to.not.equal(liveSpot);
      });
    });

    describe("E2E-3: disable bounded pricing → spot fallback", () => {
      it("Guardian CANNOT flip whitelist off while protection is active", async () => {
        expect(await dbo.currentlyUsingProtectedPrice(ETH_ASSET)).to.equal(true);
        await expect(dbo.connect(guardianSigner).setAssetBoundedPricingEnabled(ETH_ASSET, false)).to.be.reverted;
        expect(await dbo.currentlyUsingProtectedPrice(ETH_ASSET)).to.equal(true);
      });

      it("keeper narrows window + cooldown elapses + exitProtectionMode succeeds", async () => {
        // Restore spot so keeper bounds (newMin ≤ spot, newMax ≥ spot) accept ±1%.
        await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, originalEthSpot);

        const tightMin = originalEthSpot.mul(99).div(100);
        const tightMax = originalEthSpot.mul(101).div(100);
        await dbo.connect(keeperSigner).updateMinPrice(ETH_ASSET, tightMin);
        await dbo.connect(keeperSigner).updateMaxPrice(ETH_ASSET, tightMax);

        // Pre-exit: window is still narrowed but offset from spot on both sides.
        const spotBeforeExit = await resilient.getPrice(ETH_ASSET);
        const cfgBeforeExit = await dbo.assetProtectionConfig(ETH_ASSET);
        expect(cfgBeforeExit.minPrice).to.equal(tightMin);
        expect(cfgBeforeExit.maxPrice).to.equal(tightMax);
        expect(cfgBeforeExit.minPrice).to.not.equal(spotBeforeExit);
        expect(cfgBeforeExit.maxPrice).to.not.equal(spotBeforeExit);

        await time.increase(BigNumber.from(cfgBeforeExit.cooldownPeriod).toNumber() + 1);

        await dbo.connect(keeperSigner).exitProtectionMode(ETH_ASSET);
        expect(await dbo.currentlyUsingProtectedPrice(ETH_ASSET)).to.equal(false);

        // Post-exit: protection inactive — bounded pricing bypasses the window and returns
        // (spot, spot). The keeper-set tightMin/tightMax remain in storage; exitProtectionMode
        // only clears the protection flag, it does not reset the window.
        const spotAfterExit = await resilient.getPrice(ETH_ASSET);
        const [collateralAfterExit, debtAfterExit] = await dbo.getBoundedPricesView(ETH_VTOKEN);
        expect(collateralAfterExit).to.equal(spotAfterExit);
        expect(debtAfterExit).to.equal(spotAfterExit);
      });

      it("Guardian flips ETH whitelist off (allowed because protection is inactive)", async () => {
        await dbo.connect(guardianSigner).setAssetBoundedPricingEnabled(ETH_ASSET, false);
        expect(await dbo.isBoundedPricingEnabled(ETH_ASSET)).to.equal(false);
      });

      it("subsequent oracle pump produces (spot, spot) — bounded pricing bypassed", async () => {
        const movedSpot = originalEthSpot.mul(2); // +100%, would clearly trigger if enabled
        await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, movedSpot);
        expect(await resilient.getPrice(ETH_ASSET)).to.equal(movedSpot);

        const [collateral, debt] = await dbo.getBoundedPricesView(ETH_VTOKEN);
        expect(collateral).to.equal(movedSpot);
        expect(debt).to.equal(movedSpot);

        // Whitelist is off, so the +100% move must not arm protection — confirms the
        // disable path actually short-circuits the trigger logic, not just the view.
        expect(await dbo.currentlyUsingProtectedPrice(ETH_ASSET)).to.equal(false);
      });
    });

    describe("E2E-4: oracle-driven update flow re-arms protection", () => {
      let priorTriggerTimestamp: BigNumber;
      let droppedSpot: BigNumber;

      it("re-enable resets window at current spot", async () => {
        await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, originalEthSpot);
        await dbo.connect(guardianSigner).setAssetBoundedPricingEnabled(ETH_ASSET, true);

        const cfg = await dbo.assetProtectionConfig(ETH_ASSET);
        expect(cfg.minPrice).to.equal(originalEthSpot);
        expect(cfg.maxPrice).to.equal(originalEthSpot);
        priorTriggerTimestamp = cfg.lastProtectionTriggeredAt;
      });

      it("oracle drop + updateProtectionState mutates state and re-activates protection", async () => {
        // 50% drop — well below the ~16.67% triggerThreshold seeded for ETH.
        // E2E-2 covered the upward-spike path; this exercises the symmetric downside.
        droppedSpot = originalEthSpot.mul(50).div(100);
        await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, droppedSpot);

        const tx = await dbo.connect(keeperSigner).updateProtectionState(ETH_VTOKEN);
        await expect(tx).to.emit(dbo, "ProtectionTriggered");

        const cfg = await dbo.assetProtectionConfig(ETH_ASSET);
        expect(cfg.currentlyUsingProtectedPrice).to.equal(true);
        expect(cfg.lastProtectionTriggeredAt).to.be.gt(priorTriggerTimestamp);
        // minPrice latches down to the dropped spot; maxPrice stays at originalEthSpot.
        expect(cfg.minPrice).to.equal(droppedSpot);
        expect(cfg.maxPrice).to.equal(originalEthSpot);
      });

      it("bounded prices reflect the new window — collateral pinned at dropped, debt at original", async () => {
        const [collateral, debt] = await dbo.getBoundedPricesView(ETH_VTOKEN);
        // collateral = min(spot, minPrice) = min(dropped, dropped) = dropped
        expect(collateral).to.equal(droppedSpot);
        // debt = max(spot, maxPrice) = max(dropped, original) = original
        expect(debt).to.equal(originalEthSpot);
      });
    });

    describe("E2E-5: multi-asset independence", () => {
      it("TRX state is unaffected by the ETH protection lifecycle", async () => {
        const trxCfg = await dbo.assetProtectionConfig(TRX_UNDERLYING);
        expect(trxCfg.currentlyUsingProtectedPrice, "TRX.currentlyUsingProtectedPrice").to.equal(false);
        expect(await dbo.isBoundedPricingEnabled(TRX_UNDERLYING), "TRX.isBoundedPricingEnabled").to.equal(true);
      });

      it("TRX bounded prices still pass through to spot — independent of ETH lifecycle", async () => {
        const spot: BigNumber = await resilient.getUnderlyingPrice(TRX_VTOKEN);
        const [collateral, debt] = await dbo.getBoundedPricesView(TRX_VTOKEN);
        expect(collateral, "TRX.collateralPrice").to.equal(spot);
        expect(debt, "TRX.debtPrice").to.equal(spot);
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // E2E scenarios — verify the core Comptroller still services the
  // standard lending operations after the Diamond + VAIController
  // upgrades and the new SetterFacet selector. Uses vETH (collateral)
  // and vUSDT (borrow) on the live core pool. The liquidation step
  // crashes ETH spot via ChainlinkOracle.setDirectPrice with PIVOT
  // disabled on the ResilientOracle so BoundValidator does not reject
  // the manipulated price. Wrapped in evm_snapshot/evm_revert.
  // ────────────────────────────────────────────────────────────────────
  describe("E2E scenarios — Comptroller core lending operations", () => {
    const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
    const USDT_ASSET = "0x55d398326f99059fF775485246999027B3197955";
    // Venus restricts vToken.liquidateBorrow to this contract; direct EOA calls return UNAUTHORIZED.
    const LIQUIDATOR_CONTRACT = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
    // ETH whale on BSC — supplies vETH and borrows vUSDT.
    const BORROWER = NETWORK_ADDRESSES.bscmainnet.GENERIC_ETH_ACCOUNT;
    // Binance hot wallet — holds USDT, used as the liquidator.
    const LIQUIDATOR = NETWORK_ADDRESSES.bscmainnet.GENERIC_TEST_USER_ACCOUNT;
    const ORACLE_ROLE_PIVOT = 1;

    let snapshotId: string;
    let veth: Contract;
    let vusdt: Contract;
    let eth: Contract;
    let usdt: Contract;
    let chainlink: Contract;
    let resilient: Contract;
    let borrowerSigner: Signer;
    let liquidatorSigner: Signer;
    let timelockSigner: Signer;
    let originalEthSpot: BigNumber;
    let usdtDecimals: number;
    let supplyAmount: BigNumber;
    let borrowAmount: BigNumber;

    before(async () => {
      snapshotId = await provider.send("evm_snapshot", []);

      timelockSigner = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      borrowerSigner = await initMainnetUser(BORROWER, ethers.utils.parseEther("1"));
      liquidatorSigner = await initMainnetUser(LIQUIDATOR, ethers.utils.parseEther("1"));

      veth = new ethers.Contract(ETH_VTOKEN, VTOKEN_ABI, provider);
      vusdt = new ethers.Contract(VUSDT, VTOKEN_ABI, provider);
      eth = new ethers.Contract(ETH_ASSET, ERC20_ABI, provider);
      usdt = new ethers.Contract(USDT_ASSET, ERC20_ABI, provider);
      chainlink = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      resilient = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

      usdtDecimals = await usdt.decimals();
      supplyAmount = ethers.utils.parseEther("1");
      borrowAmount = ethers.utils.parseUnits("100", usdtDecimals);

      // USDT isn't in ASSET_CONFIGS, so the outer `before` did not extend its
      // resilient-oracle staleness — the proposal lifecycle mines past its real
      // heartbeat and the borrow leg would revert with "invalid resilient oracle price".
      await setMaxStalePeriod(resilient, usdt);

      // Lift the USDT borrow cap so the borrow leg is not bounded by it.
      await comptroller
        .connect(timelockSigner)
        ._setMarketBorrowCaps([VUSDT], [ethers.utils.parseUnits("10000000000", usdtDecimals)]);

      // PIVOT must be off for ETH so the crashed Chainlink price flows
      // through the ResilientOracle during the liquidation step.
      await resilient.connect(timelockSigner).enableOracle(ETH_ASSET, ORACLE_ROLE_PIVOT, false);

      // Pin Chainlink storage to the live ETH spot — ETH is 18 decimals,
      // so setDirectPrice value passes through getPrice unchanged.
      originalEthSpot = await resilient.getPrice(ETH_ASSET);
      await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, originalEthSpot);
    });

    after(async () => {
      await provider.send("evm_revert", [snapshotId]);
    });

    it("mint: supplying ETH increases the borrower's vETH balance", async () => {
      const before = await veth.balanceOf(BORROWER);
      await eth.connect(borrowerSigner).approve(ETH_VTOKEN, supplyAmount);
      await veth.connect(borrowerSigner).mint(supplyAmount);
      expect(await veth.balanceOf(BORROWER)).to.be.gt(before);
    });

    it("borrow: enterMarkets + borrow transfers USDT to the borrower", async () => {
      await comptroller.connect(borrowerSigner).enterMarkets([ETH_VTOKEN]);
      const before = await usdt.balanceOf(BORROWER);
      await vusdt.connect(borrowerSigner).borrow(borrowAmount);
      expect(await usdt.balanceOf(BORROWER)).to.equal(before.add(borrowAmount));
    });

    it("redeem: redeemUnderlying returns ETH to the borrower", async () => {
      const redeemAmount = ethers.utils.parseEther("0.1");
      const before = await eth.balanceOf(BORROWER);
      await veth.connect(borrowerSigner).redeemUnderlying(redeemAmount);
      expect(await eth.balanceOf(BORROWER)).to.equal(before.add(redeemAmount));
    });

    // Mirrors Compound liquidity math: tokensToDenom = exchangeRate × CF × price / 1e36;
    // sumCollateral = tokensToDenom × vTokenBalance / 1e18; sumBorrows = borrowBalance × price / 1e18.
    // Returns the expected (sumCollateral − sumBorrows) at the live oracle prices.
    const expectedLiquidityDelta = async (): Promise<BigNumber> => {
      const ONE = ethers.constants.WeiPerEther;
      const [, ethVTokenBal, , ethExchangeRate] = await veth.getAccountSnapshot(BORROWER);
      const [, , usdtBorrowBal] = await vusdt.getAccountSnapshot(BORROWER);
      const ethCF = (await comptroller.markets(ETH_VTOKEN)).collateralFactorMantissa;
      const ethPrice = await resilient.getUnderlyingPrice(ETH_VTOKEN);
      const usdtPrice = await resilient.getUnderlyingPrice(VUSDT);
      const tokensToDenom = ethExchangeRate.mul(ethCF).div(ONE).mul(ethPrice).div(ONE);
      const sumCollateral = tokensToDenom.mul(ethVTokenBal).div(ONE);
      const sumBorrows = usdtBorrowBal.mul(usdtPrice).div(ONE);
      return sumCollateral.sub(sumBorrows);
    };

    // Tolerance: $1 in 1e18 — covers rounding-order differences between this
    // computation and the on-chain lens, while staying well under any real-bug delta
    // on ~$1500 of liquidity / ~$80 of shortfall.
    const LIQUIDITY_TOLERANCE = ethers.utils.parseEther("1");

    it("pre-crash: getAccountLiquidity matches expected (ComptrollerLens path)", async () => {
      const expected = await expectedLiquidityDelta();
      expect(expected).to.be.gt(0);

      const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(BORROWER);
      expect(err).to.equal(0);
      expect(shortfall).to.equal(0);
      expect(liquidity).to.be.closeTo(expected, LIQUIDITY_TOLERANCE);
    });

    it("liquidate: ETH price crash puts the borrower into shortfall and liquidator seizes vETH", async () => {
      // 1 ETH supply × $2239 × CF ≈ $1500 collateral vs $100 debt — a 10× crash
      // still leaves ~$150 of borrow capacity. Crash to 1% of spot to force shortfall.
      const crashedSpot = originalEthSpot.div(100);
      await chainlink.connect(timelockSigner).setDirectPrice(ETH_ASSET, crashedSpot);
      expect(await resilient.getPrice(ETH_ASSET)).to.equal(crashedSpot);

      const expectedDelta = await expectedLiquidityDelta();
      expect(expectedDelta).to.be.lt(0);

      const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(BORROWER);
      expect(err).to.equal(0);
      expect(liquidity).to.equal(0);
      expect(shortfall).to.be.closeTo(expectedDelta.mul(-1), LIQUIDITY_TOLERANCE);

      const liquidator = new ethers.Contract(LIQUIDATOR_CONTRACT, LIQUIDATOR_ABI, provider);
      const repayAmount = ethers.utils.parseUnits("10", usdtDecimals);
      // Fund LIQUIDATOR from BORROWER's just-borrowed USDT — at this fork block the
      // Binance hot wallet doesn't hold any.
      await usdt.connect(borrowerSigner).transfer(LIQUIDATOR, repayAmount);
      await usdt.connect(liquidatorSigner).approve(LIQUIDATOR_CONTRACT, repayAmount);

      const liquidatorVethBefore = await veth.balanceOf(LIQUIDATOR);
      await expect(
        liquidator.connect(liquidatorSigner).liquidateBorrow(VUSDT, BORROWER, repayAmount, ETH_VTOKEN),
      ).to.emit(vusdt, "LiquidateBorrow");
      expect(await veth.balanceOf(LIQUIDATOR)).to.be.gt(liquidatorVethBefore);
    });
  });
});
