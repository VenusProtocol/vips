import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import RATE_MODEL_ABI from "../abi/il_rateModel.json";

const DEFAULT_BLOCKS_PER_YEAR = BigNumber.from(10512000);

export function checkInterestRate(
  rateModelAddress: string,
  symbol: string,
  {
    base,
    multiplier,
    jump,
    kink,
  }: {
    base: string;
    multiplier: string;
    jump?: string;
    kink?: string;
  },
  blocksPerYear: BigNumber = DEFAULT_BLOCKS_PER_YEAR,
) {
  describe(`${symbol} interest rate model`, () => {
    let rateModel: Contract;

    before(async () => {
      rateModel = await ethers.getContractAt(RATE_MODEL_ABI, rateModelAddress);
    });

    it(`should have base = ${base}`, async () => {
      const basePerBlock = utils.parseUnits(base, 18).div(blocksPerYear);
      expect(await rateModel.baseRatePerBlock()).to.equal(basePerBlock);
    });

    if (jump !== undefined) {
      it(`should have jump = ${jump}`, async () => {
        const jumpPerBlock = utils.parseUnits(jump, 18).div(blocksPerYear);
        expect(await rateModel.jumpMultiplierPerBlock()).to.equal(jumpPerBlock);
      });
    }

    it(`should have multiplier = ${multiplier}`, async () => {
      const multiplierPerBlock = utils.parseUnits(multiplier, 18).div(blocksPerYear);
      expect(await rateModel.multiplierPerBlock()).to.equal(multiplierPerBlock);
    });

    if (kink !== undefined) {
      it(`should have kink = ${kink}`, async () => {
        expect(await rateModel.kink()).to.equal(utils.parseUnits(kink, 18));
      });
    }
  });
}
