import { providers } from "ethers";
import fs from "fs";
import { ethers } from "hardhat";
import path from "path";

import ERC20_ABI from "../abi/ERC20.json";
import COMPTROLLER_ABI from "../abi/comptroller.json";
import REWARDS_DISTRIBUTOR_ABI from "../abi/rewardsDistributor.json";

// Configuration for different networks with isolated pools
const networkConfigs: {
  [key: string]: { address: string; name: string }[];
} = {
  bscmainnet: [
    { address: "0x3344417c9360b963ca93A4e8305361AEde340Ab9", name: "DeFi" },
    { address: "0x1b43ea8622e76627B81665B1eCeBB4867566B963", name: "GameFi" },
    { address: "0xd933909A4a2b7A4638903028f44D1d38ce27c352", name: "LiquidStakedBNB" },
  ],
  ethereum: [{ address: "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3", name: "LiquidStakedETH" }],
  arbitrumone: [{ address: "0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16", name: "LiquidStakedETH" }],
};

// Action enum values
const Actions = {
  MINT: 0,
  REDEEM: 1,
  BORROW: 2,
  REPAY: 3,
  SEIZE: 4,
  LIQUIDATE: 5,
  TRANSFER: 6,
  ENTER_MARKET: 7,
  EXIT_MARKET: 8,
};

interface MarketData {
  name: string;
  address: string;
  isMintActionPaused: boolean;
  isBorrowActionPaused: boolean;
  supplyCap: string;
  borrowCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
}

interface RewardDistributorData {
  address: string;
  rewardToken: string;
  balance: string;
  marketsWithNonZeroSpeeds?: string[]; // List of market addresses with non-zero supply or borrow speeds
}

interface PoolData {
  name: string;
  comptroller: string;
  rewardDistributor: RewardDistributorData[];
  markets: MarketData[];
}

interface NetworkData {
  pools: PoolData[];
  totals?: {
    totalMintPaused: number;
    totalBorrowPaused: number;
    totalSupplyCap: number;
    totalBorrowCap: number;
    totalCollateralFactor: number;
    totalSupplySpeed: number;
    totalBorrowSpeed: number;
  };
}

/**
 * Fetches market data for a given comptroller
 */
async function fetchPoolData(
  comptrollerAddress: string,
  poolName: string,
  provider: providers.Provider,
): Promise<{
  poolData: PoolData;
  poolTotals: {
    totalMintPaused: number;
    totalBorrowPaused: number;
    totalSupplyCap: number;
    totalBorrowCap: number;
    totalCollateralFactor: number;
    totalSupplySpeed: number;
    totalBorrowSpeed: number;
  };
}> {
  console.log(`\nFetching data for ${poolName} pool (${comptrollerAddress})...`);

  const comptroller = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);

  // Get reward distributors
  const rewardDistributors = await comptroller.getRewardDistributors();

  // Get all markets first
  const markets = await comptroller.getAllMarkets();

  // Fetch reward distributor data and check speeds for each market
  const rewardDistributorDataList: RewardDistributorData[] = [];
  const marketRewardSpeeds: {
    [marketAddress: string]: { [distributorAddress: string]: { supplySpeed: string; borrowSpeed: string } };
  } = {};

  for (const rdAddress of rewardDistributors) {
    try {
      const rewardsDistributor = new ethers.Contract(rdAddress, REWARDS_DISTRIBUTOR_ABI, provider);

      // Get reward token address
      const rewardTokenAddress = await rewardsDistributor.rewardToken();

      // Get reward token balance of the distributor
      const rewardToken = new ethers.Contract(rewardTokenAddress, ERC20_ABI, provider);
      const balance = await rewardToken.balanceOf(rdAddress);

      // Check speeds for each market
      const marketsWithNonZeroSpeeds: string[] = [];

      for (const marketAddress of markets) {
        try {
          const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(marketAddress);
          const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(marketAddress);

          // Store the speeds for this market and distributor
          if (!marketRewardSpeeds[marketAddress]) {
            marketRewardSpeeds[marketAddress] = {};
          }
          marketRewardSpeeds[marketAddress][rdAddress] = {
            supplySpeed: supplySpeed.toString(),
            borrowSpeed: borrowSpeed.toString(),
          };

          // If either speed is non-zero, add to the list
          if (!supplySpeed.isZero() || !borrowSpeed.isZero()) {
            marketsWithNonZeroSpeeds.push(marketAddress);
          }
        } catch (e) {
          console.warn(`    Warning: Could not fetch speeds for market ${marketAddress} in distributor ${rdAddress}`);
        }
      }

      rewardDistributorDataList.push({
        address: rdAddress,
        rewardToken: rewardTokenAddress,
        balance: balance.toString(),
        marketsWithNonZeroSpeeds: marketsWithNonZeroSpeeds,
      });
    } catch (e) {
      console.warn(`    Warning: Could not fetch data for reward distributor ${rdAddress}:`, e);
      rewardDistributorDataList.push({
        address: rdAddress,
        rewardToken: "Unknown",
        balance: "0",
        marketsWithNonZeroSpeeds: [],
      });
    }
  }

  // Fetch market data
  const marketDataList: MarketData[] = [];

  for (const marketAddress of markets) {
    // Get vToken symbol
    let symbol = "Unknown";
    try {
      const vToken = new ethers.Contract(marketAddress, ERC20_ABI, provider);
      symbol = await vToken.symbol();
    } catch (e) {
      console.warn(`    Warning: Could not fetch symbol for ${marketAddress}`);
    }

    // Get action paused states
    const isMintPaused = await comptroller.actionPaused(marketAddress, Actions.MINT);
    const isBorrowPaused = await comptroller.actionPaused(marketAddress, Actions.BORROW);

    // Get market data (collateral factor and liquidation threshold)
    const marketData = await comptroller.markets(marketAddress);

    // Get caps
    const supplyCap = await comptroller.supplyCaps(marketAddress);
    const borrowCap = await comptroller.borrowCaps(marketAddress);

    // Only include markets that need at least one change
    const needsMintPause = !isMintPaused;
    const needsBorrowPause = !isBorrowPaused;
    const needsSupplyCapZero = supplyCap.toString() !== "0";
    const needsBorrowCapZero = borrowCap.toString() !== "0";
    const needsCFZero = marketData.collateralFactorMantissa.toString() !== "0";

    // Skip markets that are already fully deprecated
    if (!needsMintPause && !needsBorrowPause && !needsSupplyCapZero && !needsBorrowCapZero && !needsCFZero) {
      console.log(`    Skipping ${symbol} - already fully deprecated`);
      continue;
    }

    const marketInfo: MarketData = {
      name: symbol,
      address: marketAddress,
      isMintActionPaused: isMintPaused,
      isBorrowActionPaused: isBorrowPaused,
      supplyCap: supplyCap.toString(),
      borrowCap: borrowCap.toString(),
      collateralFactor: marketData.collateralFactorMantissa.toString(),
      liquidationThreshold: marketData.liquidationThresholdMantissa.toString(),
    };

    marketDataList.push(marketInfo);
  }

  // Calculate pool-level totals for aggregation (not stored in JSON)
  const poolTotals = {
    totalMintPaused: marketDataList.filter(m => !m.isMintActionPaused).length,
    totalBorrowPaused: marketDataList.filter(m => !m.isBorrowActionPaused).length,
    totalSupplyCap: marketDataList.filter(m => m.supplyCap !== "0").length,
    totalBorrowCap: marketDataList.filter(m => m.borrowCap !== "0").length,
    totalCollateralFactor: marketDataList.filter(m => m.collateralFactor !== "0").length,
    totalSupplySpeed: 0,
    totalBorrowSpeed: 0,
  };

  // Count reward speed events using stored speeds
  for (const rd of rewardDistributorDataList) {
    if (rd.marketsWithNonZeroSpeeds) {
      for (const marketAddress of rd.marketsWithNonZeroSpeeds) {
        const speeds = marketRewardSpeeds[marketAddress]?.[rd.address];
        if (speeds) {
          if (speeds.supplySpeed !== "0") poolTotals.totalSupplySpeed++;
          if (speeds.borrowSpeed !== "0") poolTotals.totalBorrowSpeed++;
        }
      }
    }
  }

  return {
    poolData: {
      name: poolName,
      comptroller: comptrollerAddress,
      rewardDistributor: rewardDistributorDataList,
      markets: marketDataList,
    },
    poolTotals,
  };
}

/**
 * Main function to fetch market data for given network and comptrollers
 */
async function fetchMarketData(network: string, comptrollers: { address: string; name: string }[]) {
  console.log(`\n========================================`);
  console.log(`Fetching market data for ${network}`);
  console.log(`========================================`);

  const provider = ethers.provider;

  const pools: PoolData[] = [];
  const totals = {
    totalMintPaused: 0,
    totalBorrowPaused: 0,
    totalSupplyCap: 0,
    totalBorrowCap: 0,
    totalCollateralFactor: 0,
    totalSupplySpeed: 0,
    totalBorrowSpeed: 0,
  };

  for (const { address, name } of comptrollers) {
    const { poolData, poolTotals } = await fetchPoolData(address, name, provider);
    pools.push(poolData);

    // Accumulate totals
    totals.totalMintPaused += poolTotals.totalMintPaused;
    totals.totalBorrowPaused += poolTotals.totalBorrowPaused;
    totals.totalSupplyCap += poolTotals.totalSupplyCap;
    totals.totalBorrowCap += poolTotals.totalBorrowCap;
    totals.totalCollateralFactor += poolTotals.totalCollateralFactor;
    totals.totalSupplySpeed += poolTotals.totalSupplySpeed;
    totals.totalBorrowSpeed += poolTotals.totalBorrowSpeed;
  }

  return {
    pools,
    totals,
  };
}

/**
 * Generates JSON file with the fetched data
 */
function generateOutputFile(data: NetworkData, outputPath: string) {
  // Write JSON file
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\n✅ Output JSON file generated: ${outputPath}`);
}

async function main() {
  const network = process.env.HARDHAT_NETWORK || "bscmainnet";

  console.log(`Network: ${network}`);
  const provider = ethers.provider;
  const blockNumber = await provider.getBlockNumber();
  console.log(`Current block number: ${blockNumber}`);

  const comptrollers = networkConfigs[network];

  if (!comptrollers) {
    console.error(`No configuration found for network: ${network}`);
    console.log(`Available networks: ${Object.keys(networkConfigs).join(", ")}`);
    process.exit(1);
  }

  const networkData = await fetchMarketData(network, comptrollers);

  // Generate output file
  const outputPath = path.join(__dirname, `marketData_${network}.json`);
  generateOutputFile(networkData, outputPath);
}

// Allow the script to be run directly or imported
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { fetchMarketData, fetchPoolData };
