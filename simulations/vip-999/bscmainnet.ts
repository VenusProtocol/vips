import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import * as data from "../../vips/vip-999/data/bscmainnet";
import BSC_COMPTROLLER_ABI from "./abi/BscComptroller.json";

const FORK_BLOCK = 97618563;
const BORROW_ACTION = 2;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(data.COMPTROLLER, BSC_COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP state (bscmainnet)", () => {
    it("on-chain CF & LT match recorded `before`", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.before, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("on-chain supplyCap matches recorded `before`", async () => {
      for (const c of data.supplyCapChanges) {
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.before, `${c.symbol} supplyCap`);
      }
    });

    it("on-chain borrowCap matches recorded `before`", async () => {
      for (const c of data.borrowCapChanges) {
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.before, `${c.symbol} borrowCap`);
      }
    });

    it("on-chain borrow pause matches recorded `before`", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.before, `${c.symbol} pause`);
      }
    });
  });

  testVip("VIP-999 BNB Chain Core", await vip999(), {
    callbackAfterExecution: async tx =>
      expectEvents(
        tx,
        [BSC_COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewSupplyCap", "NewBorrowCap", "ActionPausedMarket"],
        [
          data.cfChanges.length,
          data.supplyCapChanges.length,
          data.borrowCapChanges.length,
          data.borrowPauseChanges.length,
        ],
      ),
  });

  describe("Post-VIP state (bscmainnet)", () => {
    it("CF moves to recorded `after`; LT unchanged", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.after, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("supplyCap matches recorded `after`", async () => {
      for (const c of data.supplyCapChanges) {
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.after, `${c.symbol} supplyCap`);
      }
    });

    it("borrowCap matches recorded `after`", async () => {
      for (const c of data.borrowCapChanges) {
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.after, `${c.symbol} borrowCap`);
      }
    });

    it("borrow pause matches recorded `after`", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.after, `${c.symbol} pause`);
      }
    });
  });

  describe("E2E behaviour (bscmainnet)", () => {
    let signer: string;
    before(async () => {
      signer = (await ethers.getSigners())[0].address;
    });

    it("preBorrowHook reverts for every market freshly paused", async () => {
      for (const c of data.borrowPauseChanges) {
        if (!c.after) continue;
        await expect(comptroller.callStatic.preBorrowHook(c.vToken, signer, 1)).to.be.reverted;
      }
    });
  });
});
