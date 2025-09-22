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

import {
  ACM,
  BORROW_PAUSED_MARKETS,
  CORE_MARKETS,
  CORE_MARKETS_WITHOUT_VBNB,
  CURRENT_LIQUIDATION_INCENTIVE,
  GUARDIAN_1,
  GUARDIAN_2,
  LIQUIDATOR,
  LIQUIDATOR_PROXY_ADMIN,
  MARKETS_BA,
  MARKET_CONFIGURATION_AGGREGATOR,
  NEW_COMPTROLLER_LENS,
  NEW_COMPT_METHODS_FOR_EVERY_TIMELOCK,
  NEW_COMPT_METHODS_FOR_GUARDIAN_1,
  NEW_COMPT_METHODS_FOR_GUARDIAN_2,
  NEW_COMPT_METHODS_FOR_NORMAL_TIMELOCK,
  NEW_DIAMOND,
  NEW_LIQUIDATOR_IMPL,
  NEW_VAI_CONTROLLER,
  NEW_VBEP20_DELEGATE,
  OLD_COMPTROLLER_LENS,
  OLD_DIAMOND,
  OLD_LIQUIDATOR_IMPL,
  OLD_VAI_CONTROLLER,
  POOL_SPECS,
  UNITROLLER,
  VAI_UNITROLLER,
  vip550,
} from "../../vips/vip-550/bscmainnet";
import ACM_ABI from "./abi/ACMMainnet.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import LIQUIDATOR_PROXY_ABI from "./abi/LiquidatorProxy.json";
import OLD_ABI from "./abi/OldComptroller.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VAI_UNITROLLR_ABI from "./abi/VAIUnitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBEP20Delegator.json";
import COMPTROLLER_ABI from "./abi/comptroller-addendum-2.json";
import { cutParams as params } from "./utils/bscmainnet-cut-params.json";

const { bscmainnet } = NETWORK_ADDRESSES;

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const OLD_MARKET_FACET = "0xd47c074c219E6947BB350D9aD220eE20fCCC6549";
const OLD_POLICY_FACET = "0xF2095BeCa3030D43976ED46D5ca488D58354E8c9";
const OLD_REWARD_FACET = "0x05e4C8f3dbb6c2eaD4eB1f28611FA7180e79f428";
const OLD_SETTER_FACET = "0x92B26cb819335DA336f59480F0ca30F9a3f18E0a";

const NEW_MARKET_FACET = "0x6e9bD95830bb775fb9F24b9559f8894d92143CA1";
const NEW_POLICY_FACET = "0x7155227C2763228F236a0D858dccDB32740a2893";
const NEW_REWARD_FACET = "0x1d903eEa9d98a6Ac071a1f4531dc6958B4629cBE";
const NEW_SETTER_FACET = "0x4Fd17b7df6004E04A6298EdE065dE431D408fD9b";

forking(62056649, async () => {
  let unitroller: Contract;
  let comptroller: Contract;
  let accessControlManager: Contract;
  let vaiUnitroller: Contract;
  let liquidator: Contract;
  let proxyAdmin: SignerWithAddress;
  let impUnitroller: SignerWithAddress;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
    vaiUnitroller = await ethers.getContractAt(VAI_UNITROLLR_ABI, VAI_UNITROLLER);
    liquidator = await ethers.getContractAt(LIQUIDATOR_PROXY_ABI, LIQUIDATOR);
    proxyAdmin = await initMainnetUser(LIQUIDATOR_PROXY_ADMIN, parseUnits("2", 18));
    impUnitroller = await initMainnetUser(UNITROLLER, parseUnits("2", 18));

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
  });

  describe("Pre-VIP state", async () => {
    it("check current risk factors", async () => {
      const oldComptoller = await ethers.getContractAt(OLD_ABI, UNITROLLER);
      for (const market of CORE_MARKETS) {
        const data = await oldComptoller.markets(market.address);
        expect(data[0]).to.equal(true); // isListed
        expect(data[1]).to.equal(market.collateralFactor);
      }
      expect(await oldComptoller.liquidationIncentiveMantissa()).to.equal(CURRENT_LIQUIDATION_INCENTIVE);
    });
    it("unitroller should have old implementation", async () => {
      expect((await unitroller.comptrollerImplementation()).toLowerCase()).to.equal(OLD_DIAMOND.toLowerCase());
    });

    it("comptroller should have old comptrollerLens", async () => {
      expect((await comptroller.comptrollerLens()).toLowerCase()).to.equal(OLD_COMPTROLLER_LENS.toLowerCase());
    });

    it("VAI Unitroller should point to old VAI Controller", async () => {
      expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(OLD_VAI_CONTROLLER);
    });

    it("Liquidator should point to old implementation", async () => {
      const impl = await liquidator.connect(proxyAdmin).callStatic.implementation();
      expect(impl.toLowerCase()).to.equal(OLD_LIQUIDATOR_IMPL.toLowerCase());
    });

    it("unitroller should have old Facets", async () => {
      expect(await unitroller.facetAddresses()).to.include(OLD_SETTER_FACET, OLD_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.include(OLD_MARKET_FACET, OLD_POLICY_FACET);
    });
  });

  testVip("VIP-550", await vip550(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      const totalBAMarkets = MARKETS_BA.length;
      await expectEvents(
        txResponse,
        [UNITROLLER_ABI, DIAMOND_ABI, LIQUIDATOR_ABI, ACM_ABI],
        ["NewPendingImplementation", "DiamondCut", "NewLiquidationTreasuryPercent", "RoleGranted", "RoleRevoked"],
        [4, 1, 1, 35, 7],
      );
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets + 1]); // +2 for unitroller and VAI, -1 for vBNB
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewLiquidationThreshold", "NewLiquidationIncentive", "BorrowAllowedUpdated", "NewCollateralFactor"],
        [totalMarkets - 2, totalMarkets + 2, totalBAMarkets + 1, 2], // -4 for markets with 0 collateral factor +2 for emode
      );
    },
  });

  describe("Post-VIP state (emode upgrade)", async () => {
    it("unitroller should have new implementation", async () => {
      expect(await unitroller.comptrollerImplementation()).equals(NEW_DIAMOND);
    });

    it("market facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[0][2], ...cutParams[1][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_MARKET_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_MARKET_FACET)).to.deep.equal([]);
    });

    it("policy facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[2][2];
      expect(await unitroller.facetFunctionSelectors(NEW_POLICY_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_POLICY_FACET)).to.deep.equal([]);
    });

    it("reward facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = cutParams[3][2];
      expect(await unitroller.facetFunctionSelectors(NEW_REWARD_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_REWARD_FACET)).to.deep.equal([]);
    });

    it("setter facet function selectors should be replaced with new facet address", async () => {
      const functionSelectors = [...cutParams[4][2], ...cutParams[5][2]];
      expect(await unitroller.facetFunctionSelectors(NEW_SETTER_FACET)).to.deep.equal(functionSelectors);
      expect(await unitroller.facetFunctionSelectors(OLD_SETTER_FACET)).to.deep.equal([]);
    });

    it("unitroller should contain the new facet addresses", async () => {
      expect(await unitroller.facetAddresses()).to.include(NEW_SETTER_FACET, NEW_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.include(NEW_MARKET_FACET, NEW_POLICY_FACET);

      expect(await unitroller.facetAddresses()).to.not.include(OLD_SETTER_FACET, OLD_REWARD_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(OLD_MARKET_FACET, OLD_POLICY_FACET);
    });

    it("Check removed permission", async () => {
      for (const timelock of [
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ]) {
        expect(
          await accessControlManager
            .connect(impUnitroller)
            .isAllowedToCall(timelock, "_setCollateralFactor(address,uint256)"),
        ).to.equal(false);
        expect(
          await accessControlManager
            .connect(impUnitroller)
            .isAllowedToCall(timelock, "_setLiquidationIncentive(uint256)"),
        ).to.equal(false);
      }
    });

    it("Check new permission", async () => {
      // All Timelocks
      for (const method of NEW_COMPT_METHODS_FOR_EVERY_TIMELOCK) {
        expect(
          await accessControlManager.connect(impUnitroller).isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, method),
        ).to.equal(true);
        expect(
          await accessControlManager.connect(impUnitroller).isAllowedToCall(bscmainnet.FAST_TRACK_TIMELOCK, method),
        ).to.equal(true);
        expect(
          await accessControlManager.connect(impUnitroller).isAllowedToCall(bscmainnet.CRITICAL_TIMELOCK, method),
        ).to.equal(true);
      }

      // Only Normal Timelock
      for (const method of NEW_COMPT_METHODS_FOR_NORMAL_TIMELOCK) {
        expect(
          await accessControlManager.connect(impUnitroller).isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, method),
        ).to.equal(true);
      }

      // Guardian-1
      for (const method of NEW_COMPT_METHODS_FOR_GUARDIAN_1) {
        expect(await accessControlManager.connect(impUnitroller).isAllowedToCall(GUARDIAN_1, method)).to.equal(true);
      }

      // Guardian-2
      expect(
        await accessControlManager.connect(impUnitroller).isAllowedToCall(GUARDIAN_2, NEW_COMPT_METHODS_FOR_GUARDIAN_2),
      ).to.equal(true);
    });

    it("comptroller should have new comptrollerLens", async () => {
      expect(await comptroller.comptrollerLens()).to.equal(NEW_COMPTROLLER_LENS);
    });

    it("markets should have new implemenation", async () => {
      for (const market of CORE_MARKETS_WITHOUT_VBNB) {
        const marketContract = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market.address);
        expect(await marketContract.implementation()).equals(NEW_VBEP20_DELEGATE);
      }
    });

    it("comptroller should have correct markets value", async () => {
      for (const market of CORE_MARKETS) {
        const data = await comptroller.markets(market.address);
        expect(data[1]).to.equal(market.collateralFactor);
        expect(data[3]).to.equal(market.collateralFactor); // same LT
        expect(data[4]).to.equal(CURRENT_LIQUIDATION_INCENTIVE);
        expect(data[5]).to.equal(0); // corePool
        if (BORROW_PAUSED_MARKETS.includes(market.symbol)) {
          expect(data[6]).to.equal(false); // isBorrowAllowed
        } else {
          expect(data[6]).to.equal(true);
        }
      }
    });

    it("VAI Controller should point to new impl", async () => {
      expect(await vaiUnitroller.vaiControllerImplementation()).to.equal(NEW_VAI_CONTROLLER);
    });

    it("Liquidator should point to new implementation", async () => {
      const impl = await liquidator.connect(proxyAdmin).callStatic.implementation();
      expect(impl).to.equal(NEW_LIQUIDATOR_IMPL);
    });

    it("MarketConfigurationAggregator should not have ACM permissions", async () => {
      expect(
        await accessControlManager
          .connect(impUnitroller)
          .isAllowedToCall(MARKET_CONFIGURATION_AGGREGATOR, "setCollateralFactor(address,uint256,uint256)"),
      ).to.equal(false);
      expect(
        await accessControlManager
          .connect(impUnitroller)
          .isAllowedToCall(MARKET_CONFIGURATION_AGGREGATOR, "setLiquidationIncentive(address,uint256)"),
      ).to.equal(false);
      expect(
        await accessControlManager
          .connect(impUnitroller)
          .isAllowedToCall(MARKET_CONFIGURATION_AGGREGATOR, "setIsBorrowAllowed(uint96,address,bool)"),
      ).to.equal(false);
    });
  });

  describe("Post-VIP state (Stablecoin emode group)", async () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(POOL_SPECS.id);
    });

    it("should set the newly created pool as active with correct label", async () => {
      const newPool = await comptroller.pools(POOL_SPECS.id);
      expect(newPool.label).to.equals(POOL_SPECS.label);
      expect(newPool.isActive).to.equals(true);
      expect(newPool.allowCorePoolFallback).to.equal(POOL_SPECS.allowCorePoolFallback);
    });

    it("should set the correct risk parameters to all pool markets", async () => {
      for (const market of POOL_SPECS.marketsConfig) {
        const marketData = await comptroller.poolMarkets(POOL_SPECS.id, market.address);
        expect(marketData.marketPoolId).to.be.equal(POOL_SPECS.id);
        expect(marketData.isListed).to.be.equal(true);
        expect(marketData.collateralFactorMantissa).to.be.equal(market.collateralFactor);
        expect(marketData.liquidationThresholdMantissa).to.be.equal(market.liquidationThreshold);
        expect(marketData.liquidationIncentiveMantissa).to.be.equal(market.liquidationIncentive);
        expect(marketData.isBorrowAllowed).to.be.equal(market.borrowAllowed);
      }
    });
  });
});
