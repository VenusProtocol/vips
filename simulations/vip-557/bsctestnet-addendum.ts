import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";

import {
  ACM,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND_IMPLEMENTATION,
  UNITROLLER,
  vip557Testnet,
} from "../../vips/vip-557/bsctestnet-addendum";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import { cutParams as params } from "./utils/bsctestnet-addendum-cut-params.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const NEW_SETTER_FACET = "0x4fc4C41388237D13A430879417f143EF54e5BB05";
const NEW_POLICY_FACET = "0xf8d94ef23c1188f8ab1009E56D558d7834d1F019";
const NEW_REWARD_FACET = "0x0bc7922Cc08Ea32E196d25805558a84dF54beC6a";
const NEW_MARKET_FACET = "0x0A7A88aB6aB40417Bd6bF1EB3907EFF06D24C2FC";
const NEW_FLASHLOAN_FACET = "0x32348c5bB52E5468A11901e70BdE061192feCAf4";

const OLD_SETTER_FACET = "0x98DCde088ED0208e4521867344532565657e0a91";
const OLD_POLICY_FACET = "0xB15620d400B12B1d9431910B770Eb1E0179432B1";
const OLD_REWARD_FACET = "0x771d07CE1FE51d261a9c3e00A42684Ed45e0c50b";
const OLD_MARKET_FACET = "0x3cAe1E59cdE3E3258348375cf301b469FB40A092";
const OLD_FLASHLOAN_FACET = "0x957BE05daF560bd56D9Adb8D7A52CfbCD828163B";

const OLD_DIAMOND = "0xd25200C9CE964329d20389E328F1Ca0e2B0e91BC";
const OLD_COMPTROLLER_LENS = "0x31fd5a3Fdbe9972373e9373Eb59519c60d30EE00";

const NEW_COMPT_METHODS = ["setFlashLoanPaused(bool)"];

const GENERIC_ETH_ACCOUNT = "0x804512132AA9E0c81Aab9Ef2113E05EC380d3cfc";

forking(70284025, async () => {
  let unitroller: Contract;
  let comptroller: Contract;
  let accessControlManager: Contract;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
  });

  describe("Pre-VIP state", async () => {
    it("unitroller should have old implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(OLD_DIAMOND.toLowerCase());
    });

    it("comptroller should have old comptrollerLens", async () => {
      expect((await comptroller.comptrollerLens()).toLowerCase()).to.equal(OLD_COMPTROLLER_LENS.toLowerCase());
    });
  });

  testVip("VIP-557 testnet addendum", await vip557Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewPendingImplementation"], [2]);
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [3]);
    },
  });

  describe("Post-VIP state", async () => {
    it("unitroller should have new implementation", async () => {
      expect(await unitroller.comptrollerImplementation()).equals(NEW_DIAMOND_IMPLEMENTATION);
    });

    it("flashLoan facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[1][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_FLASHLOAN_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_FLASHLOAN_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[0][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[2][2], ...cutParams[3][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[4][2];
      expect(await unitroller.facetFunctionSelectors(NEW_REWARD_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_REWARD_FACET)).to.deep.equal([]);
    });

    it("market facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[5][2];
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("Check new permission", async () => {
      for (const method of NEW_COMPT_METHODS) {
        expect(
          await accessControlManager.hasPermission(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK, UNITROLLER, method),
        ).to.equal(true);
      }
    });

    it("comptroller should have new comptrollerLens", async () => {
      expect((await comptroller.comptrollerLens()).toLowerCase()).to.equal(NEW_COMPTROLLER_LENS.toLowerCase());
    });
  });

  describe("generic tests", async () => {
    checkCorePoolComptroller({
      account: GENERIC_ETH_ACCOUNT, // GENERIC_ETH_ACCOUNT
      lens: NEW_COMPTROLLER_LENS, // NEW_COMPTROLLER_LENS
    });
  });
});
