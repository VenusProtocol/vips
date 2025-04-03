import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BSCMAINNET_USDT,
  RISK_FUND,
  USDT_TOKENS_AMOUNT,
  VANGUARD_TREASURY,
  vip474,
} from "../../vips/vip-474/bscmainnet";
import RISK_FUND_ABI from "./abi/riskFund.json";
import USDT_ABI from "./abi/usdt.json";

forking(48003323, async () => {
  const provider = ethers.provider;
  let usdt: Contract;
  let treasuryBalanceBefore: BigNumber;
  let treasuryBalanceAfter: BigNumber;
  let riskFundBalanceBefore: BigNumber;
  let riskFundBalanceAfter: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(BSCMAINNET_USDT, USDT_ABI, provider);
    treasuryBalanceBefore = await usdt.balanceOf(VANGUARD_TREASURY);
    riskFundBalanceBefore = await usdt.balanceOf(RISK_FUND);
  });

  testVip("VIP-474", await vip474(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [RISK_FUND_ABI], ["SweepTokenFromPool"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("balance of treasury after sweeping tokens", async () => {
      treasuryBalanceAfter = await usdt.balanceOf(VANGUARD_TREASURY);
      expect(treasuryBalanceAfter).equals(treasuryBalanceBefore.add(USDT_TOKENS_AMOUNT));
    });

    it("balance of risk fund after sweeping tokens", async () => {
      riskFundBalanceAfter = await usdt.balanceOf(RISK_FUND);
      expect(riskFundBalanceAfter).equals(riskFundBalanceBefore.sub(USDT_TOKENS_AMOUNT));
    });
  });
});
