import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip780, { ADDRESS_DATA, Actions } from "../../vips/vip-780/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const provider = ethers.provider;
const arbitrumPools = ADDRESS_DATA.arbitrumone.pools;

forking(411152865, async () => {
  describe("Pre-VIP behavior", async () => {
    for (const pool of arbitrumPools) {
      describe(`${pool.name} Pool`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        });

        it("Check MINT pause state matches data", async () => {
          for (const market of pool.markets) {
            const isPaused = await comptroller.actionPaused(market.address, Actions.MINT);
            expect(isPaused).to.be.equal(market.isMintActionPaused);
          }
        });

        it("Check BORROW pause state matches data", async () => {
          for (const market of pool.markets) {
            const isPaused = await comptroller.actionPaused(market.address, Actions.BORROW);
            expect(isPaused).to.be.equal(market.isBorrowActionPaused);
          }
        });

        it("Check collateral factors match data", async () => {
          for (const market of pool.markets) {
            const marketData = await comptroller.markets(market.address);
            expect(marketData.collateralFactorMantissa.toString()).to.be.equal(market.collateralFactor);
          }
        });

        it("Check supply caps match data", async () => {
          for (const market of pool.markets) {
            const supplyCap = await comptroller.supplyCaps(market.address);
            expect(supplyCap.toString()).to.be.equal(market.supplyCap);
          }
        });

        it("Check borrow caps match data", async () => {
          for (const market of pool.markets) {
            const borrowCap = await comptroller.borrowCaps(market.address);
            expect(borrowCap.toString()).to.be.equal(market.borrowCap);
          }
        });
      });
    }
  });

  testForkedNetworkVipCommands("VIP-780 Arbitrum One", await vip780(), {
    callbackAfterExecution: async txResponse => {
      const totals = ADDRESS_DATA.arbitrumone.totals!;
      const totalActionPausedEvents = totals.totalMintPaused + totals.totalBorrowPaused;

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
          totals.totalSupplyCap,
          totals.totalBorrowCap,
          totalActionPausedEvents,
          totals.totalCollateralFactor,
          totals.totalSupplySpeed,
          totals.totalBorrowSpeed,
        ],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const pool of arbitrumPools) {
      describe(`${pool.name} Pool`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        });

        it("Check all markets have CF set to zero, LT preserved", async () => {
          for (const market of pool.markets) {
            const marketData = await comptroller.markets(market.address);
            expect(marketData.collateralFactorMantissa.toString()).to.be.equal("0");
            expect(marketData.liquidationThresholdMantissa.toString()).to.be.equal(market.liquidationThreshold);
          }
        });

        it("Check MINT is paused for markets", async () => {
          for (const market of pool.markets) {
            const mintPaused = await comptroller.actionPaused(market.address, Actions.MINT);
            expect(mintPaused).to.be.true;
          }
        });

        it("Check BORROW is paused for markets", async () => {
          for (const market of pool.markets) {
            const borrowPaused = await comptroller.actionPaused(market.address, Actions.BORROW);
            expect(borrowPaused).to.be.true;
          }
        });

        it("Check supply caps are zero for markets", async () => {
          for (const market of pool.markets) {
            const supplyCap = await comptroller.supplyCaps(market.address);
            expect(supplyCap).to.be.equal(0);
          }
        });

        it("Check borrow caps are zero for markets", async () => {
          for (const market of pool.markets) {
            const borrowCap = await comptroller.borrowCaps(market.address);
            expect(borrowCap).to.be.equal(0);
          }
        });
      });
    }

    it("Check reward speeds are set to zero for all markets", async () => {
      for (const pool of arbitrumPools) {
        for (const rd of pool.rewardDistributor) {
          const rewardsDistributor = new ethers.Contract(rd.address, REWARDS_DISTRIBUTOR_ABI, provider);

          for (const market of pool.markets) {
            const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(market.address);
            const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(market.address);

            expect(supplySpeed).to.equal(0);
            expect(borrowSpeed).to.equal(0);
          }
        }
      }
    });

    it("Users should be able to claim rewards", async () => {
      const holder = "0x8e6973e8b89adf1e16e5DB628ff7F84ef92c7039";
      const [signer] = await ethers.getSigners();

      const distributor = await ethers.getContractAt(
        REWARDS_DISTRIBUTOR_ABI,
        "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D",
        signer,
      );

      const accruedBefore = await distributor.rewardTokenAccrued(holder);
      await distributor["claimRewardToken(address)"](holder);
      const accruedAfter = await distributor.rewardTokenAccrued(holder);

      expect(accruedAfter).to.be.lessThanOrEqual(accruedBefore);
    });
  });
});
