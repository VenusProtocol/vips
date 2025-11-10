import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
  setRedstonePrice,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";

import {
  CORE_MARKETS,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND_IMPLEMENTATION,
  NEW_VBEP20_DELEGATE_IMPL,
  UNITROLLER,
  vip557,
} from "../../vips/vip-557/bscmainnet";
import { vip557Mainnet2 } from "../../vips/vip-557/bscmainnet-2";
import ACM_ABI from "./abi/ACMMainnet.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import REDSTONE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ABI from "./abi/ResilientOracle.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";
import VTOKEN_ABI from "./abi/VToken.json";
import { cutParams as params } from "./utils/bscmainnet-cut-params.json";

const { bscmainnet } = NETWORK_ADDRESSES;

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const NEW_SETTER_FACET = "0x11B38582c61058eDd9a526561567B4c7b02060e7";
const NEW_POLICY_FACET = "0x3C115aA5800A589D1E0c3163f3f562D5544F060f";
const NEW_REWARD_FACET = "0x7fcEc39e83f17469069b7A0f24A59B5BbEC0faBb";
const NEW_MARKET_FACET = "0x7ec871BA4248CC443a994f2febeDFB96DAe444F1";
const NEW_FLASHLOAN_FACET = "0x72a284f144F2BE56549573DDFac2A90F8D662ed1";

const OLD_SETTER_FACET = "0x4Fd17b7df6004E04A6298EdE065dE431D408fD9b";
const OLD_POLICY_FACET = "0x529aE2E71E0836bE7378a8D47657E805829c6b3C";
const OLD_REWARD_FACET = "0x1d903eEa9d98a6Ac071a1f4531dc6958B4629cBE";
const OLD_MARKET_FACET = "0x6e9bD95830bb775fb9F24b9559f8894d92143CA1";

const OLD_DIAMOND = "0x6c151A4134006395D41319d713349660259DAB4e";
const OLD_COMPTROLLER_LENS = "0xd701C1fDAE34f9Cf242a4de19a2e7288f924EA1C";

const NEW_COMPT_METHODS = ["setWhiteListFlashLoanAccount(address,bool)", "setFlashLoanPaused(bool)"];

const NEW_VBEP20_DELEGATE_METHODS = ["setFlashLoanEnabled(bool)", "setFlashLoanFeeMantissa(uint256,uint256)"];

const GENERIC_ETH_ACCOUNT = "0xF77055DBFAfdD56578Ace54E62e749d12802ce36";

forking(67673649, async () => {
  let unitroller: Contract;
  let comptroller: Contract;
  let accessControlManager: Contract;
  let impUnitroller: SignerWithAddress;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);
    impUnitroller = await initMainnetUser(bscmainnet.UNITROLLER, parseUnits("2", 18));

    console.log(`Setting max stale period...`);
    for (const market of CORE_MARKETS) {
      // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        market.underlying,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.REDSTONE_ORACLE,
        market.underlying,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, market.symbol.slice(1), 315360000);
    }

    const xSolvBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
    const xSolvBTC_RedStone_Feed = "0x24c8964338Deb5204B096039147B8e8C3AEa42Cc";
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, xSolvBTC, xSolvBTC_RedStone_Feed, bscmainnet.NORMAL_TIMELOCK);

    const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
    const THE_REDSTONE_FEED = "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5";
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, THE, THE_REDSTONE_FEED, bscmainnet.NORMAL_TIMELOCK);

    const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
    const TRX_REDSTONE_FEED = "0xa17362dd9AD6d0aF646D7C8f8578fddbfc90B916";
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, TRX, TRX_REDSTONE_FEED, bscmainnet.NORMAL_TIMELOCK, 3153600000, {
      tokenDecimals: 6,
    });

    const PTsUSDE_26JUN2025 = "0xDD809435ba6c9d6903730f923038801781cA66ce";
    const PT_SUSDE_FIXED_PRICE = parseUnits("1.05", 18);

    const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    const oracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ABI, ethers.provider);
    const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ABI, ethers.provider);

    await resilientOracle
      .connect(impersonatedTimelock)
      .setTokenConfig([
        PTsUSDE_26JUN2025,
        [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
        [true, false, false],
        false,
      ]);
    await oracle.connect(impersonatedTimelock).setDirectPrice(PTsUSDE_26JUN2025, PT_SUSDE_FIXED_PRICE);
  });

  describe("Pre-VIP state", async () => {
    it("unitroller should have old implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(OLD_DIAMOND.toLowerCase());
    });

    it("comptroller should have old comptrollerLens", async () => {
      expect((await comptroller.comptrollerLens()).toLowerCase()).to.equal(OLD_COMPTROLLER_LENS.toLowerCase());
    });
  });

  testVip("VIP-557 Mainnet", await vip557(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewPendingImplementation"], [2]);
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets + 1]);
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
    },
  });

  testVip("VIP-557 Mainnet - Part 2", await vip557Mainnet2(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      await expectEvents(txResponse, [VTOKEN_ABI], ["FlashLoanStatusChanged"], [totalMarkets]);
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
          await accessControlManager.connect(impUnitroller).isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, method),
        ).to.equal(true);
        expect(
          await accessControlManager.connect(impUnitroller).isAllowedToCall(bscmainnet.FAST_TRACK_TIMELOCK, method),
        ).to.equal(true);
        expect(
          await accessControlManager.connect(impUnitroller).isAllowedToCall(bscmainnet.CRITICAL_TIMELOCK, method),
        ).to.equal(true);
        expect(
          await accessControlManager.connect(impUnitroller).isAllowedToCall(bscmainnet.GUARDIAN, method),
        ).to.equal(true);
      }

      for (const method of NEW_VBEP20_DELEGATE_METHODS) {
        expect(await accessControlManager.isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, method)).to.equal(true);
        expect(await accessControlManager.isAllowedToCall(bscmainnet.FAST_TRACK_TIMELOCK, method)).to.equal(true);
        expect(await accessControlManager.isAllowedToCall(bscmainnet.CRITICAL_TIMELOCK, method)).to.equal(true);
        expect(await accessControlManager.isAllowedToCall(bscmainnet.GUARDIAN, method)).to.equal(true);
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
