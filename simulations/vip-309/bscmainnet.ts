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
  shortfalls,
  underlyingWithdrawals,
  vTokenConfigs,
  vTokenWithdrawals,
  vaiDebts,
  vip309,
} from "../../vips/vip-309/bscmainnet";
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

forking(38945597, async () => {
  const usdt = erc20At(USDT);
  let prevUSDTBalanceOfCommunityWallet: BigNumber;
  const vaiController = new Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, ethers.provider);

  before(async () => {
    prevUSDTBalanceOfCommunityWallet = await usdt.balanceOf(COMMUNITY_WALLET);
    await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP state", () => {
    entries(vTokenWithdrawals).forEach(([symbol, amount]) => {
      it(`has treasury balance >${formatUnits(amount, 8)} ${symbol}`, async () => {
        const balance = await erc20At(vTokenConfigs[symbol].address).balanceOf(VTREASURY);
        expect(balance).to.be.gt(amount);
      });
    });

    entries(underlyingWithdrawals).forEach(([vTokenSymbol, amount]) => {
      it(`has treasury balance >${amount} ${vTokenSymbol.slice(1)} units`, async () => {
        const balance = await erc20At(vTokenConfigs[vTokenSymbol].underlying).balanceOf(VTREASURY);
        expect(balance).to.be.gt(amount);
      });
    });
  });

  testVip("VIP-309", await vip309(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["RepayBorrow"], [97]);
      await expectEvents(txResponse, [VAI_CONTROLLER_ABI], ["RepayVAI"], [24]);
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [19]);
    },
  });

  describe("Post-VIP behavior", () => {
    for (const [symbol, debts] of entries(shortfalls)) {
      for (const [borrower, debt] of Object.entries(debts)) {
        const percentage = symbol == "vSXP" ? 98 : 99;
        it(`repays >${percentage}% of ${borrower}'s ${symbol.slice(1)} debt`, async () => {
          const initialDebt = BigNumber.from(debt);
          const vToken = new Contract(vTokenConfigs[symbol].address, VTOKEN_ABI, ethers.provider);
          const debtThreshold = initialDebt.mul(100 - percentage).div(100);
          expect(await vToken.callStatic.borrowBalanceCurrent(borrower)).to.be.lt(debtThreshold);
        });
      }
    }

    for (const [borrower, debt] of Object.entries(vaiDebts)) {
      it(`repays >99% of ${borrower}'s VAI debt`, async () => {
        const initialDebt = BigNumber.from(debt);
        expect(await vaiController.callStatic.getVAIRepayAmount(borrower)).to.be.lt(initialDebt.mul(1).div(100));
      });
    }

    for (const [symbol, vTokenConfig] of entries(vTokenConfigs)) {
      it(`does not keep any ${symbol} in the redeemer`, async () => {
        expect(await vTokenAt(vTokenConfig.address).balanceOf(TOKEN_REDEEMER)).to.equal(0);
      });

      it(`does not keep any ${symbol.slice(1)} in the redeemer`, async () => {
        if (vTokenConfig.underlying === ethers.constants.AddressZero) {
          expect(await ethers.provider.getBalance(TOKEN_REDEEMER)).to.equal(0);
        } else {
          expect(await erc20At(vTokenConfig.underlying).balanceOf(TOKEN_REDEEMER)).to.equal(0);
        }
      });
    }

    it(`does not keep any VAI in the redeemer`, async () => {
      expect(await erc20At(VAI).balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("transfer USDT to the Community Wallet", async () => {
      const newUSDTBalanceOfCommunityWallet = await usdt.balanceOf(COMMUNITY_WALLET);
      expect(newUSDTBalanceOfCommunityWallet).to.be.eq(
        prevUSDTBalanceOfCommunityWallet.add(COMMUNITY_WALLET_USDT_AMOUNT),
      );
    });
  });
});
