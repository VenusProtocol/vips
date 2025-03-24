import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  Actions,
  COLLATERAL_FACTOR,
  CORE_COMPTROLLER,
  LIQUIDATION_THRESHOLD,
  LST_BNB_COMPTROLLER,
  RESERVE_FACTOR,
  vMATIC,
  vMATIC_BORROW_CAP,
  vMATIC_SUPPLY_CAP,
  vip375,
  vstkBNB,
} from "../../vips/vip-375/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

forking(42389720, async () => {
  const provider = ethers.provider;
  const lstBNBComptroller = new ethers.Contract(LST_BNB_COMPTROLLER, COMPTROLLER_ABI, provider);
  const coreComptroller = new ethers.Contract(CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
  const vstkBNBContract = new ethers.Contract(vstkBNB, VTOKEN_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply and borrow cap for stkBNB", async () => {
      const supplyCap = await lstBNBComptroller.supplyCaps(vstkBNB);
      const borrowCap = await lstBNBComptroller.borrowCaps(vstkBNB);

      expect(supplyCap).to.eq(parseUnits("50", 18));
      expect(borrowCap).to.eq(0);
    });

    it("check reserve factor", async () => {
      const reserveFactor = await vstkBNBContract.reserveFactorMantissa();
      expect(reserveFactor).to.eq(parseUnits("0.25", 18));
    });

    it("check liquidation threshold", async () => {
      const liquidationThreshold = (await lstBNBComptroller.markets(vstkBNB)).liquidationThresholdMantissa;
      expect(liquidationThreshold).to.eq(LIQUIDATION_THRESHOLD);
    });

    it("check collateral factor", async () => {
      const collateralFactor = (await lstBNBComptroller.markets(vstkBNB)).collateralFactorMantissa;
      expect(collateralFactor).to.eq(parseUnits("0.9", 18));
    });

    it("actions unpaused", async () => {
      expect(await lstBNBComptroller.actionPaused(vstkBNB, Actions.BORROW)).to.be.false;
      expect(await lstBNBComptroller.actionPaused(vstkBNB, Actions.MINT)).to.be.false;
      expect(await lstBNBComptroller.actionPaused(vstkBNB, Actions.ENTER_MARKET)).to.be.false;
    });

    it("check supply and borrow cap for MATIC", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vMATIC);
      const borrowCap = await coreComptroller.borrowCaps(vMATIC);

      expect(supplyCap).to.eq(parseUnits("10000000", 18));
      expect(borrowCap).to.eq(parseUnits("1000000", 18));
    });
  });

  testVip("VIP-375", await vip375(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["ActionPausedMarket", "NewCollateralFactor", "NewBorrowCap", "NewSupplyCap"],
        [3, 1, 2, 2],
      );

      await expectEvents(txResponse, [VTOKEN_ABI], ["NewReserveFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply and borrow cap for stkBNB", async () => {
      const supplyCap = await lstBNBComptroller.supplyCaps(vstkBNB);
      const borrowCap = await lstBNBComptroller.borrowCaps(vstkBNB);

      expect(supplyCap).to.eq(0);
      expect(borrowCap).to.eq(0);
    });

    it("check reserve factor", async () => {
      const reserveFactor = await vstkBNBContract.reserveFactorMantissa();
      expect(reserveFactor).to.eq(RESERVE_FACTOR);
    });

    it("check liquidation threshold", async () => {
      const liquidationThreshold = (await lstBNBComptroller.markets(vstkBNB)).liquidationThresholdMantissa;
      expect(liquidationThreshold).to.eq(LIQUIDATION_THRESHOLD);
    });

    it("check collateral factor", async () => {
      const collateralFactor = (await lstBNBComptroller.markets(vstkBNB)).collateralFactorMantissa;
      expect(collateralFactor).to.eq(COLLATERAL_FACTOR);
    });

    it("actions paused", async () => {
      expect(await lstBNBComptroller.actionPaused(vstkBNB, Actions.BORROW)).to.be.true;
      expect(await lstBNBComptroller.actionPaused(vstkBNB, Actions.MINT)).to.be.true;
      expect(await lstBNBComptroller.actionPaused(vstkBNB, Actions.ENTER_MARKET)).to.be.true;
    });

    it("check supply and borrow cap for MATIC", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vMATIC);
      const borrowCap = await coreComptroller.borrowCaps(vMATIC);

      expect(supplyCap).to.eq(vMATIC_SUPPLY_CAP);
      expect(borrowCap).to.eq(vMATIC_BORROW_CAP);
    });
  });
});
