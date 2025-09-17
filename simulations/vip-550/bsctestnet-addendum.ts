import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CUT_PARAMS,
  NEW_SETTER_FACET,
  OLD_SETTER_FACET,
  UNITROLLER,
  vip550,
} from "../../vips/vip-550/bsctestnet-addendum";
import ACM_ABI from "./abi/AccessControlManager.json";
import DIAMOND_ABI from "./abi/Diamond.json";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
type CutParam = [string, number, string[]];
const cutParams = CUT_PARAMS as unknown as CutParam[];

forking(65695214, async () => {
  let unitroller: Contract;
  let accessControlManager: Contract;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, bsctestnet.ACCESS_CONTROL_MANAGER);
  });

  describe("Pre-VIP state", async () => {
    it("unitroller should have old setterFacet", async () => {
      expect(await unitroller.facetAddresses()).to.include(OLD_SETTER_FACET);
    });
  });

  testVip("VIP-550", await vip550(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [DIAMOND_ABI, ACM_ABI], ["DiamondCut", "PermissionGranted"], [1, 3]);
    },
  });

  describe("Post-VIP state", async () => {
    it("unitroller should contain the new setterFacet address", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_SETTER_FACET);
    });

    it("setter facet function selectors should be replaced with new facet", async () => {
      const functionSelectors = [...cutParams[0][2], ...cutParams[1][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("Check new permission", async () => {
      expect(
        await accessControlManager.hasPermission(bsctestnet.NORMAL_TIMELOCK, UNITROLLER, "setPoolLabel(uint96,string)"),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(
          bsctestnet.FAST_TRACK_TIMELOCK,
          UNITROLLER,
          "setPoolLabel(uint96,string)",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(
          bsctestnet.CRITICAL_TIMELOCK,
          UNITROLLER,
          "setPoolLabel(uint96,string)",
        ),
      ).to.equal(true);
    });
  });
});
