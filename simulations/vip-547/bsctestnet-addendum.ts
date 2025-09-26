import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  NEW_DIAMOND,
  NEW_VAI_CONTROLLER,
  OLD_DIAMOND,
  OLD_VAI_CONTROLLER,
  POOL_SPECS,
  UNITROLLER,
  VAI_UNITROLLER,
  vip547,
} from "../../vips/vip-547/bsctestnet-addendum";
import ACM_ABI from "./abi/AccessControlManager.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import VAI_UNITROLLR_ABI from "./abi/VAIUnitroller.json";
import COMPTROLLER_ABI from "./abi/comptroller-addendum.json";
import { cutParams as params } from "./utils/bsctestnet-addendum-cut-params.json";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const OLD_SETTER_FACET = "0xF1844c6d56314a10C28175db638B51b4Ee14C402";
const OLD_REWARD_FACET = "0x2B1b7FA16FE9B9ED5571663396bC16EBC079193B";
const OLD_MARKET_FACET = "0x92B9CE322B0A4a3701fd3dC609740c7Df80f479D";
const OLD_POLICY_FACET = "0xBDd1F07F4eF1748657FDA0d29CF4D7361120c187";

const NEW_SETTER_FACET = "0x3CCC9fC2fDA021ADb9C9FB0493C1a4a9357f4064";
const NEW_REWARD_FACET = "0xDD150De13849fB0776B466114b95770714c8Cc9d";
const NEW_MARKET_FACET = "0xD3D5f6c68677051e6855Fa38dca0cD6D56ED0c4f";
const NEW_POLICY_FACET = "0x11968dab15a9e59Cf9721b1F5c68418383CC1320";

forking(65806620, async () => {
  let unitroller: Contract;
  let vaiUnitroller: Contract;
  let accessControlManager: Contract;
  let comptroller: Contract;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
    vaiUnitroller = await ethers.getContractAt(VAI_UNITROLLR_ABI, VAI_UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, bsctestnet.ACCESS_CONTROL_MANAGER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
  });

  describe("Pre-VIP state", async () => {
    it("unitroller should have old implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(OLD_DIAMOND.toLowerCase());
    });
    it("VAI Unitroller should point to old VAI Controller", async () => {
      expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(OLD_VAI_CONTROLLER);
    });
    it("unitroller should have old Facets", async () => {
      expect(await unitroller.facetAddresses()).to.include(OLD_SETTER_FACET, OLD_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.include(OLD_MARKET_FACET, OLD_POLICY_FACET);
    });
  });

  testVip("VIP-547", await vip547(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [VAI_UNITROLLR_ABI, ACM_ABI, COMPTROLLER_ABI],
        ["NewImplementation", "DiamondCut", "PermissionGranted", "PoolFallbackStatusUpdated"],
        [2, 1, 6, 1],
      );
    },
  });

  describe("Post-VIP state", async () => {
    it("Unitroller should point to new implementation", async () => {
      expect(await unitroller.comptrollerImplementation()).equals(NEW_DIAMOND);
    });

    it("VAI Controller should point to new impl", async () => {
      expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(NEW_VAI_CONTROLLER);
    });

    it("unitroller should contain the new Facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_SETTER_FACET, NEW_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET, NEW_POLICY_FACET);

      expect(await unitroller.facetAddresses()).to.not.include(OLD_SETTER_FACET, OLD_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET, OLD_POLICY_FACET);
    });

    it("market facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[0][2];
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[1][2];
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[2][2];
      expect(await unitroller.facetFunctionSelectors(NEW_REWARD_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_REWARD_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[3][2], ...cutParams[4][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("check new permissions", async () => {
      for (const method of ["setPoolLabel(uint96,string)", "setAllowCorePoolFallback(uint96,bool)"]) {
        expect(await accessControlManager.hasPermission(bsctestnet.NORMAL_TIMELOCK, UNITROLLER, method)).to.equal(true);
        expect(await accessControlManager.hasPermission(bsctestnet.FAST_TRACK_TIMELOCK, UNITROLLER, method)).to.equal(
          true,
        );
        expect(await accessControlManager.hasPermission(bsctestnet.CRITICAL_TIMELOCK, UNITROLLER, method)).to.equal(
          true,
        );
      }
    });

    it("should set the AllowCorePoolFallback to true for Stablecoins emode group", async () => {
      const pool = await comptroller.pools(POOL_SPECS.id);
      expect(pool.label).to.equal(POOL_SPECS.label);
      expect(pool.allowCorePoolFallback).to.equal(POOL_SPECS.allowCorePoolFallback);
    });
  });
});
