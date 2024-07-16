import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { MarketInformation, vip217 } from "../../vips/vip-217";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

type UnderlyingTokenContracts = {
  [key: string]: Contract;
};

const markets: MarketInformation[] = [
  {
    name: "ankrBNB",
    vToken: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
    underlying: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
    badDebt: "108890115080027695179", // 108.890115080027695179
  },
  {
    name: "BNBx",
    vToken: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
    underlying: "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275",
    badDebt: "654859606916027127141", // 654.859606916027127141
  },
  {
    name: "stkBNB",
    vToken: "0xcc5D9e502574cda17215E70bC0B4546663785227",
    underlying: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
    badDebt: "46887992971984503730", // 46.88799297198450373
  },
  {
    name: "WBNB",
    vToken: "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    badDebt: "275071884556669618361", // 275.071884556669618361
  },
];

forking(34340570, async () => {
  const underlyingTokenContracts: UnderlyingTokenContracts = {};

  before(async () => {
    for (const market of markets) {
      underlyingTokenContracts[market.name] = await ethers.getContractAt(IERC20_ABI, market.underlying);
    }
  });

  describe("Pre-VIP behavior", async () => {
    markets.forEach(market => {
      it(`Check ${market.name}`, async () => {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, market.vToken);
        expect(await vToken.badDebt()).to.equal(market.badDebt);
        market.initialBalance = await underlyingTokenContracts[market.name].balanceOf(market.vToken);
      });
    });
  });

  testVip("VIP-217 Restore bad debt", await vip217(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTREASURY_ABI, VTOKEN_ABI],
        ["WithdrawTreasuryBEP20", "BadDebtRecovered", "NewShortfallContract", "Failure"],
        [4, 4, 8, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    markets.forEach(market => {
      it(`Check ${market.name}`, async () => {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, market.vToken);
        expect(await vToken.badDebt()).to.equal(0);

        // Check vToken balance of underlying
        const currentBalance = await underlyingTokenContracts[market.name].balanceOf(market.vToken);
        const delta = currentBalance.sub(market.initialBalance);
        expect(delta).equals(market.badDebt);
      });
    });
  });
});
