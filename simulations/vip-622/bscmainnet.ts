import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip622 from "../../vips/vip-622/bscmainnet";
import * as data from "../../vips/vip-622/data/bscmainnet";
import BSC_COMPTROLLER_ABI from "./abi/BscComptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";
import { pinOraclePrices } from "./utils/chainRiskParamSuite";

const FORK_BLOCK = 98045352;
const BORROW_ACTION = 2;
const MINT_ACTION = 0;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(data.COMPTROLLER, BSC_COMPTROLLER_ABI, ethers.provider);

  before(async () => {
    await pinOraclePrices("bscmainnet", {
      ...data,
      borrowPauseChanges: [],
    });
  });

  describe("Pre-VIP state (bscmainnet)", () => {
    it("matches current collateral factors and liquidation thresholds", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.old, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("matches current eMode-pool collateral factors and liquidation thresholds", async () => {
      for (const c of data.emodeCfChanges) {
        const md = await comptroller.poolMarkets(c.poolId, c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.old, `${c.symbol} pool ${c.poolId} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(
          c.liquidationThreshold,
          `${c.symbol} pool ${c.poolId} LT`,
        );
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

    it("soft-delist assets have expected CF, LT, pause flags, supply cap, and borrow cap", async () => {
      for (const a of data.delistAssets) {
        const md = await comptroller.markets(a.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal("0", `${a.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(
          a.liquidationThreshold.toString(),
          `${a.symbol} LT`,
        );
        expect(await comptroller.actionPaused(a.vToken, BORROW_ACTION)).to.equal(
          a.borrowAlreadyPaused,
          `${a.symbol} borrow pause`,
        );
        expect(await comptroller.actionPaused(a.vToken, MINT_ACTION)).to.equal(
          a.supplyAlreadyPaused,
          `${a.symbol} mint pause`,
        );
        expect((await comptroller.supplyCaps(a.vToken)).toString()).to.equal(a.oldSupplyCap, `${a.symbol} supplyCap`);
        expect((await comptroller.borrowCaps(a.vToken)).toString()).to.equal(a.oldBorrowCap, `${a.symbol} borrowCap`);
      }
    });

    it("eMode pool labels and borrow-allowed flags match expected pre-VIP state", async () => {
      for (const e of data.emodeBorrowAllowedChanges) {
        const pool = await comptroller.pools(e.poolId);
        expect(pool.label).to.equal(e.poolLabel, `pool ${e.poolId} label`);
        const md = await comptroller.poolMarkets(e.poolId, e.vToken);
        expect(md.isBorrowAllowed).to.equal(e.old, `${e.symbol} pool ${e.poolId} isBorrowAllowed`);
      }
    });
  });

  testVip("VIP-622 BNB Chain Core", await vip622(), {
    callbackAfterExecution: async tx =>
      expectEvents(
        tx,
        [BSC_COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewSupplyCap", "NewBorrowCap", "ActionPausedMarket", "BorrowAllowedUpdated"],
        [
          data.cfChanges.length + data.emodeCfChanges.length,
          data.marketCapChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).length +
            data.delistAssets.filter(a => !BigNumber.from(a.oldSupplyCap).eq(0)).length,
          data.marketCapChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).length +
            data.delistAssets.filter(a => !BigNumber.from(a.oldBorrowCap).eq(0)).length,
          data.delistAssets.filter(a => !a.borrowAlreadyPaused).length +
            data.delistAssets.filter(a => !a.supplyAlreadyPaused).length,
          data.emodeBorrowAllowedChanges.length,
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

    it("applies new eMode-pool collateral factors (LT preserved)", async () => {
      for (const c of data.emodeCfChanges) {
        const md = await comptroller.poolMarkets(c.poolId, c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.new, `${c.symbol} pool ${c.poolId} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(
          c.liquidationThreshold,
          `${c.symbol} pool ${c.poolId} LT`,
        );
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

    it("soft-delist assets have CF zeroed, LT preserved, borrow + mint paused, supply cap zeroed, and borrow cap zeroed", async () => {
      for (const a of data.delistAssets) {
        const md = await comptroller.markets(a.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal("0", `${a.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(
          a.liquidationThreshold.toString(),
          `${a.symbol} LT`,
        );
        expect(await comptroller.actionPaused(a.vToken, BORROW_ACTION)).to.equal(true, `${a.symbol} borrow paused`);
        expect(await comptroller.actionPaused(a.vToken, MINT_ACTION)).to.equal(true, `${a.symbol} mint paused`);
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

    it("eMode pool labels unchanged and borrow-allowed flags applied", async () => {
      for (const e of data.emodeBorrowAllowedChanges) {
        const pool = await comptroller.pools(e.poolId);
        expect(pool.label).to.equal(e.poolLabel, `pool ${e.poolId} label`);
        const md = await comptroller.poolMarkets(e.poolId, e.vToken);
        expect(md.isBorrowAllowed).to.equal(e.new, `${e.symbol} pool ${e.poolId} isBorrowAllowed`);
      }
    });
  });
});
