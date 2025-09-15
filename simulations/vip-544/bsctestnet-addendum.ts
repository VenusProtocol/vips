import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip544_Addendum } from "./../../vips/vip-544/bsctestnet-addendum";
import COMPTROLLER_ABI from "./abi/Comproller.json";
import DIAMOND_ABI from "./abi/Diamond.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const OLD_SETTER_FACET = "0x490DFD07f592452307817C4283866035BDb3b275";
const OLD_MARKET_FACET = "0x00a949FfDa9B216fBA9C4E5b40ef561Af0FDb723";
const OLD_POLICY_FACET = "0x085C8d0133291348004AabFfbE7CAc2097aF2aa1";

const NEW_SETTER_FACET = "0xb619F7ce96c0a6E3F0b44e993f663522F79f294A";
const NEW_MARKET_FACET = "0x377c2E7CE08B4cc7033EDF678EE1224A290075Fd";
const NEW_POLICY_FACET = "0x671B787AEDB6769972f081C6ee4978146F7D92E6";

const UNCHANGED_REWARD_FACET = "0x905006DCD5DbAa9B67359bcB341a0C49AfC8d0A6";

forking(56931937, async () => {
  const provider = ethers.provider;
  let unitroller: Contract;
  let marketFacetFunctionSelectors: string[];
  let policyFacetFunctionSelectors: string[];
  let rewardFacetFuntionSelectors: string[];
  let setterFacetFuntionSelectors: string[];

  before(async () => {
    unitroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, provider);
    rewardFacetFuntionSelectors = await unitroller.facetFunctionSelectors(UNCHANGED_REWARD_FACET);
    setterFacetFuntionSelectors = await unitroller.facetFunctionSelectors(OLD_SETTER_FACET);
    marketFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_MARKET_FACET);
    policyFacetFunctionSelectors = await unitroller.facetFunctionSelectors(OLD_POLICY_FACET);
  });

  describe("Pre-VIP behaviour", async () => {
    it("market facet function selectors should be correct", async () => {
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal(marketFacetFunctionSelectors);
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be correct", async () => {
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal(policyFacetFunctionSelectors);
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be correct", async () => {
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal(setterFacetFuntionSelectors);
      expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should be correct", async () => {
      expect(await unitroller.facetFunctionSelectors(UNCHANGED_REWARD_FACET)).to.deep.equal(
        rewardFacetFuntionSelectors,
      );
    });

    it("unitroller should contain only old facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(OLD_SETTER_FACET);
      expect(await unitroller.facetAddresses()).to.include(OLD_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.include(OLD_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.include(UNCHANGED_REWARD_FACET);

      expect(await unitroller.facetAddresses()).to.not.include(NEW_SETTER_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(NEW_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(NEW_MARKET_FACET);
    });
  });

  testVip("vip-544-addendum", await vip544_Addendum(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("market facet function selectors should be updated for new facet address", async () => {
      const newMarketFacetFunctionSelectors = ["0x3d98a1e5", "0xcab4f84c"];

      const expectSelectors = [...marketFacetFunctionSelectors, ...newMarketFacetFunctionSelectors].sort();
      const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET))].sort();

      expect(updatedSelectors).to.deep.equal(expectSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be updated for new facet address", async () => {
      const newPolicyFacetFunctionSelectors = ["0x528a174c"];

      const expectSelectors = [...policyFacetFunctionSelectors, ...newPolicyFacetFunctionSelectors].sort();
      const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET))].sort();

      expect(updatedSelectors).to.deep.equal(expectSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be updated for new facet address", async () => {
      const newSetterFacetFunctionSelectors = [
        "0x8b3113f6",
        "0xc32094c7",
        "0x24aaa220",
        "0xd136af44",
        "0x186db48f",
        "0xa8431081",
        "0x5cc4fdeb",
        "0x12348e96",
        "0x530e784f",
      ];

      const expectSelectors = [...setterFacetFuntionSelectors, ...newSetterFacetFunctionSelectors].sort();
      const updatedSelectors = [...(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET))].sort();

      expect(updatedSelectors).to.deep.equal(expectSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should not be changed", async () => {
      expect(await unitroller.facetFunctionSelectors(UNCHANGED_REWARD_FACET)).to.deep.equal(
        rewardFacetFuntionSelectors,
      );
    });

    it("unitroller should contain the new and old facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_SETTER_FACET, OLD_SETTER_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_POLICY_FACET, OLD_POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET, OLD_MARKET_FACET);
      expect(await unitroller.facetAddresses()).to.include(UNCHANGED_REWARD_FACET);
    });
  });
});
