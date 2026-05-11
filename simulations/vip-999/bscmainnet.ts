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

    it("soft-delist assets have expected CF, LT, borrow pause, supply cap, and borrow cap", async () => {
      for (const a of data.delistAssets) {
        const md = await comptroller.markets(a.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal("0", `${a.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(
          a.liquidationThreshold.toString(),
          `${a.symbol} LT`,
        );
        expect(await comptroller.actionPaused(a.vToken, BORROW_ACTION)).to.equal(
          a.borrowAlreadyPaused,
          `${a.symbol} pause`,
        );
        expect((await comptroller.supplyCaps(a.vToken)).toString()).to.equal(a.oldSupplyCap, `${a.symbol} supplyCap`);
        expect((await comptroller.borrowCaps(a.vToken)).toString()).to.equal(a.oldBorrowCap, `${a.symbol} borrowCap`);
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
          data.marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).length +
            data.delistAssets.filter(a => !BigNumber.from(a.oldSupplyCap).eq(0)).length,
          data.marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).length +
            data.delistAssets.filter(a => !BigNumber.from(a.oldBorrowCap).eq(0)).length,
          data.delistAssets.filter(a => !a.borrowAlreadyPaused).length,
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

    it("applies expected supply caps", async () => {
      for (const c of data.marketCapChanges) {
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.supplyCap.new, `${c.symbol} supplyCap`);
      }
    });

    it("applies expected borrow caps", async () => {
      for (const c of data.marketCapChanges) {
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.borrowCap.new, `${c.symbol} borrowCap`);
      }
    });

    it("soft-delist assets have CF zeroed, LT preserved, borrow paused, supply cap zeroed, and borrow cap zeroed", async () => {
      for (const a of data.delistAssets) {
        const md = await comptroller.markets(a.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal("0", `${a.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(
          a.liquidationThreshold.toString(),
          `${a.symbol} LT`,
        );
        expect(await comptroller.actionPaused(a.vToken, BORROW_ACTION)).to.equal(true, `${a.symbol} borrow paused`);
        expect((await comptroller.supplyCaps(a.vToken)).toString()).to.equal("0", `${a.symbol} supplyCap`);
        expect((await comptroller.borrowCaps(a.vToken)).toString()).to.equal("0", `${a.symbol} borrowCap`);
      }
    });

    it("soft-delist markets reject borrow attempts", async () => {
      const [signer] = await ethers.getSigners();
      for (const a of data.delistAssets) {
        const vToken = new ethers.Contract(a.vToken, VTOKEN_ABI, ethers.provider);
        await expect(vToken.connect(signer).borrow(1)).to.be.reverted;
      }
    });
  });
});
