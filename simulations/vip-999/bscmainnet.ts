import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import * as data from "../../vips/vip-999/data/bscmainnet";
import BSC_COMPTROLLER_ABI from "./abi/BscComptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

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
      for (const c of data.marketCapChanges) {
        if (!c.supplyCap) continue;
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.supplyCap.old, `${c.symbol} supplyCap`);
      }
    });

    it("matches current borrow caps", async () => {
      for (const c of data.marketCapChanges) {
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
          data.marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).length,
          data.marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).length,
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

    it("applies new supply caps on changed entries", async () => {
      for (const c of data.marketCapChanges) {
        if (BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)) continue;
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.supplyCap.new, `${c.symbol} supplyCap`);
      }
    });

    it("leaves no-op supply caps at their pre-VIP value", async () => {
      for (const c of data.marketCapChanges) {
        if (!BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)) continue;
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(
          c.supplyCap.old,
          `${c.symbol} supplyCap unchanged`,
        );
      }
    });

    it("applies new borrow caps on changed entries", async () => {
      for (const c of data.marketCapChanges) {
        if (BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)) continue;
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.borrowCap.new, `${c.symbol} borrowCap`);
      }
    });

    it("leaves no-op borrow caps at their pre-VIP value", async () => {
      for (const c of data.marketCapChanges) {
        if (!BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)) continue;
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(
          c.borrowCap.old,
          `${c.symbol} borrowCap unchanged`,
        );
      }
    });

    it("applies new borrow pause flags", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.new, `${c.symbol} pause`);
      }
    });
  });

  describe("E2E behaviour (bscmainnet)", () => {
    // The BSC Comptroller checks the pause flag before any collateral/cap check,
    // so a borrow attempt from any account reverts immediately on a paused market.
    it("newly paused markets reject borrow attempts", async () => {
      const [signer] = await ethers.getSigners();
      for (const c of data.borrowPauseChanges) {
        const vToken = new ethers.Contract(c.vToken, VTOKEN_ABI, ethers.provider);
        await expect(vToken.connect(signer).borrow(1)).to.be.reverted;
      }
    });
  });
});
