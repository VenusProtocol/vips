import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BNB_DEBT_BORROWER_3,
  BORROWER_1,
  BORROWER_2,
  BORROWER_3,
  TOKEN_REDEEMER,
  TREASURY,
  TUSD_OLD,
  TUSD_OLD_DEBT_BORROWER_1,
  TUSD_OLD_DEBT_BORROWER_2,
  USDT,
  USDT_DEBT_BORROWER_1,
  VBNB,
  VTUSD_OLD,
  VUSDT,
  vip266,
} from "../../vips/vip-266/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VBep20Abi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(36710086, async () => {
  let vUSDT: Contract;
  let vTusdOld: Contract;
  let vBNB: Contract;
  let usdt: Contract;
  let tusdOld: Contract;
  let treasuryTusdBalPrev: BigNumber;
  let treasuryVUsdtBalPrev: BigNumber;
  let treasuryBnbBalPrev: BigNumber;
  let borrower1TusdDebtPrev: BigNumber;
  let borrower1UsdtDebtPrev: BigNumber;
  let borrower2TusdDebtPrev: BigNumber;
  let borrower3BnbDebtPrev: BigNumber;

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
  });

  testVip("VIP-266", await vip266(), {
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
      const exchangeRateStored = await vUSDT.exchangeRateStored();
      const redeemedTokens = USDT_DEBT_BORROWER_1.mul(parseUnits("1", 18)).div(exchangeRateStored);
      expect(treasuryVUsdtBalPrev).equals(treasuryVUsdtBalNew.add(redeemedTokens));
      expect(treasuryBnbBalPrev).equals(treasuryBnbBalNew.add(BNB_DEBT_BORROWER_3));
    });

    it("Borrower's balance checks", async () => {
      const borrower1TusdDebtNew = await vTusdOld.borrowBalanceStored(BORROWER_1);
      const borrower2TusdDebtNew = await vTusdOld.borrowBalanceStored(BORROWER_2);
      const borrower1UsdtDebtNew = await vUSDT.borrowBalanceStored(BORROWER_1);
      const borrower3BnbDebtNew = await vBNB.borrowBalanceStored(BORROWER_3);

      expect(borrower1TusdDebtPrev).equals(borrower1TusdDebtNew.add(TUSD_OLD_DEBT_BORROWER_1));
      expect(borrower2TusdDebtPrev).equals(borrower2TusdDebtNew.add(TUSD_OLD_DEBT_BORROWER_2));
      expect(borrower1UsdtDebtPrev).to.closeTo(borrower1UsdtDebtNew.add(USDT_DEBT_BORROWER_1), parseUnits("70", 18));
      expect(borrower3BnbDebtPrev).to.closeTo(borrower3BnbDebtNew.add(BNB_DEBT_BORROWER_3), parseUnits("0.15", 18));
    });

    it("Redeemer's balance checks", async () => {
      const redeemerVUsdtBalance = await vUSDT.balanceOf(TOKEN_REDEEMER);
      const redemmerUsdtBalance = await usdt.balanceOf(TOKEN_REDEEMER);
      expect(redeemerVUsdtBalance).equals(0);
      expect(redemmerUsdtBalance).equals(0);
    });
  });
});
