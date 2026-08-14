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

const OLD_DIAMOND = "0x1774f993861B14B7C3963F3e09f67cfBd2B32198";
const OLD_COMPTROLLER_LENS = "0x72dCB93F8c3fB00D31076e93b6E87C342A3eCC9c";
const OLD_VAI_CONTROLLER_IMPL = "0xA8122Fe0F9db39E266DE7A5BF953Cd72a87fe345";
const OLD_LIQUIDATOR_IMPL = "0x91070E5b5Ff60a6c122740EB326D1f80E9f470e7";
const OLD_VTOKEN_IMPL = "0xb941C5D148c65Ce49115D12B5148247AaCeFF375";

const OLD_SETTER_FACET = "0x4fc4C41388237D13A430879417f143EF54e5BB05";
const OLD_REWARD_FACET = "0x0bc7922Cc08Ea32E196d25805558a84dF54beC6a";
const OLD_MARKET_FACET = "0x8e0e15C99Ab0985cB39B2FE36532E5692730eBA9";
const OLD_POLICY_FACET = "0xf8d94ef23c1188f8ab1009E56D558d7834d1F019";
const OLD_FLASHLOAN_FACET = "0x32348c5bB52E5468A11901e70BdE061192feCAf4";

const NEW_SETTER_FACET = "0xe48f7E3F94349962A33D1e909b3F28E14A8770c9";
const NEW_REWARD_FACET = "0x03Be0AAd2EADc48892335C6Ac10A71DaD5a81A15";
const NEW_MARKET_FACET = "0x2A926859f87C322eEe043B8e5f098e618F92c529";
const NEW_POLICY_FACET = "0x550F5408D34793a723C22ff84A6872d74D5597f1";
const NEW_FLASHLOAN_FACET = "0x07347914d067C9227836870D6Be8F78539B91437";

const newMethods = [
  "setMarketMaxLiquidationIncentive(address,uint256)",
  "setMarketMaxLiquidationIncentive(uint96,address,uint256)",
  "setLiquidationManager(address)",
  "setDynamicCloseFactorEnabled(address,bool)",
  "setDynamicLiquidationIncentiveEnabled(address,bool)",
];

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
      for (const timelock of [
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ]) {
        for (const method of newMethods) {
          expect(await accessControlManager.hasPermission(timelock, UNITROLLER, method)).to.equal(false);
        }
      }
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

    it("market facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[0][2], ...cutParams[1][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[2][2], ...cutParams[3][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[4][2];
      expect(await unitroller.facetFunctionSelectors(NEW_REWARD_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_REWARD_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[5][2], ...cutParams[6][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("flashloan facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[7][2];
      expect(await unitroller.facetFunctionSelectors(NEW_FLASHLOAN_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_FLASHLOAN_FACET)).to.deep.equal([]);
    });

    it("unitroller should contain the new facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_SETTER_FACET, NEW_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET, NEW_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_FLASHLOAN_FACET);

      expect(await unitroller.facetAddresses()).to.not.include(OLD_SETTER_FACET, OLD_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET, OLD_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_FLASHLOAN_FACET);
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
  });
});
