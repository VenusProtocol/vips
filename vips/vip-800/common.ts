import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { bscmainnet } = NETWORK_ADDRESSES;

// Shared vToken addresses
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

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

// Reusable stablecoin market configs
export const USDT_MARKET_CONFIG: MarketConfig = {
  address: vUSDT,
  collateralFactor: parseUnits("0.8", 18),
  liquidationThreshold: parseUnits("0.8", 18),
  liquidationIncentive: parseUnits("1.1", 18),
  borrowAllowed: true,
};

export const USDC_MARKET_CONFIG: MarketConfig = {
  address: vUSDC,
  collateralFactor: parseUnits("0.825", 18),
  liquidationThreshold: parseUnits("0.825", 18),
  liquidationIncentive: parseUnits("1.1", 18),
  borrowAllowed: true,
};

/**
 * Creates a standard 3-market emode pool config (primary token + USDT + USDC).
 */
export function createEmodePool(
  label: string,
  id: number,
  vTokenKey: string,
  vTokenAddress: string,
  collateralFactor: string,
  opts?: { liquidationThreshold?: string; borrowAllowed?: boolean },
): EmodePool {
  const cf = parseUnits(collateralFactor, 18);
  const lt = opts?.liquidationThreshold ? parseUnits(opts.liquidationThreshold, 18) : cf;
  return {
    label,
    id,
    markets: [vTokenAddress, vUSDT, vUSDC],
    allowCorePoolFallback: true,
    marketsConfig: {
      [vTokenKey]: {
        address: vTokenAddress,
        collateralFactor: cf,
        liquidationThreshold: lt,
        liquidationIncentive: parseUnits("1.1", 18),
        borrowAllowed: opts?.borrowAllowed ?? true,
      },
      vUSDT: USDT_MARKET_CONFIG,
      vUSDC: USDC_MARKET_CONFIG,
    },
  };
}

/**
 * Generates the governance proposal commands for a single emode pool.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateEmodePoolCommands(pool: EmodePool): { target: string; signature: string; params: any[] }[] {
  const commands: { target: string; signature: string; params: any[] }[] = [
    {
      target: bscmainnet.UNITROLLER,
      signature: "createPool(string)",
      params: [pool.label],
    },
    {
      target: bscmainnet.UNITROLLER,
      signature: "setPoolActive(uint96,bool)",
      params: [pool.id, true],
    },
    {
      target: bscmainnet.UNITROLLER,
      signature: "addPoolMarkets(uint96[],address[])",
      params: [Array(pool.markets.length).fill(pool.id), pool.markets],
    },
    {
      target: bscmainnet.UNITROLLER,
      signature: "setAllowCorePoolFallback(uint96,bool)",
      params: [pool.id, pool.allowCorePoolFallback],
    },
  ];

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bscmainnet.UNITROLLER,
      signature: "setCollateralFactor(uint96,address,uint256,uint256)",
      params: [pool.id, market.address, market.collateralFactor, market.liquidationThreshold],
    });
  }

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bscmainnet.UNITROLLER,
      signature: "setLiquidationIncentive(uint96,address,uint256)",
      params: [pool.id, market.address, market.liquidationIncentive],
    });
  }

  for (const marketKey of Object.keys(pool.marketsConfig)) {
    const market = pool.marketsConfig[marketKey];
    commands.push({
      target: bscmainnet.UNITROLLER,
      signature: "setIsBorrowAllowed(uint96,address,bool)",
      params: [pool.id, market.address, market.borrowAllowed],
    });
  }

  return commands;
}
