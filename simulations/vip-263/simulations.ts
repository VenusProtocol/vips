import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  BNB_DEBT_BORROWER_3,
  BORROWER_1,
  BORROWER_2,
  BORROWER_3,
  NORMAL_TIMELOCK,
  TREASURY,
  TREASURY_USDT_REDEEM_AMOUNT,
  TREASURY_VUSDT_WITHDRAW_AMOUNT,
  TUSD_OLD,
  TUSD_OLD_DEBT_BORROWER_1,
  TUSD_OLD_DEBT_BORROWER_2,
  USDT,
  USDT_DEBT_BORROWER_1,
  VBNB,
  VTUSD_OLD,
  VUSDT,
  vip263,
} from "../../vips/vip-263/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VBep20Abi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(36553318, () => {
  let vUSDT: ethers.Contract;
  let vTusdOld: ethers.Contract;
  let vBNB: ethers.Contract;
  let usdt: ethers.Contract;
  let tusdOld: ethers.Contract;
  let treasuryTusdBalPrev: BigNumber;
  let treasuryVUsdtBalPrev: BigNumber;
  let treasuryBnbBalPrev: BigNumber;
  let borrower1TusdDebtPrev: BigNumber;
  let borrower1UsdtDebtPrev: BigNumber;
  let borrower2TusdDebtPrev: BigNumber;
  let borrower3BnbDebtPrev: BigNumber;
  let timelockUsdtBalPrev: BigNumber;

  before(async () => {
    vUSDT = new ethers.Contract(VUSDT, VTOKEN_ABI, ethers.provider);
    vTusdOld = new ethers.Contract(VTUSD_OLD, VTOKEN_ABI, ethers.provider);
    vBNB = new ethers.Contract(VBNB, VTOKEN_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    tusdOld = new ethers.Contract(TUSD_OLD, IERC20_ABI, ethers.provider);

    treasuryTusdBalPrev = await tusdOld.balanceOf(TREASURY);
    treasuryVUsdtBalPrev = await vUSDT.balanceOf(TREASURY);
    treasuryBnbBalPrev = await ethers.provider.getBalance(TREASURY);

    borrower1TusdDebtPrev = await vTusdOld.borrowBalanceStored(BORROWER_1);
    borrower2TusdDebtPrev = await vTusdOld.borrowBalanceStored(BORROWER_2);
    borrower1UsdtDebtPrev = await vUSDT.borrowBalanceStored(BORROWER_1);
    borrower3BnbDebtPrev = await vBNB.borrowBalanceStored(BORROWER_3);

    timelockUsdtBalPrev = await usdt.balanceOf(NORMAL_TIMELOCK);
  });

  testVip("VIP-263", vip263(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [2]);
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBNB"], [1]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["Redeem"], [1]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["RepayBorrow"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Treasury balance checks", async () => {
      const treasuryTusdBalNew = await tusdOld.balanceOf(TREASURY);
      const treasuryVUsdtBalNew = await vUSDT.balanceOf(TREASURY);
      const treasuryBnbBalNew = await ethers.provider.getBalance(TREASURY);

      expect(treasuryTusdBalPrev).equals(
        treasuryTusdBalNew.add(TUSD_OLD_DEBT_BORROWER_1.add(TUSD_OLD_DEBT_BORROWER_2)),
      );
      expect(treasuryVUsdtBalPrev).equals(treasuryVUsdtBalNew.add(TREASURY_VUSDT_WITHDRAW_AMOUNT));
      expect(treasuryBnbBalPrev).equals(treasuryBnbBalNew.add(BNB_DEBT_BORROWER_3));
    });

    it("Borrower's balance checks", async () => {
      const borrower1TusdDebtNew = await vTusdOld.borrowBalanceStored(BORROWER_1);
      const borrower2TusdDebtNew = await vTusdOld.borrowBalanceStored(BORROWER_2);
      const borrower1UsdtDebtNew = await vUSDT.borrowBalanceStored(BORROWER_1);
      const borrower3BnbDebtNew = await vBNB.borrowBalanceStored(BORROWER_3);

      expect(borrower1TusdDebtPrev).equals(borrower1TusdDebtNew.add(TUSD_OLD_DEBT_BORROWER_1));
      expect(borrower2TusdDebtPrev).equals(borrower2TusdDebtNew.add(TUSD_OLD_DEBT_BORROWER_2));
      expect(borrower1UsdtDebtPrev).to.closeTo(borrower1UsdtDebtNew.add(USDT_DEBT_BORROWER_1), parseUnits("56", 18));
      expect(borrower3BnbDebtPrev).to.closeTo(borrower3BnbDebtNew.add(BNB_DEBT_BORROWER_3), parseUnits("0.15", 18));
    });

    it("Timelock balance checks", async () => {
      const timelockUsdtBalNew = await usdt.balanceOf(NORMAL_TIMELOCK);
      expect(timelockUsdtBalPrev).equals(timelockUsdtBalNew.add(TREASURY_USDT_REDEEM_AMOUNT.sub(USDT_DEBT_BORROWER_1)));
    });
  });
});
