import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import {
  ACM,
  CORE_MARKETS,
  NEW_DIAMOND_IMPLEMENTATION,
  NEW_VBEP20_DELEGATE_IMPL,
  UNITROLLER,
  vip555,
} from "../../vips/vip-555/bsctestnet";
import {vip550} from "../../vips/vip-550/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBEP20Delegator.json";
import { cutParams as params } from "./utils/bsctestnet-cut-params.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const NEW_SETTER_FACET = "0x50f491cc0e943966cCf03c77931e55a2A0F29Bc0";
const NEW_POLICY_FACET = "0x1b9E17a9E6f0239DeD067bFCA916c5628972083B";

const OLD_SETTER_FACET = "0xe41Ab9b0ea3edD4cE3108650056641F1E361246c";
const OLD_POLICY_FACET = "0x284d000665296515280a4fB066a887EFF6A3bD9E";

const OLD_DIAMOND = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";

const NEW_COMPT_METHODS = [
  "setWhiteListFlashLoanAccount(address,bool)",
  "setDelegateAuthorizationFlashloan(address,address,bool)"
];

const NEW_VBEP20_DELEGATE_METHODS = [
  "_toggleFlashLoan()",
  "_setFlashLoanFeeMantissa(uint256,uint256)"
];

forking(64317975, async () => {
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
  });

  await pretendExecutingVip(await vip550());

  testVip("VIP-555", await vip555(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      const totalNewMethods = NEW_COMPT_METHODS.length + NEW_VBEP20_DELEGATE_METHODS.length;
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewPendingImplementation"], [2]);
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets + 1]); 
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [12]);
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

    it("Check new permission", async () => {
      for (const method of NEW_COMPT_METHODS) {
        expect(
          await accessControlManager.hasPermission(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK, UNITROLLER, method),
        ).to.equal(true);
      }

      for (const method of NEW_VBEP20_DELEGATE_METHODS) {
        expect(
          await accessControlManager.hasPermission(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, method),
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