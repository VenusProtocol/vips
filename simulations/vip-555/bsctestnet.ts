import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  CORE_MARKETS,
  NEW_DIAMOND_IMPLEMENTATION,
  NEW_VBEP20_DELEGATE_IMPL,
  UNITROLLER,
  vip555,
} from "../../vips/vip-555/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBEP20Delegator.json";
import { cutParams as params } from "./utils/bsctestnet-cut-params.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const NEW_SETTER_FACET = "0xd6abFa4C6B0397638b4504cc573255B49d6F2C18";
const NEW_POLICY_FACET = "0x446A6300086b0576adC7e302A999Cf1AF25c7Abf";
const NEW_REWARD_FACET = "0xB52Ba229A9E3e3b223AF06c20dcBBA2BF67fC216";
const NEW_MARKET_FACET = "0xCcf3e56e63855B59C0AcaC590d381FA7586b5616";

const OLD_SETTER_FACET = "0xe41Ab9b0ea3edD4cE3108650056641F1E361246c";
const OLD_POLICY_FACET = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
const OLD_REWARD_FACET = "0x0CB4FdDA118Da048B9AAaC15f34662C6AB34F5dB";
const OLD_MARKET_FACET = "0xfdFd4BEdc16339fE2dfa19Bab8bC9B8DA4149F75";

const OLD_DIAMOND = "0x11aa7ff5990e0a341eceeee9ddfdf8ce570dd5fd";

const NEW_COMPT_METHODS = ["setWhiteListFlashLoanAccount(address,bool)"];

const NEW_VBEP20_DELEGATE_METHODS = ["toggleFlashLoan()", "setFlashLoanFeeMantissa(uint256,uint256)"];

forking(65784550, async () => {
  let unitroller: Contract;
  let accessControlManager: Contract;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);

    console.log(`Setting max stale period...`);
    for (const market of CORE_MARKETS) {
      // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
        market.address,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.REDSTONE_ORACLE,
        market.address,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );
    }
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "WBETH", 315360000);
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "TWT", 315360000);
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "lisUSD", 315360000);
  });

  describe("Pre-VIP state", async () => {
    it("unitroller should have old implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(OLD_DIAMOND.toLowerCase());
    });
  });

  testVip("VIP-555", await vip555(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewPendingImplementation"], [2]);
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets + 1]);
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP state", async () => {
    it("unitroller should have new implementation", async () => {
      expect(await unitroller.comptrollerImplementation()).equals(NEW_DIAMOND_IMPLEMENTATION);
    });

    it("policy facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[0][2], ...cutParams[1][2]];
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

      for (const method of NEW_VBEP20_DELEGATE_METHODS) {
        expect(
          await accessControlManager.hasPermission(
            NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
            ethers.constants.AddressZero,
            method,
          ),
        ).to.equal(true);
      }
    });

    it("markets should have new implemenation", async () => {
      for (const market of CORE_MARKETS) {
        const marketContract = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market.address);
        expect(await marketContract.implementation()).equals(NEW_VBEP20_DELEGATE_IMPL);
      }
    });
  });
});
