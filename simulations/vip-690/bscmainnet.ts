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
  THE_BAD_DEBT_HELPER,
  vTHE,
  vipVPD854,
} from "../../vips/vip-690/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VBep20Abi.json";

const BLOCK_NUMBER = 88459653;

forking(BLOCK_NUMBER, async () => {
  let theToken: Contract;
  let vTheToken: Contract;
  let receiverTheBalancePrev: BigNumber;
  let exchangeRatePrev: BigNumber;
  let vTheCashPrev: BigNumber;
  const borrowerDebtsPrev: Map<string, BigNumber> = new Map();

  before(async () => {
    theToken = new ethers.Contract(THE, IERC20_ABI, ethers.provider);
    vTheToken = new ethers.Contract(vTHE, VTOKEN_ABI, ethers.provider);

    receiverTheBalancePrev = await theToken.balanceOf(TARGET_RECEIVER);
    exchangeRatePrev = await vTheToken.exchangeRateStored();
    vTheCashPrev = await vTheToken.getCash();

    for (const borrower of BAD_DEBT_BORROWERS) {
      const debt = await vTheToken.borrowBalanceStored(borrower);
      borrowerDebtsPrev.set(borrower, debt);
    }
  });

  describe("Pre-VIP behavior", () => {
    it("should have THE cash in vTHE", async () => {
      expect(vTheCashPrev).to.be.gt(0);
    });

    it("should have non-zero bad debt for all accounts", async () => {
      for (const borrower of BAD_DEBT_BORROWERS) {
        const debt = borrowerDebtsPrev.get(borrower)!;
        expect(debt).to.be.gt(0);
      }
    });

    it("should have sufficient cash to cover all bad debt", async () => {
      let totalDebt = BigNumber.from(0);
      for (const borrower of BAD_DEBT_BORROWERS) {
        totalDebt = totalDebt.add(borrowerDebtsPrev.get(borrower)!);
      }
      expect(vTheCashPrev).to.be.gt(totalDebt);
    });

    it("should have inflated exchange rate", async () => {
      // Pre-attack fair rate was ~1.044e28; inflated rate is ~4.465e28
      expect(exchangeRatePrev).to.be.gt(ethers.utils.parseUnits("2", 28));
    });

    it("should have Normal Timelock as admin of vTHE", async () => {
      const admin = await vTheToken.admin();
      expect(admin).to.equal(NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-VPD-854 $THE Market Resume and Bad Debt Handling", await vipVPD854(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["RepayBorrow"], [BAD_DEBT_BORROWERS.length]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["TokenSwept"], [2]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["CashSynced"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("should have Normal Timelock as admin of vTHE", async () => {
      const admin = await vTheToken.admin();
      expect(admin).to.equal(NORMAL_TIMELOCK);
    });

    it("should have reduced exchange rate towards pre-attack fair rate", async () => {
      const exchangeRatePost = await vTheToken.exchangeRateStored();
      expect(exchangeRatePost).to.be.lt(exchangeRatePrev);
      // Should still be above some reasonable minimum (pre-attack fair rate ~1.044e28)
      expect(exchangeRatePost).to.be.gt(ethers.utils.parseUnits("1", 28));
    });

    it("should have fully repaid THE bad debt for all accounts", async () => {
      for (const borrower of BAD_DEBT_BORROWERS) {
        const debtPost = await vTheToken.borrowBalanceStored(borrower);
        expect(debtPost).to.equal(0);
      }
    });

    it("should have zero THE approval from helper on vTHE", async () => {
      const allowance = await theToken.allowance(THE_BAD_DEBT_HELPER, vTHE);
      expect(allowance).to.equal(0);
    });

    it("should have transferred THE to target receiver", async () => {
      const receiverBalance = await theToken.balanceOf(TARGET_RECEIVER);
      expect(receiverBalance.sub(receiverTheBalancePrev)).to.be.gt(0);
    });

    it("should have no THE remaining on the helper contract", async () => {
      const helperBalance = await theToken.balanceOf(THE_BAD_DEBT_HELPER);
      expect(helperBalance).to.equal(0);
    });

    it("should have updated vTHE cash after sweeps and repayments", async () => {
      const vTheCashPost = await vTheToken.getCash();
      expect(vTheCashPost).to.be.lt(vTheCashPrev);
    });
  });
});
