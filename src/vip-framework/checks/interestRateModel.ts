import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import RATE_MODEL_ABI from "../abi/il_rateModel.json";
import TWO_KINKS_RATE_MODEL_ABI from "../abi/twoKinksIRM.json";
import TWO_KINKS_RATE_MODEL_IL_ABI from "../abi/twoKinksIRMIL.json";

const DEFAULT_BLOCKS_PER_YEAR = BigNumber.from(70080000);

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

export function checkTwoKinksInterestRate(
  rateModelAddress: string,
  symbol: string,
  {
    base,
    multiplier,
    kink1,
    multiplier2,
    base2,
    kink2,
    jump,
  }: {
    base: string;
    multiplier: string;
    kink1: string;
    multiplier2: string;
    base2: string;
    kink2: string;
    jump: string;
  },
  blocksPerYear: BigNumber = DEFAULT_BLOCKS_PER_YEAR,
) {
  describe(`${symbol} interest rate model`, () => {
    let rateModel: Contract;

    before(async () => {
      rateModel = await ethers.getContractAt(TWO_KINKS_RATE_MODEL_ABI, rateModelAddress);
    });

    it(`should have base = ${base}`, async () => {
      const basePerBlock = utils.parseUnits(base, 18).div(blocksPerYear);
      expect(await rateModel.BASE_RATE_PER_BLOCK()).to.equal(basePerBlock);
    });

    it(`should have multiplier = ${multiplier}`, async () => {
      const multiplierPerBlock = utils.parseUnits(multiplier, 18).div(blocksPerYear);
      expect(await rateModel.MULTIPLIER_PER_BLOCK()).to.equal(multiplierPerBlock);
    });

    it(`should have kink1 = ${kink1}`, async () => {
      expect(await rateModel.KINK_1()).to.equal(utils.parseUnits(kink1, 18));
    });

    it(`should have multiplier2 = ${multiplier2}`, async () => {
      const multiplierPerBlock = utils.parseUnits(multiplier2, 18).div(blocksPerYear);
      expect(await rateModel.MULTIPLIER_2_PER_BLOCK()).to.equal(multiplierPerBlock);
    });

    it(`should have base2 = ${base2}`, async () => {
      const basePerBlock = utils.parseUnits(base2, 18).div(blocksPerYear);
      expect(await rateModel.BASE_RATE_2_PER_BLOCK()).to.equal(basePerBlock);
    });

    it(`should have kink2 = ${kink2}`, async () => {
      expect(await rateModel.KINK_2()).to.equal(utils.parseUnits(kink2, 18));
    });

    it(`should have jump = ${jump}`, async () => {
      const jumpPerBlock = utils.parseUnits(jump, 18).div(blocksPerYear);
      expect(await rateModel.JUMP_MULTIPLIER_PER_BLOCK()).to.equal(jumpPerBlock);
    });
  });
}

export function checkTwoKinksInterestRateIL(
  rateModelAddress: string,
  symbol: string,
  {
    base,
    multiplier,
    kink1,
    multiplier2,
    base2,
    kink2,
    jump,
  }: {
    base: string;
    multiplier: string;
    kink1: string;
    multiplier2: string;
    base2: string;
    kink2: string;
    jump: string;
  },
  blocksPerYear: BigNumber = DEFAULT_BLOCKS_PER_YEAR,
) {
  describe(`${symbol} interest rate model`, () => {
    let rateModel: Contract;

    before(async () => {
      rateModel = await ethers.getContractAt(TWO_KINKS_RATE_MODEL_IL_ABI, rateModelAddress);
    });

    it(`should have base = ${base}`, async () => {
      const basePerBlock = utils.parseUnits(base, 18).div(blocksPerYear);
      expect(await rateModel.BASE_RATE_PER_BLOCK_OR_SECOND()).to.equal(basePerBlock);
    });

    it(`should have multiplier = ${multiplier}`, async () => {
      const multiplierPerBlock = utils.parseUnits(multiplier, 18).div(blocksPerYear);
      expect(await rateModel.MULTIPLIER_PER_BLOCK_OR_SECOND()).to.equal(multiplierPerBlock);
    });

    it(`should have kink1 = ${kink1}`, async () => {
      expect(await rateModel.KINK_1()).to.equal(utils.parseUnits(kink1, 18));
    });

    it(`should have multiplier2 = ${multiplier2}`, async () => {
      const multiplierPerBlock = utils.parseUnits(multiplier2, 18).div(blocksPerYear);
      expect(await rateModel.MULTIPLIER_2_PER_BLOCK_OR_SECOND()).to.equal(multiplierPerBlock);
    });

    it(`should have base2 = ${base2}`, async () => {
      const basePerBlock = utils.parseUnits(base2, 18).div(blocksPerYear);
      expect(await rateModel.BASE_RATE_2_PER_BLOCK_OR_SECOND()).to.equal(basePerBlock);
    });

    it(`should have kink2 = ${kink2}`, async () => {
      expect(await rateModel.KINK_2()).to.equal(utils.parseUnits(kink2, 18));
    });

    it(`should have jump = ${jump}`, async () => {
      const jumpPerBlock = utils.parseUnits(jump, 18).div(blocksPerYear);
      expect(await rateModel.JUMP_MULTIPLIER_PER_BLOCK_OR_SECOND()).to.equal(jumpPerBlock);
    });
  });
}
