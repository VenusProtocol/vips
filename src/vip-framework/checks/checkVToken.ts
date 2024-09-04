import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";

import ERC20_ABI from "../abi/erc20.json";
import VTOKEN_ABI from "../abi/il_vToken.json";

export interface TokenSpec {
  name?: string;
  symbol: string;
  address: string;
  decimals: number;
}

export interface VTokenSpec {
  name: string;
  symbol: string;
  decimals: number;
  underlying: string | TokenSpec;
  exchangeRate: BigNumberish;
  comptroller: string;
}

export function checkVToken(
  vTokenAddress: string,
  { name, symbol, decimals, underlying, exchangeRate, comptroller }: VTokenSpec,
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

    if (typeof underlying === "string") {
      it(`should have underlying = "${underlying}"`, async () => {
        expect(await vToken.underlying()).to.equal(underlying);
      });
    } else {
      it(`should have underlying = "${underlying.address}"`, async () => {
        expect(await vToken.underlying()).to.equal(underlying.address);
      });

      describe("Underlying", () => {
        const underlyingToken = new ethers.Contract(underlying.address, ERC20_ABI, ethers.provider);
        it(`should have underlying symbol = "${underlying.symbol}"`, async () => {
          expect(await underlyingToken.symbol()).to.equal(underlying.symbol);
        });

        it(`should have underlying decimals = "${underlying.decimals}"`, async () => {
          expect(await underlyingToken.decimals()).to.equal(underlying.decimals);
        });
      });
    }

    it(`should have initial exchange rate of ${exchangeRate.toString()}`, async () => {
      expect(await vToken.exchangeRateStored()).to.equal(exchangeRate);
    });

    it("should have the correct Comptroller", async () => {
      expect(await vToken.comptroller()).to.equal(comptroller);
    });
  });
}
