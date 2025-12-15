import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip780, { ADDRESS_DATA, Actions } from "../../vips/vip-780/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const provider = ethers.provider;

forking(71265203, async () => {
  const bscPools = ADDRESS_DATA.bscmainnet.pools;

  describe("Pre-VIP behavior", async () => {
    for (const pool of bscPools) {
      describe(`${pool.name} Pool`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        });

        it("Check MINT pause state matches data", async () => {
          for (const market of pool.markets) {
            const isPaused = await comptroller.actionPaused(market.address, Actions.MINT);
            expect(isPaused, `MINT pause state for ${market.name}`).to.be.equal(market.isMintActionPaused);
          }
        });

        it("Check BORROW pause state matches data", async () => {
          for (const market of pool.markets) {
            const isPaused = await comptroller.actionPaused(market.address, Actions.BORROW);
            expect(isPaused, `BORROW pause state for ${market.name}`).to.be.equal(market.isBorrowActionPaused);
          }
        });

        it("Check collateral factors match data", async () => {
          for (const market of pool.markets) {
            const marketData = await comptroller.markets(market.address);
            expect(marketData.collateralFactorMantissa.toString(), `CF for ${market.name}`).to.be.equal(
              market.collateralFactor,
            );
          }
        });

        it("Check supply caps match data", async () => {
          for (const market of pool.markets) {
            const supplyCap = await comptroller.supplyCaps(market.address);
            expect(supplyCap.toString(), `Supply cap for ${market.name}`).to.be.equal(market.supplyCap);
          }
        });

        it("Check borrow caps match data", async () => {
          for (const market of pool.markets) {
            const borrowCap = await comptroller.borrowCaps(market.address);
            expect(borrowCap.toString(), `Borrow cap for ${market.name}`).to.be.equal(market.borrowCap);
          }
        });
      });
    }
  });

  testVip("VIP-780 BNB Chain", await vip780(), {
    callbackAfterExecution: async txResponse => {
      // Only BNB Chain commands are executed with testVip (no dstChainId)
      // Calculate expected event counts based on markets that need changes
      const allBscMarkets = bscPools.flatMap(pool => pool.markets);

      const marketsNeedingMintPause = allBscMarkets.filter(m => !m.isMintActionPaused).length;
      const marketsNeedingBorrowPause = allBscMarkets.filter(m => !m.isBorrowActionPaused).length;
      const marketsNeedingSupplyCapZero = allBscMarkets.filter(m => m.supplyCap !== "0").length;
      const marketsNeedingBorrowCapZero = allBscMarkets.filter(m => m.borrowCap !== "0").length;
      const marketsNeedingCFZero = allBscMarkets.filter(m => m.collateralFactor !== "0").length;

      // Count total reward speed update events only for markets with non-zero speeds
      // Need to count supply and borrow events separately as some markets may have only one set
      let totalSupplySpeedUpdates = 0;
      let totalBorrowSpeedUpdates = 0;

      for (const pool of bscPools) {
        for (const rd of pool.rewardDistributor) {
          for (const market of pool.markets) {
            const rewardSpeed = market.rewardSpeeds?.[rd.address];
            if (rewardSpeed) {
              if (rewardSpeed.supplySpeed !== "0") {
                totalSupplySpeedUpdates++;
              }
              if (rewardSpeed.borrowSpeed !== "0") {
                totalBorrowSpeedUpdates++;
              }
            }
          }
        }
      }

      // ActionPausedMarket events: one for each market needing MINT pause + one for each market needing BORROW pause
      const totalActionPausedEvents = marketsNeedingMintPause + marketsNeedingBorrowPause;

      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, REWARDS_DISTRIBUTOR_ABI],
        [
          "NewSupplyCap",
          "NewBorrowCap",
          "ActionPausedMarket",
          "NewCollateralFactor",
          "RewardTokenSupplySpeedUpdated",
          "RewardTokenBorrowSpeedUpdated",
        ],
        [
          marketsNeedingSupplyCapZero,
          marketsNeedingBorrowCapZero,
          totalActionPausedEvents,
          marketsNeedingCFZero,
          totalSupplySpeedUpdates, // RewardTokenSupplySpeedUpdated events
          totalBorrowSpeedUpdates, // RewardTokenBorrowSpeedUpdated events
        ],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const pool of bscPools) {
      describe(`${pool.name} Pool`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        });

        it("Check all markets have CF set to zero, LT preserved", async () => {
          for (const market of pool.markets) {
            const marketData = await comptroller.markets(market.address);
            expect(marketData.collateralFactorMantissa.toString(), `CF should be 0 for ${market.name}`).to.be.equal(
              "0",
            );
            expect(
              marketData.liquidationThresholdMantissa.toString(),
              `LT should be preserved for ${market.name}`,
            ).to.be.equal(market.liquidationThreshold);
          }
        });

        it("Check MINT is paused for markets", async () => {
          for (const market of pool.markets) {
            const mintPaused = await comptroller.actionPaused(market.address, Actions.MINT);
            expect(mintPaused, `MINT should be paused for ${market.name}`).to.be.true;
          }
        });

        it("Check BORROW is paused for markets", async () => {
          for (const market of pool.markets) {
            const borrowPaused = await comptroller.actionPaused(market.address, Actions.BORROW);
            expect(borrowPaused, `BORROW should be paused for ${market.name}`).to.be.true;
          }
        });

        it("Check supply caps are zero for markets", async () => {
          for (const market of pool.markets) {
            const supplyCap = await comptroller.supplyCaps(market.address);
            expect(supplyCap, `Supply cap should be zero for ${market.name}`).to.be.equal(0);
          }
        });

        it("Check borrow caps are zero for markets", async () => {
          for (const market of pool.markets) {
            const borrowCap = await comptroller.borrowCaps(market.address);
            expect(borrowCap, `Borrow cap should be zero for ${market.name}`).to.be.equal(0);
          }
        });
      });
    }

    it("Check reward speeds are set to zero for all markets", async () => {
      for (const pool of bscPools) {
        for (const rd of pool.rewardDistributor) {
          const rewardsDistributor = new ethers.Contract(rd.address, REWARDS_DISTRIBUTOR_ABI, provider);

          for (const market of pool.markets) {
            const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(market.address);
            const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(market.address);

            expect(supplySpeed).to.equal(0, `Supply speed should be 0 for ${market.name} in ${pool.name}`);
            expect(borrowSpeed).to.equal(0, `Borrow speed should be 0 for ${market.name} in ${pool.name}`);
          }
        }
      }
    });
  });
});
