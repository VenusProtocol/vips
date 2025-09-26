import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { UNITROLLER, vip547 } from "../../vips/vip-547/bsctestnet-addendum-2";
import DIAMOND_ABI from "./abi/Diamond.json";
import COMPTROLLER_ABI from "./abi/comptroller-addendum-2.json";
import { cutParams as params } from "./utils/bsctestnet-addendum-2-cut-params.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const OLD_POLICY_FACET = "0x11968dab15a9e59Cf9721b1F5c68418383CC1320";
const NEW_POLICY_FACET = "0x8C9Ba060C2eF15755c5eE8DD06bB41Fd539C6FbD";

forking(66482446, async () => {
  let unitroller: Contract;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
  });

  describe("Pre-VIP state", async () => {
    it("unitroller should have old Policy facet", async () => {
      expect(await unitroller.facetAddresses()).to.include(OLD_POLICY_FACET);
    });

    it("new policy facet function selectors should be same as current", async () => {
      const currentPolicyfacetSelectors = await unitroller.facetFunctionSelectors(OLD_POLICY_FACET);
      expect(currentPolicyfacetSelectors).to.deep.equal(cutParams[0][2]);
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal([]);
    });
  });

  testVip("VIP-547", await vip547(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["DiamondCut"], [1]);
    },
  });

  describe("Post-VIP state", async () => {
    it("unitroller should contain the new Facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_POLICY_FACET);
    });

    it("policy facet function selectors should be replaced with new facet address", async () => {
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal(cutParams[0][2]);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });
  });
});
