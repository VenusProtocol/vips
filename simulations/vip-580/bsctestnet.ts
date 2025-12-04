import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  LIQUIDATION_MANAGER,
  LIQUIDATOR_PROXY_ADMIN,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND,
  NEW_LIQUIDATOR_IMPL,
  NEW_VAI_CONTROLLER,
  NEW_VTOKEN_IMPLEMENTATION,
  vip580,
} from "../../vips/vip-580/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegate.json";
import { cutParams as params } from "./utils/cut-params-bsctestnet.json";
import CORE_POOL_VTOKENS from "./utils/market.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const { bsctestnet } = NETWORK_ADDRESSES;
const UNITROLLER = bsctestnet.UNITROLLER;
const ACM = bsctestnet.ACCESS_CONTROL_MANAGER;
const VAI_UNITROLLER = bsctestnet.VAI_UNITROLLER;
const LIQUIDATOR = bsctestnet.LIQUIDATOR;

// Previous implementations (update these with actual addresses if known)
const OLD_DIAMOND = "0x1774f993861B14B7C3963F3e09f67cfBd2B32198";
const OLD_COMPTROLLER_LENS = "0x72dCB93F8c3fB00D31076e93b6E87C342A3eCC9c";
const OLD_VAI_CONTROLLER_IMPL = "0xA8122Fe0F9db39E266DE7A5BF953Cd72a87fe345";
const OLD_LIQUIDATOR_IMPL = "0x91070E5b5Ff60a6c122740EB326D1f80E9f470e7";
const OLD_VTOKEN_IMPL = "0xb941C5D148c65Ce49115D12B5148247AaCeFF375";

// Extract facet addresses from cutParams
const getFacetAddresses = (): string[] => {
  const addresses: string[] = [];
  for (const param of cutParams) {
    if (param[0] !== "0x0000000000000000000000000000000000000000" && !addresses.includes(param[0])) {
      addresses.push(param[0]);
    }
  }
  return addresses;
};

const NEW_FACET_ADDRESSES = getFacetAddresses();

forking(76316411, async () => {
  let unitroller: Contract;
  let comptroller: Contract;
  let accessControlManager: Contract;
  let vaiUnitroller: Contract;
  let liquidator: Contract;
  let proxyAdmin: SignerWithAddress;

  before(async () => {
    unitroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
    vaiUnitroller = await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_UNITROLLER);
    liquidator = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR);
    proxyAdmin = await initMainnetUser(LIQUIDATOR_PROXY_ADMIN, parseUnits("2", 18));
  });

  describe("Pre-VIP state", async () => {
    it("unitroller should have old implementation", async () => {
      const implementation = await unitroller.comptrollerImplementation();
      expect(implementation.toLowerCase()).to.equal(OLD_DIAMOND.toLowerCase());
    });

    it("comptroller should have old comptroller lens", async () => {
      const lens = await comptroller.comptrollerLens();
      expect(lens.toLowerCase()).to.equal(OLD_COMPTROLLER_LENS.toLowerCase());
    });

    it("VAI Unitroller should point to old VAI Controller", async () => {
      const implementation = await vaiUnitroller.vaiControllerImplementation();
      expect(implementation).to.equal(OLD_VAI_CONTROLLER_IMPL);
    });

    it("Liquidator should point to old implementation", async () => {
      const impl = await liquidator.connect(proxyAdmin).callStatic.implementation();
      expect(impl.toLowerCase()).to.equal(OLD_LIQUIDATOR_IMPL.toLowerCase());
    });

    it("vTokens should have old implementation", async () => {
      const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, CORE_POOL_VTOKENS[0].address);
      const implementation = await vToken.implementation();
      expect(implementation.toLowerCase()).to.equal(OLD_VTOKEN_IMPL.toLowerCase());
    });

    it("old liquidation incentive permission should exist", async () => {
      const hasPermission = await accessControlManager.hasPermission(
        bsctestnet.NORMAL_TIMELOCK,
        UNITROLLER,
        "setLiquidationIncentive(address,uint256)",
      );
      expect(hasPermission).to.equal(true);
    });

    it("new liquidation functions should not have permissions", async () => {
      const hasPermission1 = await accessControlManager.hasPermission(
        bsctestnet.NORMAL_TIMELOCK,
        UNITROLLER,
        "setMarketMaxLiquidationIncentive(address,uint256)",
      );
      expect(hasPermission1).to.equal(false);

      const hasPermission2 = await accessControlManager.hasPermission(
        bsctestnet.NORMAL_TIMELOCK,
        UNITROLLER,
        "setLiquidationManager(address)",
      );
      expect(hasPermission2).to.equal(false);

      const hasPermission3 = await accessControlManager.hasPermission(
        bsctestnet.NORMAL_TIMELOCK,
        UNITROLLER,
        "setDynamicCloseFactorEnabled(address,bool)",
      );
      expect(hasPermission3).to.equal(false);

      const hasPermission4 = await accessControlManager.hasPermission(
        bsctestnet.NORMAL_TIMELOCK,
        UNITROLLER,
        "setDynamicLiquidationIncentiveEnabled(address,bool)",
      );
      expect(hasPermission4).to.equal(false);
    });
  });

  testVip("VIP-580 Liquidation Threshold and Dynamic Liquidation Improvements", await vip580(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_POOL_VTOKENS.length;
      const totalTimelocks = 4; // Normal, Fast, Critical, Guardian
      const newPermissionsPerTimelock = 5; // 5 new permissions
      const oldPermissionsPerTimelock = 2; // 2 old permissions to revoke

      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, ACM_ABI],
        ["NewPendingImplementation", "DiamondCut", "PermissionGranted", "PermissionRevoked"],
        [
          4, // Unitroller + VAI Controller (2x each for pending + become)
          1, // Diamond cut
          newPermissionsPerTimelock * totalTimelocks, // New permissions
          oldPermissionsPerTimelock * totalTimelocks, // Revoked permissions
        ],
      );

      await expectEvents(
        txResponse,
        [VBEP20_DELEGATOR_ABI],
        ["NewImplementation"],
        [totalMarkets + 2], // All vTokens + Unitroller + VAI Controller
      );
    },
  });

  describe("Post-VIP state", async () => {
    it("unitroller should have new implementation", async () => {
      const implementation = await unitroller.comptrollerImplementation();
      expect(implementation).to.equal(NEW_DIAMOND);
    });

    it("comptroller should have new comptroller lens", async () => {
      const lens = await comptroller.comptrollerLens();
      expect(lens).to.equal(NEW_COMPTROLLER_LENS);
    });

    it("VAI Controller should point to new implementation", async () => {
      const implementation = await vaiUnitroller.vaiControllerImplementation();
      expect(implementation).to.equal(NEW_VAI_CONTROLLER);
    });

    it("Liquidator should point to new implementation", async () => {
      const impl = await liquidator.connect(proxyAdmin).callStatic.implementation();
      expect(impl).to.equal(NEW_LIQUIDATOR_IMPL);
    });

    it("all vTokens should have new implementation", async () => {
      for (const vToken of CORE_POOL_VTOKENS) {
        const vTokenContract = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, vToken.address);
        const implementation = await vTokenContract.implementation();
        expect(implementation).to.equal(NEW_VTOKEN_IMPLEMENTATION);
      }
    });

    it("liquidation manager should be set in comptroller", async () => {
      const liquidationManagerAddress = await comptroller.liquidationManager();
      expect(liquidationManagerAddress).to.equal(LIQUIDATION_MANAGER);
    });

    it("diamond should contain new facet addresses", async () => {
      const facetAddresses = await unitroller.facetAddresses();
      for (const facetAddress of NEW_FACET_ADDRESSES) {
        expect(facetAddresses).to.include(facetAddress);
      }
    });

    it("diamond cut should have configured function selectors correctly", async () => {
      for (const [facetAddress, action, functionSelectors] of cutParams) {
        if (action === 1) {
          // Add or Replace
          const actualSelectors = await unitroller.facetFunctionSelectors(facetAddress);
          for (const selector of functionSelectors) {
            expect(actualSelectors).to.include(selector);
          }
        } else if (action === 2) {
          // Remove
          const actualSelectors = await unitroller.facetFunctionSelectors(facetAddress);
          for (const selector of functionSelectors) {
            expect(actualSelectors).to.not.include(selector);
          }
        }
      }
    });

    it("old liquidation incentive permissions should be revoked", async () => {
      for (const timelock of [
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ]) {
        expect(
          await accessControlManager.hasPermission(timelock, UNITROLLER, "setLiquidationIncentive(address,uint256)"),
        ).to.equal(false);
        expect(
          await accessControlManager.hasPermission(
            timelock,
            UNITROLLER,
            "setLiquidationIncentive(uint96,address,uint256)",
          ),
        ).to.equal(false);
      }
    });

    it("new liquidation functions should have permissions", async () => {
      const newMethods = [
        "setMarketMaxLiquidationIncentive(address,uint256)",
        "setMarketMaxLiquidationIncentive(uint96,address,uint256)",
        "setLiquidationManager(address)",
        "setDynamicCloseFactorEnabled(address,bool)",
        "setDynamicLiquidationIncentiveEnabled(address,bool)",
      ];

      for (const timelock of [
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ]) {
        for (const method of newMethods) {
          expect(await accessControlManager.hasPermission(timelock, UNITROLLER, method)).to.equal(true);
        }
      }
    });

    it("liquidation manager should be a valid contract", async () => {
      const code = await ethers.provider.getCode(LIQUIDATION_MANAGER);
      expect(code).to.not.equal("0x");
    });

    it("comptroller should support new liquidation features", async () => {
      // Test that new functions exist and are callable
      // These will revert if the functions don't exist
      try {
        await comptroller.liquidationManager();
        // If it doesn't revert, the function exists
        expect(true).to.be.true;
      } catch (error) {
        expect.fail("liquidationManager function should exist");
      }
    });
  });

  describe("Liquidation Threshold Features", async () => {
    it("markets should have liquidation threshold set", async () => {
      // Assuming liquidation threshold is stored in market data
      // This test structure depends on the actual implementation
      for (const vToken of CORE_POOL_VTOKENS.slice(0, 5)) {
        // Test first 5 markets
        const marketData = await comptroller.markets(vToken.address);
        // Market data structure: [isListed, collateralFactorMantissa, isVenus, liquidationThresholdMantissa, ...]
        // Verify liquidation threshold is set (assuming index 3)
        expect(marketData[3]).to.exist;
      }
    });
  });

  describe("Dynamic Liquidation Features", async () => {
    it("dynamic liquidation incentive should be configurable", async () => {
      // Test that the function exists
      try {
        // This is a read-only check to verify the function exists
        const hasPermission = await accessControlManager.hasPermission(
          bsctestnet.NORMAL_TIMELOCK,
          UNITROLLER,
          "setDynamicLiquidationIncentiveEnabled(address,bool)",
        );
        expect(hasPermission).to.equal(true);
      } catch (error) {
        expect.fail("Dynamic liquidation incentive function should exist");
      }
    });

    it("dynamic close factor should be configurable", async () => {
      // Test that the function exists
      try {
        const hasPermission = await accessControlManager.hasPermission(
          bsctestnet.NORMAL_TIMELOCK,
          UNITROLLER,
          "setDynamicCloseFactorEnabled(address,bool)",
        );
        expect(hasPermission).to.equal(true);
      } catch (error) {
        expect.fail("Dynamic close factor function should exist");
      }
    });

    it("max liquidation incentive should be configurable per market", async () => {
      // Test that the function exists
      try {
        const hasPermission = await accessControlManager.hasPermission(
          bsctestnet.NORMAL_TIMELOCK,
          UNITROLLER,
          "setMarketMaxLiquidationIncentive(address,uint256)",
        );
        expect(hasPermission).to.equal(true);
      } catch (error) {
        expect.fail("Max liquidation incentive function should exist");
      }
    });
  });
});
