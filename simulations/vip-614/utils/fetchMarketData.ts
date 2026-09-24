import { providers } from "ethers";
import fs from "fs";
import { ethers } from "hardhat";
import path from "path";

import ERC20_ABI from "../abi/ERC20.json";
import COMPTROLLER_ABI from "../abi/comptroller.json";

const networkConfigs: {
  [key: string]: { address: string; name: string }[];
} = {
  opbnbmainnet: [{ address: "0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd", name: "Core" }],
  unichainmainnet: [{ address: "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe", name: "Core" }],
  opmainnet: [{ address: "0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC", name: "Core" }],
};

const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

interface MarketData {
  name: string;
  address: string;
  isMintActionPaused: boolean;
  isBorrowActionPaused: boolean;
  isEnterMarketActionPaused: boolean;
  supplyCap: string;
  borrowCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
}

interface PoolData {
  name: string;
  comptroller: string;
  markets: MarketData[];
}

interface NetworkData {
  pools: PoolData[];
  totals: {
    totalMintPaused: number;
    totalBorrowPaused: number;
    totalEnterMarketPaused: number;
    totalSupplyCap: number;
    totalBorrowCap: number;
    totalCollateralFactor: number;
  };
}

async function fetchPoolData(
  comptrollerAddress: string,
  poolName: string,
  provider: providers.Provider,
): Promise<PoolData> {
  console.log(`\nFetching ${poolName} pool (${comptrollerAddress})...`);
  const comptroller = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
  const markets: string[] = await comptroller.getAllMarkets();
  const marketDataList: MarketData[] = [];

  for (const marketAddress of markets) {
    let symbol = "Unknown";
    try {
      symbol = await new ethers.Contract(marketAddress, ERC20_ABI, provider).symbol();
    } catch {
      console.warn(`  Could not fetch symbol for ${marketAddress}`);
    }

    const [isMintPaused, isBorrowPaused, isEnterMarketPaused, marketData, supplyCap, borrowCap] = await Promise.all([
      comptroller.actionPaused(marketAddress, Actions.MINT),
      comptroller.actionPaused(marketAddress, Actions.BORROW),
      comptroller.actionPaused(marketAddress, Actions.ENTER_MARKET),
      comptroller.markets(marketAddress),
      comptroller.supplyCaps(marketAddress),
      comptroller.borrowCaps(marketAddress),
    ]);

    marketDataList.push({
      name: symbol,
      address: marketAddress,
      isMintActionPaused: isMintPaused,
      isBorrowActionPaused: isBorrowPaused,
      isEnterMarketActionPaused: isEnterMarketPaused,
      supplyCap: supplyCap.toString(),
      borrowCap: borrowCap.toString(),
      collateralFactor: marketData.collateralFactorMantissa.toString(),
      liquidationThreshold: marketData.liquidationThresholdMantissa.toString(),
    });
  }

  return { name: poolName, comptroller: comptrollerAddress, markets: marketDataList };
}

async function fetchMarketData(
  network: string,
  comptrollers: { address: string; name: string }[],
): Promise<NetworkData> {
  const pools: PoolData[] = [];
  for (const { address, name } of comptrollers) {
    pools.push(await fetchPoolData(address, name, ethers.provider));
  }

  const allMarkets = pools.flatMap(p => p.markets);
  return {
    pools,
    totals: {
      totalMintPaused: allMarkets.filter(m => !m.isMintActionPaused).length,
      totalBorrowPaused: allMarkets.filter(m => !m.isBorrowActionPaused).length,
      totalEnterMarketPaused: allMarkets.filter(m => !m.isEnterMarketActionPaused).length,
      totalSupplyCap: allMarkets.filter(m => m.supplyCap !== "0").length,
      totalBorrowCap: allMarkets.filter(m => m.borrowCap !== "0").length,
      totalCollateralFactor: allMarkets.filter(m => m.collateralFactor !== "0").length,
    },
  };
}

async function main() {
  const network = process.env.HARDHAT_NETWORK || "opbnbmainnet";
  const comptrollers = networkConfigs[network];
  if (!comptrollers) {
    console.error(`No config for network: ${network}. Available: ${Object.keys(networkConfigs).join(", ")}`);
    process.exit(1);
  }
  const data = await fetchMarketData(network, comptrollers);
  const outputPath = path.join(__dirname, `marketData_${network}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\nWrote ${outputPath}`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(e => {
      console.error(e);
      process.exit(1);
    });
}

export { fetchMarketData, fetchPoolData };
