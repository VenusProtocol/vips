import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BSCMAINNET_USDT, DEV_WALLET, RISK_FUND, USDT_TOKENS_AMOUNT, vip564 } from "../../vips/vip-564/bscmainnet";
import RISK_FUND_ABI from "./abi/riskFund.json";
import USDT_ABI from "./abi/usdt.json";

forking(67207972, async () => {
  const provider = ethers.provider;
  let usdt: Contract;
  let devWalletBalanceBefore: BigNumber;
  let riskFundBalanceBefore: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(BSCMAINNET_USDT, USDT_ABI, provider);
    devWalletBalanceBefore = await usdt.balanceOf(DEV_WALLET);
    riskFundBalanceBefore = await usdt.balanceOf(RISK_FUND);
  });

  testVip("VIP-564", await vip564(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [RISK_FUND_ABI], ["SweepTokenFromPool"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("balance of devWallet after sweeping tokens", async () => {
      const devWalletBalanceAfter = await usdt.balanceOf(DEV_WALLET);
      expect(devWalletBalanceAfter).equals(devWalletBalanceBefore.add(USDT_TOKENS_AMOUNT));
    });

    it("balance of risk fund after sweeping tokens", async () => {
      const riskFundBalanceAfter = await usdt.balanceOf(RISK_FUND);
      expect(riskFundBalanceAfter).equals(riskFundBalanceBefore.sub(USDT_TOKENS_AMOUNT));
    });
  });
});
