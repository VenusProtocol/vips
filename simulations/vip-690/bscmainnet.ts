import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BAD_DEBT_BORROWERS,
  NORMAL_TIMELOCK,
  TARGET_RECEIVER,
  THE,
  fetchVipValues,
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
  let sweepAmount: BigNumber;
  let totalBadDebt: BigNumber;
  const borrowerDebtsPrev: Map<string, BigNumber> = new Map();

  before(async () => {
    theToken = new ethers.Contract(THE, IERC20_ABI, ethers.provider);
    vTheToken = new ethers.Contract(vTHE, VTOKEN_ABI, ethers.provider);

    const vipValues = await fetchVipValues();
    sweepAmount = vipValues.sweepAmount;
    totalBadDebt = vipValues.totalBadDebt;

    timelockTheBalancePrev = await theToken.balanceOf(NORMAL_TIMELOCK);
    receiverTheBalancePrev = await theToken.balanceOf(TARGET_RECEIVER);
    exchangeRatePrev = await vTheToken.exchangeRateStored();
    vTheCashPrev = await vTheToken.getCash();

    for (const borrower of BAD_DEBT_BORROWERS) {
      const debt = await vTheToken.borrowBalanceStored(borrower);
      borrowerDebtsPrev.set(borrower, debt);
    }
  });

  describe("Pre-VIP behavior", () => {
    it("should have THE cash in vTHE matching sweep amount", async () => {
      expect(vTheCashPrev).to.be.gt(0);
      expect(vTheCashPrev).to.equal(sweepAmount);
    });

    it("should have non-zero bad debt for all accounts", async () => {
      for (const borrower of BAD_DEBT_BORROWERS) {
        const debt = borrowerDebtsPrev.get(borrower)!;
        expect(debt).to.be.gt(0);
      }
    });

    it("should have sufficient cash to cover all bad debt", async () => {
      expect(sweepAmount).to.be.gt(totalBadDebt);
    });

    it("should have inflated exchange rate", async () => {
      // Pre-attack fair rate was ~1.044e28; inflated rate is ~4.465e28
      expect(exchangeRatePrev).to.be.gt(ethers.utils.parseUnits("2", 28));
    });
  });

  testVip("VIP-VPD-854 $THE Market Resume and Bad Debt Handling", await vipVPD854(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["RepayBorrow"], [BAD_DEBT_BORROWERS.length]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["TokenSwept"], [2]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["CashSynced"], [2]);
      await expectEvents(txResponse, [IERC20_ABI], ["Transfer"], [BAD_DEBT_BORROWERS.length + 4]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("should have reduced exchange rate towards pre-attack fair rate", async () => {
      const exchangeRatePost = await vTheToken.exchangeRateStored();
      expect(exchangeRatePost).to.be.lt(exchangeRatePrev);
      // Should still be above some reasonable minimum (pre-attack fair rate ~1.044e28)
      expect(exchangeRatePost).to.be.gt(ethers.utils.parseUnits("1", 28));
    });

    it("should have repaid THE bad debt for all accounts", async () => {
      for (const borrower of BAD_DEBT_BORROWERS) {
        const debtPrev = borrowerDebtsPrev.get(borrower)!;
        const debtPost = await vTheToken.borrowBalanceStored(borrower);
        // Debt should have decreased by approximately the full amount
        expect(debtPrev.sub(debtPost)).to.be.closeTo(debtPrev, debtPrev.div(100));
      }
    });

    it("should have near-zero bad debt remaining for all accounts", async () => {
      for (const borrower of BAD_DEBT_BORROWERS) {
        const debtPost = await vTheToken.borrowBalanceStored(borrower);
        const debtPrev = borrowerDebtsPrev.get(borrower)!;
        // Remaining debt should be small relative to original (only interest accrual during 48h timelock)
        expect(debtPost).to.be.lt(debtPrev.div(10));
      }
    });

    it("should have zero THE approval remaining on vTHE", async () => {
      const allowance = await theToken.allowance(NORMAL_TIMELOCK, vTHE);
      expect(allowance).to.equal(0);
    });

    it("should have transferred THE to target receiver", async () => {
      const receiverBalance = await theToken.balanceOf(TARGET_RECEIVER);
      const received = receiverBalance.sub(receiverTheBalancePrev);
      expect(received).to.be.closeTo(sweepAmount, sweepAmount.div(100));
    });

    it("should have no THE remaining on the Normal Timelock", async () => {
      const timelockBalance = await theToken.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance.sub(timelockTheBalancePrev)).to.be.lt(ethers.utils.parseEther("1"));
    });

    it("should have updated vTHE cash after sweeps and repayments", async () => {
      const vTheCashPost = await vTheToken.getCash();
      expect(vTheCashPost).to.be.lt(vTheCashPrev);
    });
  });
});
