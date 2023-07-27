import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip149 } from "../../vips/vip-149";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VBEP20_ABI from "./abi/VBep20Abi.json";

const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VTRXOLD = "0x61edcfe8dd6ba3c891cb9bec2dc7657b3b422e93";
const VTRXOLD_RATE_MODEL = "0x8A1638927f4351F4a2fCca1fB30599c0b8Dc28f6";
const VTUSDOLD_RATE_MODEL = "0xf8923c101d39584387FE5adE1f2230687D7D5a22";

forking(30321587, () => {
  let rateModel: ethers.Contract;
  let vTusdOld: ethers.Contract;
  let vTrxOld: ethers.Contract;
  const provider = ethers.provider;

  const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
    const BLOCKS_PER_YEAR = BigNumber.from("10512000");
    return ratePerYear.div(BLOCKS_PER_YEAR);
  };

  before(async () => {
    vTusdOld = new ethers.Contract(VTUSDOLD, VBEP20_ABI, provider);
    vTrxOld = new ethers.Contract(VTRXOLD, VBEP20_ABI, provider);
  });

  testVip("VIP-149 Risk Parameters Update", vip149());

  describe("Post-VIP behavior", async () => {
    it("Should match new interest rate model after VIP", async () => {
      expect(await vTrxOld.interestRateModel()).to.equal(VTRXOLD_RATE_MODEL);
      expect(await vTusdOld.interestRateModel()).to.equal(VTUSDOLD_RATE_MODEL);
    });
  });

  describe("TRX (old) rate model parameters", async () => {
    before(async () => {
      rateModel = new ethers.Contract(VTRXOLD_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=2%", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
    });

    it("has kink=1%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.01", 18));
    });

    it("has multiplier=100%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("1", 18)));
    });

    it("has jumpMultiplier=300%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("3", 18)));
    });
  });

  describe("TUSD (old) rate model parameters", async () => {
    before(async () => {
      rateModel = new ethers.Contract(VTUSDOLD_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=0", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(0);
    });

    it("has kink=40%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.40", 18));
    });

    it("has multiplier=5%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.05", 18)));
    });

    it("has jumpMultiplier=250%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
    });
  });
});
