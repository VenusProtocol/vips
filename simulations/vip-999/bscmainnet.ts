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
    it("matches current collateral factors and liquidation thresholds", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.old, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("matches current supply caps", async () => {
      for (const c of data.capChanges) {
        if (!c.supplyCap) continue;
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.supplyCap.old, `${c.symbol} supplyCap`);
      }
    });

    it("matches current borrow caps", async () => {
      for (const c of data.capChanges) {
        if (!c.borrowCap) continue;
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.borrowCap.old, `${c.symbol} borrowCap`);
      }
    });

    it("matches current borrow pause flags", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.old, `${c.symbol} pause`);
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
          data.capChanges.filter(c => c.supplyCap).length,
          data.capChanges.filter(c => c.borrowCap).length,
          data.borrowPauseChanges.length,
        ],
      ),
  });

  describe("Post-VIP state (bscmainnet)", () => {
    it("applies new collateral factors (LT preserved)", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.new, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("applies new supply caps", async () => {
      for (const c of data.capChanges) {
        if (!c.supplyCap) continue;
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.supplyCap.new, `${c.symbol} supplyCap`);
      }
    });

    it("applies new borrow caps", async () => {
      for (const c of data.capChanges) {
        if (!c.borrowCap) continue;
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.borrowCap.new, `${c.symbol} borrowCap`);
      }
    });

    it("applies new borrow pause flags", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.new, `${c.symbol} pause`);
      }
    });
  });

  describe("E2E behaviour (bscmainnet)", () => {
    let signer: string;
    before(async () => {
      signer = (await ethers.getSigners())[0].address;
    });

    it("newly paused markets reject borrow attempts", async () => {
      for (const c of data.borrowPauseChanges) {
        if (!c.new) continue;
        await expect(comptroller.callStatic.preBorrowHook(c.vToken, signer, 1)).to.be.reverted;
      }
    });
  });
});
