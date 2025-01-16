import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  Actions,
  COLLATERAL_FACTOR,
  DEFI_COMPTROLLER,
  LIQUIDATION_THRESHOLD,
  RESERVE_FACTOR,
  vPLANET,
  vip424,
} from "../../vips/vip-424/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

forking(45814414, async () => {
  const provider = ethers.provider;
  const defiComptroller = new ethers.Contract(DEFI_COMPTROLLER, COMPTROLLER_ABI, provider);
  const vPLANETContract = new ethers.Contract(vPLANET, VTOKEN_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply and borrow cap for stkBNB", async () => {
      const supplyCap = await defiComptroller.supplyCaps(vPLANET);
      const borrowCap = await defiComptroller.borrowCaps(vPLANET);

      expect(supplyCap).to.eq(parseUnits("2000000000", 18));
      expect(borrowCap).to.eq(parseUnits("750000000", 18));
    });

    it("check reserve factor", async () => {
      const reserveFactor = await vPLANETContract.reserveFactorMantissa();
      expect(reserveFactor).to.eq(parseUnits("0.25", 18));
    });

    it("check liquidation threshold", async () => {
      const liquidationThreshold = (await defiComptroller.markets(vPLANET)).liquidationThresholdMantissa;
      expect(liquidationThreshold).to.eq(parseUnits("0.3", 18));
    });

    it("check collateral factor", async () => {
      const collateralFactor = (await defiComptroller.markets(vPLANET)).collateralFactorMantissa;
      expect(collateralFactor).to.eq(parseUnits("0.2", 18));
    });

    it("actions unpaused", async () => {
      expect(await defiComptroller.actionPaused(vPLANET, Actions.BORROW)).to.be.false;
      expect(await defiComptroller.actionPaused(vPLANET, Actions.MINT)).to.be.false;
      expect(await defiComptroller.actionPaused(vPLANET, Actions.ENTER_MARKET)).to.be.false;
    });
  });

  testVip("VIP-424", await vip424(), {
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
    it("check supply and borrow cap for stkBNB", async () => {
      const supplyCap = await defiComptroller.supplyCaps(vPLANET);
      const borrowCap = await defiComptroller.borrowCaps(vPLANET);

      expect(supplyCap).to.eq(0);
      expect(borrowCap).to.eq(0);
    });

    it("check reserve factor", async () => {
      const reserveFactor = await vPLANETContract.reserveFactorMantissa();
      expect(reserveFactor).to.eq(RESERVE_FACTOR);
    });

    it("check liquidation threshold", async () => {
      const liquidationThreshold = (await defiComptroller.markets(vPLANET)).liquidationThresholdMantissa;
      expect(liquidationThreshold).to.eq(LIQUIDATION_THRESHOLD);
    });

    it("check collateral factor", async () => {
      const collateralFactor = (await defiComptroller.markets(vPLANET)).collateralFactorMantissa;
      expect(collateralFactor).to.eq(COLLATERAL_FACTOR);
    });

    it("actions paused", async () => {
      expect(await defiComptroller.actionPaused(vPLANET, Actions.BORROW)).to.be.true;
      expect(await defiComptroller.actionPaused(vPLANET, Actions.MINT)).to.be.true;
      expect(await defiComptroller.actionPaused(vPLANET, Actions.ENTER_MARKET)).to.be.true;
    });
  });
});
