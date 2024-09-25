import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  Actions,
  COLLATERAL_FACTOR,
  LIQUIDATION_THRESHOLD,
  LST_BNB_COMPTROLLER,
  RESERVE_FACTOR,
  vip371,
  vstkBNB,
} from "../../vips/vip-371/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

forking(42389720, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(LST_BNB_COMPTROLLER, COMPTROLLER_ABI, provider);
  const vToken = new ethers.Contract(vstkBNB, VTOKEN_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply and borrow cap", async () => {
      const supplyCap = await comptroller.supplyCaps(vstkBNB);
      const borrowCap = await comptroller.borrowCaps(vstkBNB);

      expect(supplyCap).to.eq(parseUnits("50", 18));
      expect(borrowCap).to.eq(0);
    });

    it("check reserve factor", async () => {
      const reserveFactor = await vToken.reserveFactorMantissa();
      expect(reserveFactor).to.eq(parseUnits("0.25", 18));
    });

    it("check liquidation threshold", async () => {
      const liquidationThreshold = (await comptroller.markets(vstkBNB)).liquidationThresholdMantissa;
      expect(liquidationThreshold).to.eq(LIQUIDATION_THRESHOLD);
    });

    it("check collateral factor", async () => {
      const collateralFactor = (await comptroller.markets(vstkBNB)).collateralFactorMantissa;
      expect(collateralFactor).to.eq(parseUnits("0.9", 18));
    });

    it("actions unpaused", async () => {
      expect(await comptroller.actionPaused(vstkBNB, Actions.BORROW)).to.be.false;
      expect(await comptroller.actionPaused(vstkBNB, Actions.MINT)).to.be.false;
      expect(await comptroller.actionPaused(vstkBNB, Actions.ENTER_MARKET)).to.be.false;
    });
  });

  testVip("VIP-371", await vip371(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["ActionPausedMarket", "NewCollateralFactor", "NewBorrowCap", "NewSupplyCap"],
        [3, 1, 1, 1],
      );

      await expectEvents(txResponse, [VTOKEN_ABI], ["NewReserveFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply and borrow cap", async () => {
      const supplyCap = await comptroller.supplyCaps(vstkBNB);
      const borrowCap = await comptroller.borrowCaps(vstkBNB);

      expect(supplyCap).to.eq(0);
      expect(borrowCap).to.eq(0);
    });

    it("check reserve factor", async () => {
      const reserveFactor = await vToken.reserveFactorMantissa();
      expect(reserveFactor).to.eq(RESERVE_FACTOR);
    });

    it("check liquidation threshold", async () => {
      const liquidationThreshold = (await comptroller.markets(vstkBNB)).liquidationThresholdMantissa;
      expect(liquidationThreshold).to.eq(LIQUIDATION_THRESHOLD);
    });

    it("check collateral factor", async () => {
      const collateralFactor = (await comptroller.markets(vstkBNB)).collateralFactorMantissa;
      expect(collateralFactor).to.eq(COLLATERAL_FACTOR);
    });

    it("actions paused", async () => {
      expect(await comptroller.actionPaused(vstkBNB, Actions.BORROW)).to.be.true;
      expect(await comptroller.actionPaused(vstkBNB, Actions.MINT)).to.be.true;
      expect(await comptroller.actionPaused(vstkBNB, Actions.ENTER_MARKET)).to.be.true;
    });
  });
});
