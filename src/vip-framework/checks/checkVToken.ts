import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";

import VTOKEN_ABI from "../abi/il_vToken.json";

export async function checkVToken(
  vTokenAddress: string,
  {
    name,
    symbol,
    decimals,
    underlying,
    exchangeRate,
    comptroller,
  }: {
    name: string;
    symbol: string;
    decimals: number;
    underlying: string;
    exchangeRate: BigNumberish;
    comptroller: string;
  },
) {
  describe(symbol, () => {
    let vToken: Contract;

    before(async () => {
      vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
    });

    it(`should have name = "${name}"`, async () => {
      expect(await vToken.name()).to.equal(name);
    });

    it(`should have symbol = "${symbol}"`, async () => {
      expect(await vToken.symbol()).to.equal(symbol);
    });

    it(`should have ${decimals.toString()} decimals`, async () => {
      expect(await vToken.decimals()).to.equal(decimals);
    });

    it(`should have underlying = "${underlying}"`, async () => {
      expect(await vToken.underlying()).to.equal(underlying);
    });

    it(`should have initial exchange rate of ${exchangeRate.toString()}`, async () => {
      expect(await vToken.exchangeRateStored()).to.equal(exchangeRate);
    });

    it("should have the correct Comptroller", async () => {
      expect(await vToken.comptroller()).to.equal(comptroller);
    });
  });
}
