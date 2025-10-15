import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";

import {
  ACM,
  CORE_MARKETS,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND_IMPLEMENTATION,
  NEW_VBEP20_DELEGATE_IMPL,
  UNITROLLER,
  vip557Testnet,
} from "../../vips/vip-557/bsctestnet";
import { vip557Testnet2 } from "../../vips/vip-557/bsctestnet-2";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";
import VTOKEN_ABI from "./abi/VToken.json";
import { cutParams as params } from "./utils/bsctestnet-cut-params.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const NEW_SETTER_FACET = "0x98DCde088ED0208e4521867344532565657e0a91";
const NEW_POLICY_FACET = "0xB15620d400B12B1d9431910B770Eb1E0179432B1";
const NEW_REWARD_FACET = "0x771d07CE1FE51d261a9c3e00A42684Ed45e0c50b";
const NEW_MARKET_FACET = "0x3cAe1E59cdE3E3258348375cf301b469FB40A092";
const NEW_FLASHLOAN_FACET = "0x957BE05daF560bd56D9Adb8D7A52CfbCD828163B";

const OLD_SETTER_FACET = "0x3CCC9fC2fDA021ADb9C9FB0493C1a4a9357f4064";
const OLD_POLICY_FACET = "0x8C9Ba060C2eF15755c5eE8DD06bB41Fd539C6FbD";
const OLD_REWARD_FACET = "0xDD150De13849fB0776B466114b95770714c8Cc9d";
const OLD_MARKET_FACET = "0xD3D5f6c68677051e6855Fa38dca0cD6D56ED0c4f";

const OLD_DIAMOND = "0xCe314cA8be79435FB0E4ffc102DAcA172B676a47";
const OLD_COMPTROLLER_LENS = "0xACbc75C2D0438722c75D9BD20844b5aFda4155ea";

const NEW_COMPT_METHODS = ["setWhiteListFlashLoanAccount(address,bool)"];

const NEW_VBEP20_DELEGATE_METHODS = ["setFlashLoanEnabled(bool)", "setFlashLoanFeeMantissa(uint256,uint256)"];

const GENERIC_ETH_ACCOUNT = "0x804512132AA9E0c81Aab9Ef2113E05EC380d3cfc";

forking(68683541, async () => {
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

  testVip("VIP-557 testnet", await vip557Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewPendingImplementation"], [2]);
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets + 1]);
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["FlashLoanStatusChanged"], [totalMarkets]);
    },
  });
  testVip("VIP-557 testnet 2", await vip557Testnet2(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      await expectEvents(txResponse, [VTOKEN_ABI], ["FlashLoanFeeUpdated"], [totalMarkets]);
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

    it("flash loans should be enabled for all core markets", async () => {
      for (const market of CORE_MARKETS) {
        const marketContract = await ethers.getContractAt(VTOKEN_ABI, market.address);
        expect(await marketContract.isFlashLoanEnabled()).to.equal(true);
      }
    });

    it("flash loan fee should be set to 0.3% with 30% protocol share", async () => {
      const expectedFee = ethers.utils.parseUnits("0.003", 18); // 0.3%
      const expectedProtocolShare = ethers.utils.parseUnits("0.3", 18); // 30%

      for (const market of CORE_MARKETS) {
        const marketContract = await ethers.getContractAt(VTOKEN_ABI, market.address);
        const flashLoanFee = await marketContract.flashLoanFeeMantissa();
        const protocolShareMantissa = await marketContract.flashLoanProtocolShareMantissa();

        expect(flashLoanFee).to.equal(expectedFee);
        expect(protocolShareMantissa).to.equal(expectedProtocolShare);
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
