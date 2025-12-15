import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip780, { ADDRESS_DATA, Actions } from "../../vips/vip-780/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const provider = ethers.provider;
const arbitrumPools = ADDRESS_DATA.arbitrumone.pools;
const VTREASURY = NETWORK_ADDRESSES.arbitrumone.VTREASURY;

forking(409487867, async () => {
  // Store pre-VIP balances for reward distributors and treasury per token
  const preVipRewardBalances: { [key: string]: { distributorBalance: BigNumber; treasuryBalance: BigNumber } } = {};
  const preTreasuryBalancePerToken: { [token: string]: BigNumber } = {};

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

    it("Store reward token balances before VIP", async () => {
      for (const pool of arbitrumPools) {
        for (const rd of pool.rewardDistributor) {
          const rewardToken = new ethers.Contract(rd.rewardToken, ERC20_ABI, provider);
          const distributorBalance = await rewardToken.balanceOf(rd.address);

          preVipRewardBalances[rd.address] = {
            distributorBalance,
            treasuryBalance: BigNumber.from(0), // Not used
          };

          // Store treasury balance per token (only once per unique token)
          if (!preTreasuryBalancePerToken[rd.rewardToken]) {
            const treasuryBalance = await rewardToken.balanceOf(VTREASURY);
            preTreasuryBalancePerToken[rd.rewardToken] = treasuryBalance;
          }

          // Verify data matches current state
          expect(distributorBalance.toString()).to.equal(rd.balance);
        }
      }
    });
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

      // Count reward distributors with balance > 0
      const allRewardDistributors = arbitrumPools.flatMap(pool => pool.rewardDistributor);
      const distributorsWithBalance = allRewardDistributors.filter(rd => BigNumber.from(rd.balance).gt(0)).length;

      // ActionPausedMarket events: one for each market needing MINT pause + one for each market needing BORROW pause
      const totalActionPausedEvents = marketsNeedingMintPause + marketsNeedingBorrowPause;

      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, REWARDS_DISTRIBUTOR_ABI],
        ["NewSupplyCap", "NewBorrowCap", "ActionPausedMarket", "NewCollateralFactor", "RewardTokenGranted"],
        [
          marketsNeedingSupplyCapZero,
          marketsNeedingBorrowCapZero,
          totalActionPausedEvents,
          marketsNeedingCFZero,
          distributorsWithBalance,
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

    it("Check reward distributors have 0 balance after VIP", async () => {
      for (const pool of arbitrumPools) {
        for (const rd of pool.rewardDistributor) {
          const expectedTransfer = BigNumber.from(rd.balance);
          if (expectedTransfer.gt(0)) {
            const rewardToken = new ethers.Contract(rd.rewardToken, ERC20_ABI, provider);
            const distributorBalanceAfter = await rewardToken.balanceOf(rd.address);

            // Distributor should have 0 balance after transfer
            expect(distributorBalanceAfter).to.equal(0, `Distributor ${rd.address} should have 0 balance`);
          }
        }
      }
    });

    it("Check Treasury received all reward tokens", async () => {
      // Group by reward token to handle multiple distributors with same token
      const rewardTokenTotals: { [token: string]: BigNumber } = {};

      for (const pool of arbitrumPools) {
        for (const rd of pool.rewardDistributor) {
          const expectedTransfer = BigNumber.from(rd.balance);
          if (expectedTransfer.gt(0)) {
            if (!rewardTokenTotals[rd.rewardToken]) {
              rewardTokenTotals[rd.rewardToken] = BigNumber.from(0);
            }
            rewardTokenTotals[rd.rewardToken] = rewardTokenTotals[rd.rewardToken].add(expectedTransfer);
          }
        }
      }

      // Check treasury received the total expected amount for each reward token
      for (const [tokenAddress, expectedTotal] of Object.entries(rewardTokenTotals)) {
        const rewardToken = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const treasuryBalanceAfter = await rewardToken.balanceOf(VTREASURY);
        const actualIncrease = treasuryBalanceAfter.sub(preTreasuryBalancePerToken[tokenAddress]);

        expect(actualIncrease).to.equal(
          expectedTotal,
          `Treasury should have received ${expectedTotal.toString()} tokens for reward token ${tokenAddress}`,
        );
      }
    });
  });
});
