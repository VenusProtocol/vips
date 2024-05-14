import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip128 } from "../../../vips/vip-128/vip-128";
import WBETH_ABI from "./abi/IERC20UpgradableAbi.json";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VWBETH_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const INITIAL_VTOKENS = parseUnits("5.499943", 8);
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTOKEN_RECEIVER = "0x7d3217feb6f310f7e7b7c8ee130db59dcad1dd45";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const BINANCE_ORACLE_OLD = "0x73760D55bF10cf9D265A126D349bdd5f64326c0e";
const BINANCE_ORACLE_NEW = "0xe38AbE42948ef249E84f4e935e4f56483C1EE3B9";
const RATE_MODEL = "0x871A82082482657B9df62Dea21509023F28c147C";

const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
  const BLOCKS_PER_YEAR = BigNumber.from("10512000");
  return ratePerYear.div(BLOCKS_PER_YEAR);
};

forking(29131121, async () => {
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
  });

  describe("Pre-VIP behavior", async () => {
    it("Implementation of BinanceOracle", async () => {
      const impl = await getImplementationAddress(ethers.provider, BINANCE_ORACLE);
      expect(impl).to.equal(BINANCE_ORACLE_OLD);
    });
  });

  testVip("VIP-128 Add WBETH Market", await vip128(24 * 60 * 60 * 3), {
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

    it("sets the supply and borrow speeds to 596440972222220", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VWBETH);
      const borrowSpeed = await comptroller.venusBorrowSpeeds(VWBETH);
      expect(supplySpeed).to.equal("596440972222220");
      expect(borrowSpeed).to.equal("596440972222220");
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
      expect(price).to.equal(parseUnits("1676.320518890000000000", 18));
    });
  });
});
