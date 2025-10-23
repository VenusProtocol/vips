import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BSCMAINNET_USDT, REPAYMENTS, RISK_FUND, vip557 } from "../../vips/vip-557/bscmainnet";
import RISK_FUND_ABI from "./abi/riskFund.json";
import USDT_ABI from "./abi/usdt.json";

forking(64569840, async () => {
  const provider = ethers.provider;
  let usdt: Contract;
  const usersWalletBalanceBefore = {} as Record<string, BigNumber>;
  let riskFundBalanceBefore: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(BSCMAINNET_USDT, USDT_ABI, provider);
    for (const { user } of REPAYMENTS) {
      usersWalletBalanceBefore[user] = await usdt.balanceOf(user);
    }
    riskFundBalanceBefore = await usdt.balanceOf(RISK_FUND);
  });

  testVip("VIP-557", await vip557(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [RISK_FUND_ABI], ["SweepTokenFromPool"], [17]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("balance of users after sweeping tokens", async () => {
      for (const { user, amount } of REPAYMENTS) {
        const userBalanceAfter = await usdt.balanceOf(user);
        expect(userBalanceAfter).equals(usersWalletBalanceBefore[user].add(amount));
      }
    });

    it("balance of risk fund after sweeping tokens", async () => {
      const riskFundBalanceAfter = await usdt.balanceOf(RISK_FUND);
      const totalRepaid = REPAYMENTS.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0));
      expect(riskFundBalanceAfter).equals(riskFundBalanceBefore.sub(totalRepaid));
    });
  });
});
