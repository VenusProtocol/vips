import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip130 } from "../../vips/vip-130";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VBEP20_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const VXVS = "0x151b1e2635a717bcdc836ecd6fbb62b674fe3e1d";
const VTRXOLD = "0x61edcfe8dd6ba3c891cb9bec2dc7657b3b422e93";
const VSXP = "0x2ff3d0f6990a40261c66e1ff2017acbc282eb6d0";
const VBETH = "0x972207a639cc1b374b893cc33fa251b55ceb7c07";
const VWBETH = "0x6cfdec747f37daf3b87a35a1d9c8ad3063a1a8a0";
const BETH = "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B";
const BETH_FEED = "0x2a3796273d47c4ed363b361d3aefb7f7e2a13782";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VTRXOLD_RATE_MODEL = "0x75947FF33C8a7E154280100f37D82b60518BD74B";
const VSXP_RATE_MODEL = "0xDd0F61dc0eA1Cf49F54A181EE1A4896f46EB1E91";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const VTRXOLD_RATE_MODEL_CURR = "0x8B831e2c6f184F552Fb4c2CB7c01Ff76FeC93881";
const VSXP_RATE_MODEL_CURR = "0x32450305D6c692269B3cBf9730d99104f80fce23";

forking(29288200, () => {
  let comptroller: Contract;
  let rateModel: Contract;
  let vSxp: Contract;
  let vTrxOld: Contract;
  const provider = ethers.provider;

  const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
    const BLOCKS_PER_YEAR = BigNumber.from("10512000");
    return ratePerYear.div(BLOCKS_PER_YEAR);
  };

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Address checks", async () => {
    before(async () => {
      vSxp = new ethers.Contract(VSXP, VBEP20_ABI, ethers.provider);
      vTrxOld = new ethers.Contract(VTRXOLD, VBEP20_ABI, ethers.provider);

      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, BETH, BETH_FEED, NORMAL_TIMELOCK);
    });

    it("Should match current interest rate model", async () => {
      expect(await vTrxOld.interestRateModel()).to.equal(VTRXOLD_RATE_MODEL_CURR);
      expect(await vSxp.interestRateModel()).to.equal(VSXP_RATE_MODEL_CURR);
    });
  });

  describe("Caps Check", async () => {
    it("supply cap of XVS (old) equals 1,300,000", async () => {
      const oldCap = await comptroller.supplyCaps(VXVS);
      expect(oldCap).to.equal(parseUnits("1300000", 18));
    });

    it("supply cap of BETH equals 21890", async () => {
      const oldCap = await comptroller.supplyCaps(VBETH);
      expect(oldCap).to.equal(parseUnits("21890", 18));
    });

    it("supply cap of WBETH equals 300", async () => {
      const oldCap = await comptroller.supplyCaps(VWBETH);
      expect(oldCap).to.equal(parseUnits("300", 18));
    });

    it("borrow cap of WBETH  equals 200", async () => {
      const oldCap = await comptroller.borrowCaps(VWBETH);
      expect(oldCap).to.equal(parseUnits("200", 18));
    });

    it("borrow cap of BETH equals 16450", async () => {
      const oldCap = await comptroller.borrowCaps(VBETH);
      expect(oldCap).to.equal(parseUnits("16450", 18));
    });

    it("collateral factor of BETH equals 60%", async () => {
      const collateralFactor = (await comptroller.markets(VBETH)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.60", 18));
    });
  });

  testVip("VIP-130 Risk Parameters Update", vip130(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewBorrowCap", "NewSupplyCap", "NewCollateralFactor", "Failure"],
        [2, 3, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("supply cap of XVS (old) equals 1,500,000", async () => {
      const newCap = await comptroller.supplyCaps(VXVS);
      expect(newCap).to.equal(parseUnits("1500000", 18));
    });

    it("supply cap of BETH equals 0", async () => {
      const newCap = await comptroller.supplyCaps(VBETH);
      expect(newCap).to.equal(0);
    });

    it("supply cap of WBETH equals 800", async () => {
      const newCap = await comptroller.supplyCaps(VWBETH);
      expect(newCap).to.equal(parseUnits("800", 18));
    });

    it("borrow cap of WBETH  equals 550", async () => {
      const newCap = await comptroller.borrowCaps(VWBETH);
      expect(newCap).to.equal(parseUnits("550", 18));
    });

    it("borrow cap of BETH equals 1", async () => {
      const newCap = await comptroller.borrowCaps(VBETH);
      expect(newCap).to.equal(1);
    });

    it("collateral factor of BETH equals 50%", async () => {
      const collateralFactor = (await comptroller.markets(VBETH)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.50", 18));
    });

    it("Should match new interest rate model after VIP", async () => {
      expect(await vTrxOld.interestRateModel()).to.equal(VTRXOLD_RATE_MODEL);
      expect(await vSxp.interestRateModel()).to.equal(VSXP_RATE_MODEL);
    });
  });

  describe("TRX (old) rate model parameters", async () => {
    before(async () => {
      rateModel = new ethers.Contract(VTRXOLD_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=2%", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
    });

    it("has kink=60%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.60", 18));
    });

    it("has multiplier=100%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("1", 18)));
    });

    it("has jumpMultiplier=300%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("3", 18)));
    });
  });

  describe("SXP rate model parameters", async () => {
    before(async () => {
      rateModel = new ethers.Contract(VSXP_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=2%", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
    });

    it("has kink=60%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.60", 18));
    });

    it("has multiplier=30%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.3", 18)));
    });

    it("has jumpMultiplier=300%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("3", 18)));
    });
  });
});
