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
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  CORE_MARKETS,
  CORE_MARKETS_WITHOUT_VBNB,
  CURRENT_LIQUIDATION_INCENTIVE,
  LIQUIDATOR,
  LIQUIDATOR_PROXY_ADMIN,
  MARKET_CONFIGURATION_AGGREGATOR,
  NEW_COMPTROLLER_LENS,
  NEW_COMPT_METHODS,
  NEW_DIAMOND,
  NEW_LIQUIDATOR_IMPL,
  NEW_VAI_CONTROLLER,
  NEW_VBEP20_DELEGATE,
  OLD_COMPTROLLER_LENS,
  OLD_DIAMOND,
  OLD_LIQUIDATOR_IMPL,
  OLD_VAI_CONTROLLER,
  UNITROLLER,
  VAI_UNITROLLER,
  vip550,
} from "../../vips/vip-550/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DIAMOND_ABI from "./abi/Diamond.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import LIQUIDATOR_PROXY_ABI from "./abi/LiquidatorProxy.json";
import OLD_ABI from "./abi/OldComptroller.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VAI_UNITROLLR_ABI from "./abi/VAIUnitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBEP20Delegator.json";
import { cutParams as params } from "./utils/bsctestnet-cut-params.json";

type CutParam = [string, number, string[]];
const cutParams = params as unknown as CutParam[];

const OLD_SETTER_FACET = "0xeD1fd1D134b10dF8F84BbC3C89881A929B0c6F47";
const OLD_REWARD_FACET = "0x1C10F03827530f514Ba14065ec3D5f1496f35418";
const OLD_MARKET_FACET = "0x1c7B1e28A43619123F0bF9DB8aeEc64aA535b9EC";
const OLD_POLICY_FACET = "0x642EE02aFBE47C69c0980Ea61131cD97884058a7";

const NEW_SETTER_FACET = "0x675d55BE8Ac03400dEE081076E16A00d3Fb2b40B";
const NEW_REWARD_FACET = "0xcD598bDcfF0433395918512359745f83F5730C49";
const NEW_MARKET_FACET = "0x679cd0443207C1Fb411d59B1E10E23b3850d1337";
const NEW_POLICY_FACET = "0xFc6A44E5B5960444a6D25D6F85e3d7D79d26D8Ef";

forking(64979496, async () => {
  let unitroller: Contract;
  let comptroller: Contract;
  let accessControlManager: Contract;
  let vaiUnitroller: Contract;
  let liquidator: Contract;
  let proxyAdmin: SignerWithAddress;

  before(async () => {
    unitroller = await ethers.getContractAt(DIAMOND_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
    vaiUnitroller = await ethers.getContractAt(VAI_UNITROLLR_ABI, VAI_UNITROLLER);
    liquidator = await ethers.getContractAt(LIQUIDATOR_PROXY_ABI, LIQUIDATOR);
    proxyAdmin = await initMainnetUser(LIQUIDATOR_PROXY_ADMIN, parseUnits("2", 18));
    console.log(`Setting max stale period...`);
    for (const market of CORE_MARKETS) {
      // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
        market.asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.REDSTONE_ORACLE,
        market.asset,
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
  });

  testVip("VIP-550", await vip550(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS_WITHOUT_VBNB.length;
      const totalNewMethods = NEW_COMPT_METHODS.length;
      await expectEvents(
        txResponse,
        [UNITROLLER_ABI, DIAMOND_ABI, LIQUIDATOR_ABI, ACM_ABI],
        [
          "NewPendingImplementation",
          "DiamondCut",
          "NewLiquidationTreasuryPercent",
          "PermissionGranted",
          "PermissionRevoked",
        ],
        [4, 1, 1, 27, 5],
      );
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets + 2]); // +2 for unitroller and VAI
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewLiquidationThreshold", "NewLiquidationIncentive", "BorrowAllowedUpdated"],
        [totalMarkets - 2, totalMarkets + 1, totalMarkets + 1], // +1 for vBNB, -3 for markets with 0 collateral factor
      );
    },
  });

  describe("Post-VIP state", async () => {
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
      expect(
        await accessControlManager.hasPermission(
          NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
          UNITROLLER,
          "_setCollateralFactor(address,uint256)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
          UNITROLLER,
          "_setLiquidationIncentive(uint256)",
        ),
      ).to.equal(false);
    });

    it("Check new permission", async () => {
      for (const method of NEW_COMPT_METHODS) {
        expect(
          await accessControlManager.hasPermission(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK, UNITROLLER, method),
        ).to.equal(true);
        expect(
          await accessControlManager.hasPermission(
            NETWORK_ADDRESSES.bsctestnet.FAST_TRACK_TIMELOCK,
            UNITROLLER,
            method,
          ),
        ).to.equal(true);
        expect(
          await accessControlManager.hasPermission(NETWORK_ADDRESSES.bsctestnet.CRITICAL_TIMELOCK, UNITROLLER, method),
        ).to.equal(true);
      }
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
        expect(data[6]).to.equal(true); // isBorrowAllowed
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
        await accessControlManager.hasPermission(
          MARKET_CONFIGURATION_AGGREGATOR,
          UNITROLLER,
          "setCollateralFactor(address,uint256,uint256)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          MARKET_CONFIGURATION_AGGREGATOR,
          UNITROLLER,
          "setLiquidationIncentive(address,uint256)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          MARKET_CONFIGURATION_AGGREGATOR,
          UNITROLLER,
          "setIsBorrowAllowed(uint96,address,bool)",
        ),
      ).to.equal(false);
    });
  });
});
