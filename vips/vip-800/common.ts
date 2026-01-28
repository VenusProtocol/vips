import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

// Shared market config type
export interface MarketConfig {
  address: string;
  collateralFactor: BigNumber;
  liquidationThreshold: BigNumber;
  liquidationIncentive: BigNumber;
  borrowAllowed: boolean;
}

export interface EmodePool {
  label: string;
  id: number;
  markets: string[];
  allowCorePoolFallback: boolean;
  marketsConfig: Record<string, MarketConfig>;
}

// Reusable stablecoin market config factories
export function makeUSDTMarketConfig(address: string, cf = "0.8", lt = "0.8"): MarketConfig {
  return {
    address,
    collateralFactor: parseUnits(cf, 18),
    liquidationThreshold: parseUnits(lt, 18),
    liquidationIncentive: parseUnits("1.1", 18),
    borrowAllowed: true,
  };
}

export function makeUSDCMarketConfig(address: string, cf = "0.825", lt = "0.825"): MarketConfig {
  return {
    address,
    collateralFactor: parseUnits(cf, 18),
    liquidationThreshold: parseUnits(lt, 18),
    liquidationIncentive: parseUnits("1.1", 18),
    borrowAllowed: true,
  };
}

/**
 * Creates a standard 3-market emode pool config (primary token + USDT + USDC).
 * Accepts vToken addresses and market configs for USDT/USDC for flexibility.
 */
export function createEmodePool(
  label: string,
  id: number,
  vTokenKey: string,
  vTokenAddress: string,
  collateralFactor: string,
  opts: {
    liquidationThreshold?: string;
    borrowAllowed?: boolean;
    usdtMarketConfig: MarketConfig;
    usdcMarketConfig: MarketConfig;
  },
): EmodePool {
  const cf = parseUnits(collateralFactor, 18);
  const lt = opts.liquidationThreshold ? parseUnits(opts.liquidationThreshold, 18) : cf;
  return {
    label,
    id,
    markets: [vTokenAddress, opts.usdtMarketConfig.address, opts.usdcMarketConfig.address],
    allowCorePoolFallback: true,
    marketsConfig: {
      [vTokenKey]: {
        address: vTokenAddress,
        collateralFactor: cf,
        liquidationThreshold: lt,
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: opts.borrowAllowed ?? true,
      },
      vUSDT: opts.usdtMarketConfig,
      vUSDC: opts.usdcMarketConfig,
    },
  };
}

/**
 * Generates the governance proposal commands for a single emode pool.
 * Accepts the network addresses object to support mainnet/testnet.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateEmodePoolCommands(
  pool: EmodePool,
  unitrollerAddress: string,
): { target: string; signature: string; params: any[] }[] {
  const commands: { target: string; signature: string; params: any[] }[] = [
    {
      target: unitrollerAddress,
      signature: "createPool(string)",
      params: [pool.label],
    },
    {
      target: unitrollerAddress,
      signature: "setPoolActive(uint96,bool)",
      params: [pool.id, true],
    },
    {
      target: unitrollerAddress,
      signature: "addPoolMarkets(uint96[],address[])",
      params: [Array(pool.markets.length).fill(pool.id), pool.markets],
    },
    {
      target: unitrollerAddress,
      signature: "setAllowCorePoolFallback(uint96,bool)",
      params: [pool.id, pool.allowCorePoolFallback],
    },
  ];

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: unitrollerAddress,
      signature: "setCollateralFactor(uint96,address,uint256,uint256)",
      params: [pool.id, market.address, market.collateralFactor, market.liquidationThreshold],
    });
  }

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: unitrollerAddress,
      signature: "setLiquidationIncentive(uint96,address,uint256)",
      params: [pool.id, market.address, market.liquidationIncentive],
    });
  }

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: unitrollerAddress,
      signature: "setIsBorrowAllowed(uint96,address,bool)",
      params: [pool.id, market.address, market.borrowAllowed],
    });
  }

  return commands;
}
