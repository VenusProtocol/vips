import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip128Testnet } from "../../../vips/vip-128/vip-128-testnet";
import WBETH_ABI from "./abi/IERC20UpgradableAbi.json";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VWBETH_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const WBETH = "0xccBB1b1Be3663D22530aAB798e90DE29e2cbC8EE";
const VWBETH = "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b";
const INITIAL_VTOKENS = parseUnits("5.499943", 8);
const VTOKEN_RECEIVER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const RATE_MODEL = "0xebb0B3Ca7c4095b1392C75e96f8Dc565c9047FAa";
const BINANCE_ORACLE = "0xB58BFDCE610042311Dc0e034a80Cc7776c1D68f5";
const BINANCE_ORACLE_OLD = "0x1A915beDbf760e0951Ff8c3da9679073FaaA5a27";
const BINANCE_ORACLE_NEW = "0x693A5ae5F9b8da5b8125f9BC0d8f04C7c63d2384";

const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
  const BLOCKS_PER_YEAR = BigNumber.from("10512000");
  return ratePerYear.div(BLOCKS_PER_YEAR);
};

forking(30720569, async () => {
  let comptroller: Contract;
  let wbeth: Contract;
  let vWbeth: Contract;
  let oracle: Contract;
  let rateModel: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    wbeth = new ethers.Contract(WBETH, WBETH_ABI, provider);
    vWbeth = new ethers.Contract(VWBETH, VWBETH_ABI, provider);
    oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, provider);
    rateModel = new ethers.Contract(RATE_MODEL, RATE_MODEL_ABI, ethers.provider);

    // To get the admin address of the proxy
    // import { getAdminAddress } from '@openzeppelin/upgrades-core';
    // const adminAddress = await getAdminAddress(ethers.provider, BINANCE_ORACLE);
  });

  describe("Pre-VIP behavior", async () => {
    it("Implementation of BinanceOracle", async () => {
      const impl = await getImplementationAddress(ethers.provider, BINANCE_ORACLE);
      expect(impl).to.equal(BINANCE_ORACLE_OLD);
    });
  });

  testVip("VIP-128-testnet Add WBETH Market", await vip128Testnet(24 * 60 * 60 * 3), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "VenusSupplySpeedUpdated",
          "VenusBorrowSpeedUpdated",
          "NewCollateralFactor",
        ],
        [1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Implementation of BinanceOracle", async () => {
      const impl = await getImplementationAddress(ethers.provider, BINANCE_ORACLE);
      expect(impl).to.equal(BINANCE_ORACLE_NEW);
    });

    it("adds a new WBETH market", async () => {
      const market = await comptroller.markets(VWBETH);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.50", 18));
    });

    it("reserves factor equal 20% of WBETH", async () => {
      const reserveFactor = await vWbeth.reserveFactorMantissa();
      expect(reserveFactor).to.equal(parseUnits("0.2", 18));
    });

    it("sets the supply cap to 300 WBETH", async () => {
      const newCap = await comptroller.supplyCaps(VWBETH);
      expect(newCap).to.equal(parseUnits("300", 18));
    });

    it("sets the borrow cap to 200 WBETH", async () => {
      const newCap = await comptroller.borrowCaps(VWBETH);
      expect(newCap).to.equal(parseUnits("200", 18));
    });

    it("has base=0%", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0", 18)));
    });

    it("has kink=75%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.75", 18));
    });

    it("has multiplier=10%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.10", 18)));
    });

    it("has jumpMultiplier=200%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2", 18)));
    });

    it("sets the supply and borrow speeds to 596440972222220", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VWBETH);
      const borrowSpeed = await comptroller.venusBorrowSpeeds(VWBETH);
      expect(supplySpeed).to.equal("596440972222220");
      expect(borrowSpeed).to.equal("596440972222220");
    });

    it("does not leave WBETH on the balance of the governance", async () => {
      const timelockBalance = await wbeth.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("does not leave vWBETH on the balance of the governance", async () => {
      const timelockBalance = await vWbeth.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("moves INITIAL_VTOKENS vWBETH to VTOKEN_RECEIVER", async () => {
      const vTokenReceiverBalance = await vWbeth.balanceOf(VTOKEN_RECEIVER);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS);
    });

    it("sets the admin to governance", async () => {
      expect(await vWbeth.admin()).to.equal(NORMAL_TIMELOCK);
    });

    it("get correct price from oracle ", async () => {
      const price = await oracle.getUnderlyingPrice(VWBETH);
      expect(price).to.equal(parseUnits("1649.670295770000000000", 18));
    });
  });
});
