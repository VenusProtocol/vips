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
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND_IMPLEMENTATION,
  NEW_VBEP20_DELEGATE_IMPL,
  UNITROLLER,
  vip555,
} from "../../vips/vip-555/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";
import { cutParams as params } from "./utils/bsctestnet-cut-params.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const NEW_SETTER_FACET = "0xa6624EcbcA3328Dc7b5741db0Cd0c2f2653f2608";
const NEW_POLICY_FACET = "0x22CaBF6638458D9460304900868B5e5006134885";
const NEW_REWARD_FACET = "0x60952A607B00090e79683c51654B5B0BB4553684";
const NEW_MARKET_FACET = "0x3B6129250Ec0706FfF99E4909554F16b71A4bdaf";
const NEW_FLASHLOAN_FACET = "0x8eaeC2e491255335b638A94A2F62E30B334a7e7C";

const OLD_SETTER_FACET = "0xF1844c6d56314a10C28175db638B51b4Ee14C402";
const OLD_POLICY_FACET = "0xBDd1F07F4eF1748657FDA0d29CF4D7361120c187";
const OLD_REWARD_FACET = "0x2B1b7FA16FE9B9ED5571663396bC16EBC079193B";
const OLD_MARKET_FACET = "0x92B9CE322B0A4a3701fd3dC609740c7Df80f479D";

const OLD_DIAMOND = "0xCe314cA8be79435FB0E4ffc102DAcA172B676a47";
const OLD_COMPTROLLER_LENS = "0xACbc75C2D0438722c75D9BD20844b5aFda4155ea";

const NEW_COMPT_METHODS = ["setWhiteListFlashLoanAccount(address,bool)"];

const NEW_VBEP20_DELEGATE_METHODS = ["setFlashLoanEnabled(bool)", "setFlashLoanFeeMantissa(uint256,uint256)"];

forking(67070714, async () => {
  let unitroller: Contract;
  let comptroller: Contract;
  let accessControlManager: Contract;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
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

    it("comptroller should have old comptrollerLens", async () => {
      expect((await comptroller.comptrollerLens()).toLowerCase()).to.equal(OLD_COMPTROLLER_LENS.toLowerCase());
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

    it("flashLoan facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[1][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_FLASHLOAN_FACET)).to.deep.equal(functionSelectors);
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

    it("comptroller should have new comptrollerLens", async () => {
      expect((await comptroller.comptrollerLens()).toLowerCase()).to.equal(NEW_COMPTROLLER_LENS.toLowerCase());
    });
  });
});
