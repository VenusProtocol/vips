import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, Wallet } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip780, { ADDRESS_DATA, Actions } from "../../vips/vip-780/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const provider = ethers.provider;
const arbitrumPools = ADDRESS_DATA.arbitrumone.pools;

forking(409487867, async () => {
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

  testForkedNetworkVipCommands("VIP-780 Arbitrum One", await vip780(), {
    callbackAfterExecution: async txResponse => {
      // Calculate expected event counts based on markets that need changes
      const allArbitrumMarkets = arbitrumPools.flatMap(pool => pool.markets);

      const marketsNeedingMintPause = allArbitrumMarkets.filter(m => !m.isMintActionPaused).length;
      const marketsNeedingBorrowPause = allArbitrumMarkets.filter(m => !m.isBorrowActionPaused).length;
      const marketsNeedingSupplyCapZero = allArbitrumMarkets.filter(m => m.supplyCap !== "0").length;
      const marketsNeedingBorrowCapZero = allArbitrumMarkets.filter(m => m.borrowCap !== "0").length;
      const marketsNeedingCFZero = allArbitrumMarkets.filter(m => m.collateralFactor !== "0").length;

      // Count total reward speed update events only for markets with non-zero speeds
      // Need to count supply and borrow events separately as some markets may have only one set
      let totalSupplySpeedUpdates = 0;
      let totalBorrowSpeedUpdates = 0;

      for (const pool of arbitrumPools) {
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
    for (const pool of arbitrumPools) {
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
      for (const pool of arbitrumPools) {
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

    it("Users should be able to claim rewards", async () => {
      const holder = "0x8e6973e8b89adf1e16e5DB628ff7F84ef92c7039";

      const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("DEPLOYER_PRIVATE_KEY not set in environment");
      }

      const signer = new Wallet(privateKey, provider);

      // Fund the signer with ETH for gas
      await setBalance(signer.address, ethers.utils.parseEther("10"));

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
