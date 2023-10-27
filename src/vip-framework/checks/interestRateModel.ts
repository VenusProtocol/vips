import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import RATE_MODEL_ABI from "../abi/il_rateModel.json";

const BLOCKS_PER_YEAR = BigNumber.from(10512000);

export async function checkInterestRate(
  RATE_MODEL: string,
  symbol: string,
  {
    base,
    multiplier,
    jump,
    kink,
  }: {
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  },
) {
  const rateModel: Contract = await ethers.getContractAt(RATE_MODEL_ABI, RATE_MODEL);

  describe(`${symbol} interest rate model`, () => {
    it(`should have base = ${base}`, async () => {
      const basePerBlock = utils.parseUnits(base, 18).div(BLOCKS_PER_YEAR);
      expect(await rateModel.baseRatePerBlock()).to.equal(basePerBlock);
    });

    it(`should have jump = ${jump}`, async () => {
      const jumpPerBlock = utils.parseUnits(jump, 18).div(BLOCKS_PER_YEAR);
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(jumpPerBlock);
    });

    it(`should have multiplier = ${multiplier}`, async () => {
      const multiplierPerBlock = utils.parseUnits(multiplier, 18).div(BLOCKS_PER_YEAR);
      expect(await rateModel.multiplierPerBlock()).to.equal(multiplierPerBlock);
    });

    it(`should have kink = ${kink}`, async () => {
      expect(await rateModel.kink()).to.equal(utils.parseUnits(kink, 18));
    });
  });
}
