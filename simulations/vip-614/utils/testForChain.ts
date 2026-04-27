import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import vip614, { ADDRESS_DATA, Actions } from "../../../vips/vip-614/bscmainnet";
import COMPTROLLER_ABI from "../abi/comptroller.json";

type ChainKey = keyof typeof ADDRESS_DATA;

export const describeChainExecution = async (description: string, chainKey: ChainKey) => {
  const provider = ethers.provider;
  const pools = ADDRESS_DATA[chainKey].pools;

  describe(`Pre-VIP state (${chainKey})`, async () => {
    for (const pool of pools) {
      describe(`${pool.name} Pool`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        });

        it("MINT pause state matches recorded data", async () => {
          for (const m of pool.markets) {
            expect(await comptroller.actionPaused(m.address, Actions.MINT)).to.equal(m.isMintActionPaused);
          }
        });

        it("BORROW pause state matches recorded data", async () => {
          for (const m of pool.markets) {
            expect(await comptroller.actionPaused(m.address, Actions.BORROW)).to.equal(m.isBorrowActionPaused);
          }
        });

        it("ENTER_MARKET pause state matches recorded data", async () => {
          for (const m of pool.markets) {
            expect(await comptroller.actionPaused(m.address, Actions.ENTER_MARKET)).to.equal(
              m.isEnterMarketActionPaused,
            );
          }
        });

        it("supply/borrow caps and CF/LT match recorded data", async () => {
          for (const m of pool.markets) {
            const md = await comptroller.markets(m.address);
            expect((await comptroller.supplyCaps(m.address)).toString()).to.equal(m.supplyCap);
            expect((await comptroller.borrowCaps(m.address)).toString()).to.equal(m.borrowCap);
            expect(md.collateralFactorMantissa.toString()).to.equal(m.collateralFactor);
            expect(md.liquidationThresholdMantissa.toString()).to.equal(m.liquidationThreshold);
          }
        });
      });
    }
  });

  testForkedNetworkVipCommands(description, await vip614(), {
    callbackAfterExecution: async txResponse => {
      const t = ADDRESS_DATA[chainKey].totals!;
      const actionPausedCount = t.totalMintPaused + t.totalBorrowPaused + t.totalEnterMarketPaused;
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewSupplyCap", "NewBorrowCap", "ActionPausedMarket", "NewCollateralFactor"],
        [t.totalSupplyCap, t.totalBorrowCap, actionPausedCount, t.totalCollateralFactor],
      );
    },
  });

  describe(`Post-VIP state (${chainKey})`, async () => {
    for (const pool of pools) {
      describe(`${pool.name} Pool`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        });

        it("MINT, BORROW, ENTER_MARKET paused for every market", async () => {
          for (const m of pool.markets) {
            expect(await comptroller.actionPaused(m.address, Actions.MINT)).to.be.true;
            expect(await comptroller.actionPaused(m.address, Actions.BORROW)).to.be.true;
            expect(await comptroller.actionPaused(m.address, Actions.ENTER_MARKET)).to.be.true;
          }
        });

        it("REDEEM, REPAY, LIQUIDATE, EXIT_MARKET, TRANSFER remain open", async () => {
          for (const m of pool.markets) {
            expect(await comptroller.actionPaused(m.address, Actions.REDEEM)).to.be.false;
            expect(await comptroller.actionPaused(m.address, Actions.REPAY)).to.be.false;
            expect(await comptroller.actionPaused(m.address, Actions.LIQUIDATE)).to.be.false;
            expect(await comptroller.actionPaused(m.address, Actions.EXIT_MARKET)).to.be.false;
            expect(await comptroller.actionPaused(m.address, Actions.TRANSFER)).to.be.false;
          }
        });

        it("supply and borrow caps == 0 for every market", async () => {
          for (const m of pool.markets) {
            expect(await comptroller.supplyCaps(m.address)).to.equal(0);
            expect(await comptroller.borrowCaps(m.address)).to.equal(0);
          }
        });

        it("CF == 0 and LT unchanged for every market", async () => {
          for (const m of pool.markets) {
            const md = await comptroller.markets(m.address);
            expect(md.collateralFactorMantissa).to.equal(0);
            expect(md.liquidationThresholdMantissa.toString()).to.equal(m.liquidationThreshold);
          }
        });
      });
    }

    it("preMintHook and preBorrowHook revert for every market (actions are functionally blocked)", async () => {
      const [signer] = await ethers.getSigners();
      for (const pool of pools) {
        const comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        for (const m of pool.markets) {
          await expect(comptroller.callStatic.preMintHook(m.address, signer.address, 1)).to.be.reverted;
          await expect(comptroller.callStatic.preBorrowHook(m.address, signer.address, 1)).to.be.reverted;
        }
      }
    });

    it("preRedeemHook and preRepayHook do not revert for zero-amount probes (redeem/repay paths still open)", async () => {
      const [signer] = await ethers.getSigners();
      for (const pool of pools) {
        const comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        for (const m of pool.markets) {
          await expect(comptroller.callStatic.preRedeemHook(m.address, signer.address, 0)).to.not.be.reverted;
          await expect(comptroller.callStatic.preRepayHook(m.address, signer.address)).to.not.be.reverted;
        }
      }
    });
  });
};
