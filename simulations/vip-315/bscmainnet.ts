import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStaleCoreAssets } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import {
  COMMUNITY_WALLET,
  COMMUNITY_WALLET_USDT_AMOUNT,
  TOKEN_REDEEMER,
  USDT,
  VAI,
  VAI_CONTROLLER,
  VTREASURY,
  entries,
  expectedCommunityWithdrawals,
  shortfalls,
  underlyingWithdrawals,
  vTokenConfigs,
  vTokenWithdrawals,
  vaiDebts,
  vip315,
} from "../../vips/vip-315/bscmainnet";
import ERC20_ABI from "./abi/IERC20.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController.json";
import VTOKEN_ABI from "./abi/VBep20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

const vTokenAt = (vTokenAddress: string): Contract => {
  return new Contract(vTokenAddress, VTOKEN_ABI, ethers.provider);
};

const erc20At = (tokenAddress: string): Contract => {
  return new Contract(tokenAddress, ERC20_ABI, ethers.provider);
};

const balance = async (
  symbol: keyof typeof vTokenConfigs | "VAI",
  userAddress: string
): Promise<BigNumber> => {
  const underlyingAddress = symbol == "VAI" ? VAI : vTokenConfigs[symbol].underlying;
  if (underlyingAddress === ethers.constants.AddressZero) {
    return ethers.provider.getBalance(userAddress);
  }
  return erc20At(underlyingAddress).balanceOf(userAddress);
}

forking(39602646, () => {
  const usdt = erc20At(USDT);
  let prevBalancesOfCommunityWallet: Record<string, BigNumber>;
  const vaiController = new Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, ethers.provider);

  before(async () => {
    prevBalancesOfCommunityWallet = Object.fromEntries(await Promise.all(
      entries(expectedCommunityWithdrawals).map(async ([symbol, _]) => {
        return [symbol, await balance(symbol, COMMUNITY_WALLET)];
      })
    ));
    await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP state", () => {
    entries(underlyingWithdrawals).forEach(([vTokenSymbol, amount]) => {
      it(`has treasury balance >=${amount} ${vTokenSymbol.slice(1)} units`, async () => {
        const treasuryBalance = await balance(vTokenSymbol, VTREASURY);
        expect(treasuryBalance).to.be.gte(amount);
      });
    });

    for (const [symbol, debts] of entries(shortfalls)) {
      for (const [borrower, _] of Object.entries(debts)) {
        it(`has recorded nonzero debt for ${borrower} in ${symbol.slice(1)}`, async () => {
          const vToken = new Contract(vTokenConfigs[symbol].address, VTOKEN_ABI, ethers.provider);
          expect(await vToken.callStatic.borrowBalanceCurrent(borrower)).to.be.gt(0);
        });
      }
    }
  });

  testVip("VIP-315", vip315(), {
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D", // Custom supporter to prevent overriding community wallet BNB balance
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      //await expectEvents(txResponse, [VTOKEN_ABI], ["RepayBorrow"], [97]);
      //await expectEvents(txResponse, [VAI_CONTROLLER_ABI], ["RepayVAI"], [24]);
      //await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [19]);
    },
  });

  describe("Post-VIP behavior", () => {
    for (const [symbol, debts] of entries(shortfalls)) {
      for (const [borrower, _] of Object.entries(debts)) {
        it(`repays ${borrower}'s ${symbol.slice(1)} debt in full`, async () => {
          const vToken = new Contract(vTokenConfigs[symbol].address, VTOKEN_ABI, ethers.provider);
          expect(await vToken.callStatic.borrowBalanceCurrent(borrower)).to.equal(0);
        });
      }
    }

    for (const [borrower, _] of Object.entries(vaiDebts)) {
      it(`repays ${borrower}'s VAI debt in full`, async () => {
        expect(await vaiController.callStatic.getVAIRepayAmount(borrower)).to.equal(0);
      });
    }

    for (const [symbol, vTokenConfig] of entries(vTokenConfigs)) {
      it(`does not keep any ${symbol} in the redeemer`, async () => {
        expect(await vTokenAt(vTokenConfig.address).balanceOf(TOKEN_REDEEMER)).to.equal(0);
      });

      it(`does not keep any ${symbol.slice(1)} in the redeemer`, async () => {
        expect(await balance(symbol, TOKEN_REDEEMER)).to.equal(0);
      });
    }

    it(`does not keep any VAI in the redeemer`, async () => {
      expect(await erc20At(VAI).balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    for (const [symbol, expectedAmount] of entries(expectedCommunityWithdrawals)) {
      it(`transfers expected amount (with 1% tolerance) of ${symbol} to the community`, async () => {
        const balanceAfter = await balance(symbol, COMMUNITY_WALLET);
        const balanceDiff = balanceAfter.sub(prevBalancesOfCommunityWallet[symbol]);
        expect(balanceDiff).to.be.lt(expectedAmount.mul(101).div(100));
        expect(balanceDiff).to.be.gt(expectedAmount.mul(99).div(100));
      })
    }
  });
});
