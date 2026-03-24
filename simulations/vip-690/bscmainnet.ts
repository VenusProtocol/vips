import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BAD_DEBT_ACCOUNTS,
  FIRST_SWEEP_AMOUNT,
  NORMAL_TIMELOCK,
  TARGET_RECEIVER,
  THE,
  vTHE,
  vipVPD854,
} from "../../vips/vip-690/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VBep20Abi.json";

const BLOCK_NUMBER = 88459653;

forking(BLOCK_NUMBER, async () => {
  let theToken: Contract;
  let vTheToken: Contract;
  let timelockTheBalancePrev: BigNumber;
  let receiverTheBalancePrev: BigNumber;
  let exchangeRatePrev: BigNumber;
  let vTheCashPrev: BigNumber;
  const borrowerDebtsPrev: Map<string, BigNumber> = new Map();

  before(async () => {
    theToken = new ethers.Contract(THE, IERC20_ABI, ethers.provider);
    vTheToken = new ethers.Contract(vTHE, VTOKEN_ABI, ethers.provider);

    timelockTheBalancePrev = await theToken.balanceOf(NORMAL_TIMELOCK);
    receiverTheBalancePrev = await theToken.balanceOf(TARGET_RECEIVER);
    exchangeRatePrev = await vTheToken.exchangeRateStored();
    vTheCashPrev = await vTheToken.getCash();

    for (const { borrower } of BAD_DEBT_ACCOUNTS) {
      const debt = await vTheToken.borrowBalanceStored(borrower);
      borrowerDebtsPrev.set(borrower, debt);
    }
  });

  describe("Pre-VIP behavior", () => {
    it("should have expected THE cash in vTHE", async () => {
      expect(vTheCashPrev).to.be.gt(0);
      expect(vTheCashPrev).to.be.closeTo(
        BigNumber.from(FIRST_SWEEP_AMOUNT),
        BigNumber.from(FIRST_SWEEP_AMOUNT).div(100),
      );
    });

    it("should have non-zero bad debt for all accounts", async () => {
      for (const { borrower, amount } of BAD_DEBT_ACCOUNTS) {
        const debt = borrowerDebtsPrev.get(borrower)!;
        expect(debt).to.be.gt(0);
        expect(debt).to.be.closeTo(BigNumber.from(amount), BigNumber.from(amount).div(100));
      }
    });

    it("should have inflated exchange rate", async () => {
      // Pre-attack fair rate was ~1.044e28; inflated rate is ~4.465e28
      expect(exchangeRatePrev).to.be.gt(ethers.utils.parseUnits("2", 28));
    });
  });

  testVip("VIP-VPD-854 $THE Market Resume and Bad Debt Handling", await vipVPD854(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["RepayBorrow"], [BAD_DEBT_ACCOUNTS.length]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["TokenSwept"], [2]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["CashSynced"], [2]);
      await expectEvents(txResponse, [IERC20_ABI], ["Transfer"], [BAD_DEBT_ACCOUNTS.length + 4]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("should have reduced exchange rate towards pre-attack fair rate", async () => {
      const exchangeRatePost = await vTheToken.exchangeRateStored();
      // Exchange rate should decrease from ~4.465e28 towards ~1.044e28
      expect(exchangeRatePost).to.be.lt(exchangeRatePrev);
      console.log("Exchange rate before VIP:", exchangeRatePrev.toString());
      console.log("Exchange rate after VIP:", exchangeRatePost.toString());
      // Should still be above some reasonable minimum (pre-attack fair rate ~1.044e28)
      expect(exchangeRatePost).to.be.gt(ethers.utils.parseUnits("1", 28));
    });

    it("should have repaid THE bad debt for all accounts", async () => {
      for (const { borrower, amount } of BAD_DEBT_ACCOUNTS) {
        const debtPrev = borrowerDebtsPrev.get(borrower)!;
        const debtPost = await vTheToken.borrowBalanceStored(borrower);
        const repayAmount = BigNumber.from(amount);
        // Debt should have decreased by approximately the repayment amount
        expect(debtPrev.sub(debtPost)).to.be.closeTo(repayAmount, repayAmount.div(100));
      }
    });

    it("should have near-zero bad debt remaining for all accounts", async () => {
      for (const { borrower, amount } of BAD_DEBT_ACCOUNTS) {
        const debtPost = await vTheToken.borrowBalanceStored(borrower);
        const originalDebt = BigNumber.from(amount);
        // Remaining debt should be small relative to original (only interest accrual during 48h timelock)
        expect(debtPost).to.be.lt(originalDebt.div(10));
      }
    });

    it("should have zero THE approval remaining on vTHE", async () => {
      const allowance = await theToken.allowance(NORMAL_TIMELOCK, vTHE);
      expect(allowance).to.equal(0);
    });

    it("should have transferred THE to target receiver", async () => {
      const receiverBalance = await theToken.balanceOf(TARGET_RECEIVER);
      const received = receiverBalance.sub(receiverTheBalancePrev);
      expect(received).to.be.closeTo(BigNumber.from(FIRST_SWEEP_AMOUNT), BigNumber.from(FIRST_SWEEP_AMOUNT).div(100));
    });

    it("should have no THE remaining on the Normal Timelock", async () => {
      const timelockBalance = await theToken.balanceOf(NORMAL_TIMELOCK);
      // Timelock should have transferred all THE out — balance should be back to pre-VIP or near zero
      expect(timelockBalance.sub(timelockTheBalancePrev)).to.be.lt(ethers.utils.parseEther("1"));
    });

    it("should have updated vTHE cash after sweeps and repayments", async () => {
      const vTheCashPost = await vTheToken.getCash();
      // After two sweeps and repayments, cash should be less than pre-VIP
      expect(vTheCashPost).to.be.lt(vTheCashPrev);
    });
  });
});
