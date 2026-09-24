import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { DEVIATION_BOUNDED_ORACLE } from "../../vips/vip-617/bsctestnet";
import vip665Addendum, {
  NEW_DBO_IMPLEMENTATION,
  NEW_SET_TOKEN_CONFIG_SIGS,
  OLD_SET_TOKEN_CONFIG_SIGS,
  PROXY_ADMIN,
  TIMELOCKS,
} from "../../vips/vip-617/bsctestnet-addendum";
import ACM_ABI from "./abi/AccessControlManager.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const { ACCESS_CONTROL_MANAGER } = bsctestnet;

const FORK_BLOCK = 104867823;

// The currently deployed DBO impl returns the 9-field struct (no `cachingEnabled`).
// The new impl appends `cachingEnabled` as a 10th field. We use this minimal ABI
// to snapshot the original 9 fields pre-upgrade; the post-upgrade comparison
// uses the full 10-field ABI from `abi/DeviationBoundedOracle.json`.
const OLD_DBO_ABI = [
  {
    inputs: [{ type: "address", name: "" }],
    name: "assetProtectionConfig",
    outputs: [
      { type: "uint128", name: "minPrice" },
      { type: "uint128", name: "maxPrice" },
      { type: "bool", name: "currentlyUsingProtectedPrice" },
      { type: "bool", name: "isBoundedPricingEnabled" },
      { type: "uint64", name: "lastProtectionTriggeredAt" },
      { type: "uint64", name: "cooldownPeriod" },
      { type: "address", name: "asset" },
      { type: "uint128", name: "triggerThreshold" },
      { type: "uint128", name: "resetThreshold" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface OldConfig {
  minPrice: BigNumber;
  maxPrice: BigNumber;
  currentlyUsingProtectedPrice: boolean;
  isBoundedPricingEnabled: boolean;
  lastProtectionTriggeredAt: BigNumber;
  cooldownPeriod: BigNumber;
  asset: string;
  triggerThreshold: BigNumber;
  resetThreshold: BigNumber;
}

forking(FORK_BLOCK, async () => {
  let dbo: Contract;
  let dboOld: Contract;
  let proxyAdmin: Contract;
  let acm: Contract;

  let oldImpl: string;
  let initializedAssets: string[];
  const oldConfigs: Record<string, OldConfig> = {};
  let oldCollateralCacheSlot: string;
  let oldDebtCacheSlot: string;

  before(async () => {
    dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);
    dboOld = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, OLD_DBO_ABI, ethers.provider);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    acm = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);

    oldImpl = await proxyAdmin.getProxyImplementation(DEVIATION_BOUNDED_ORACLE);
    initializedAssets = [...(await dbo.getInitializedAssets())];

    for (const asset of initializedAssets) {
      const c = await dboOld.assetProtectionConfig(asset);
      oldConfigs[asset] = {
        minPrice: c.minPrice,
        maxPrice: c.maxPrice,
        currentlyUsingProtectedPrice: c.currentlyUsingProtectedPrice,
        isBoundedPricingEnabled: c.isBoundedPricingEnabled,
        lastProtectionTriggeredAt: c.lastProtectionTriggeredAt,
        cooldownPeriod: c.cooldownPeriod,
        asset: c.asset,
        triggerThreshold: c.triggerThreshold,
        resetThreshold: c.resetThreshold,
      };
    }

    oldCollateralCacheSlot = await dbo.COLLATERAL_PRICE_CACHE_SLOT();
    oldDebtCacheSlot = await dbo.DEBT_PRICE_CACHE_SLOT();
  });

  describe("Pre-VIP state", () => {
    it("DBO proxy does not yet point to the new implementation", () => {
      expect(oldImpl).to.not.equal(NEW_DBO_IMPLEMENTATION);
    });

    it("old (multi-arg) setTokenConfig/setTokenConfigs permissions are still granted to all 3 timelocks", async () => {
      for (const sig of OLD_SET_TOKEN_CONFIG_SIGS) {
        for (const caller of TIMELOCKS) {
          expect(
            await acm.hasPermission(caller, DEVIATION_BOUNDED_ORACLE, sig),
            `${caller} should still have permission for old sig ${sig} pre-VIP`,
          ).to.equal(true);
        }
      }
    });

    it("new (struct-based) setTokenConfig/setTokenConfigs permissions are NOT yet granted to any timelock", async () => {
      for (const sig of NEW_SET_TOKEN_CONFIG_SIGS) {
        for (const caller of TIMELOCKS) {
          expect(
            await acm.hasPermission(caller, DEVIATION_BOUNDED_ORACLE, sig),
            `${caller} should NOT have permission for new sig ${sig} pre-VIP`,
          ).to.equal(false);
        }
      }
    });
  });

  testVip("VIP-665 Addendum — Upgrade DBO implementation on BNB Chain Testnet", await vip665Addendum(), {
    callbackAfterExecution: async txResponse => {
      // 2 old sigs × 3 timelocks = 6 revokes
      // 2 new sigs × 3 timelocks = 6 grants
      await expectEvents(txResponse, [ACM_ABI], ["PermissionRevoked", "PermissionGranted"], [6, 6]);
    },
  });

  describe("Post-VIP state", () => {
    it("DBO proxy points to the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(DEVIATION_BOUNDED_ORACLE)).to.equal(NEW_DBO_IMPLEMENTATION);
    });

    describe("ACM permissions re-aligned to new struct-based signatures", () => {
      it("old (multi-arg) setTokenConfig/setTokenConfigs permissions are revoked for all 3 timelocks", async () => {
        for (const sig of OLD_SET_TOKEN_CONFIG_SIGS) {
          for (const caller of TIMELOCKS) {
            expect(
              await acm.hasPermission(caller, DEVIATION_BOUNDED_ORACLE, sig),
              `${caller} should NOT have permission for old sig ${sig} post-VIP`,
            ).to.equal(false);
          }
        }
      });

      it("new (struct-based) setTokenConfig/setTokenConfigs permissions are granted to all 3 timelocks", async () => {
        for (const sig of NEW_SET_TOKEN_CONFIG_SIGS) {
          for (const caller of TIMELOCKS) {
            expect(
              await acm.hasPermission(caller, DEVIATION_BOUNDED_ORACLE, sig),
              `${caller} should have permission for new sig ${sig} post-VIP`,
            ).to.equal(true);
          }
        }
      });
    });

    describe("Storage layout preserved across implementation upgrade", () => {
      it("initialized assets list unchanged", async () => {
        const after = [...(await dbo.getInitializedAssets())];
        expect(after).to.deep.equal(initializedAssets);
      });

      it("per-asset token configs unchanged (original 9 fields preserved)", async () => {
        for (const asset of initializedAssets) {
          const before = oldConfigs[asset];
          const after = await dbo.assetProtectionConfig(asset);
          expect(after.minPrice).to.equal(before.minPrice);
          expect(after.maxPrice).to.equal(before.maxPrice);
          expect(after.currentlyUsingProtectedPrice).to.equal(before.currentlyUsingProtectedPrice);
          expect(after.isBoundedPricingEnabled).to.equal(before.isBoundedPricingEnabled);
          expect(after.lastProtectionTriggeredAt).to.equal(before.lastProtectionTriggeredAt);
          expect(after.cooldownPeriod).to.equal(before.cooldownPeriod);
          expect(after.asset).to.equal(before.asset);
          expect(after.triggerThreshold).to.equal(before.triggerThreshold);
          expect(after.resetThreshold).to.equal(before.resetThreshold);
        }
      });

      it("new cachingEnabled field defaults to false for existing assets", async () => {
        for (const asset of initializedAssets) {
          const after = await dbo.assetProtectionConfig(asset);
          expect(after.cachingEnabled).to.equal(false);
        }
      });

      it("cache storage slot getters still resolve (cache mechanism present)", async () => {
        // The new impl may rebase its namespaced cache slot constants; we only
        // require that both getters remain callable and return non-zero values,
        // i.e. the cache subsystem is still wired up post-upgrade.
        const collateralSlot = await dbo.COLLATERAL_PRICE_CACHE_SLOT();
        const debtSlot = await dbo.DEBT_PRICE_CACHE_SLOT();
        expect(collateralSlot).to.not.equal(ethers.constants.HashZero);
        expect(debtSlot).to.not.equal(ethers.constants.HashZero);
        expect(collateralSlot).to.not.equal(debtSlot);
        // Surface any slot rebase so reviewers can confirm it is intentional.
        if (collateralSlot !== oldCollateralCacheSlot || debtSlot !== oldDebtCacheSlot) {
          console.log(
            `      note: cache slots changed across upgrade (collateral: ${oldCollateralCacheSlot} → ${collateralSlot}, debt: ${oldDebtCacheSlot} → ${debtSlot})`,
          );
        }
      });
    });
  });
});
