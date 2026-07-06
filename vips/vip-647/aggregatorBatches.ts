/**
 * VIP-647 CommandsAggregator batches — one per aggregator chain (BNB Chain, Ethereum, Arbitrum One).
 *
 * Each batch is executed by that chain's CommandsAggregator via executeBatch(index) while the aggregator
 * temporarily holds the ACM DEFAULT_ADMIN_ROLE (granted and revoked around executeBatch by the VIP, VIP-628
 * pattern). Every batch is self-permissioning: it grants the aggregator ACM permission for each setter it needs,
 * makes the calls, then revokes the permission — all atomically inside executeBatch.
 *
 * Contents per chain:
 *   - Phase-4 Step 2 deprecation: setCollateralFactor(cf=0, lt=0) on the in-scope markets.
 *   - Oracle feed update: setTokenConfig(asset, feed, maxStalePeriod) on each asset's MAIN oracle adapter.
 *   - BNB Chain only: restore the XVS collateral factor to 55%.
 */
import { parseUnits } from "ethers/lib/utils";
import { Command } from "src/types";

import {
  ARBITRUM_LIQUID_STAKED_ETH,
  BNB_BTC,
  BNB_CORE,
  BNB_DEFI,
  BNB_GAMEFI,
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_MEME,
  BNB_STABLECOINS,
  BNB_TRON,
  ETH_CURVE,
  ETH_LIQUID_STAKED_ETH,
  PoolDef,
} from "../vip-634/phase4Markets";
import {
  ORACLE_UPDATE,
  SET_TOKEN_CONFIG_ACM_SIG,
  SET_TOKEN_CONFIG_SIG,
  distinctAdapters,
  tokenConfigParams,
} from "./oracleFeeds";
import {
  ETH_CORE_STEP2,
  generateCoreEmodeCommands,
  generateStep2Commands,
  marketsToZero,
} from "./zeroCollateralParams";

export interface SeedCommand {
  target: string;
  signature: string;
  params: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type AggregatorChain = "bscmainnet" | "ethereum" | "arbitrumone";

// CommandsAggregator + ACM per aggregator chain (deployed & timelock-permissioned by VIP-628).
export const AGGREGATOR: Record<AggregatorChain, { acm: string; aggregator: string }> = {
  bscmainnet: {
    acm: "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555",
    aggregator: "0x528A428748dfE73DFcc844176B401475D1831057",
  },
  ethereum: {
    acm: "0x230058da2D23eb8836EC5DB7037ef7250c56E25E",
    aggregator: "0xc79Cb7efEBd121DC4B39eA141C214606595D665A",
  },
  arbitrumone: {
    acm: "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157",
    aggregator: "0x768FEf3a88ea92cCF9CAcDf0aB15C4B29B3C1379",
  },
};

// Pools whose Step 2 deprecation runs through the aggregator on each chain.
const POOLS: Record<AggregatorChain, PoolDef[]> = {
  bscmainnet: [
    BNB_CORE,
    BNB_BTC,
    BNB_DEFI,
    BNB_GAMEFI,
    BNB_LIQUID_STAKED_BNB,
    BNB_LIQUID_STAKED_ETH,
    BNB_MEME,
    BNB_STABLECOINS,
    BNB_TRON,
  ],
  ethereum: [ETH_CORE_STEP2, ETH_CURVE, ETH_LIQUID_STAKED_ETH],
  arbitrumone: [ARBITRUM_LIQUID_STAKED_ETH],
};

// Restore the XVS collateral factor in the BNB Core pool to 55% (liquidation threshold stays 60%).
// The Core diamond uses the pool-aware 4-arg setter (poolId 0 = base pool); the 3-arg overload reverts
// for the Core pool. This reuses the same ACM grant the Core deprecation calls already need.
export const XVS_RESTORE = {
  comptroller: BNB_CORE.comptroller,
  vToken: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
  poolId: 0,
  collateralFactor: parseUnits("0.55", 18),
  liquidationThreshold: parseUnits("0.6", 18),
};

// The setCollateralFactor signature the ACM checks for a pool.
const collateralFactorSig = (pool: PoolDef): string =>
  pool.legacy ? "setCollateralFactor(uint96,address,uint256,uint256)" : "setCollateralFactor(address,uint256,uint256)";

// Strip a generated Command down to a chain-local SeedCommand (drop dstChainId / value).
const toSeed = (c: Command): SeedCommand => ({ target: c.target, signature: c.signature, params: c.params });

// Builds the full self-permissioning batch (grant → set → revoke) for one aggregator chain.
export const buildBatch = (chain: AggregatorChain): SeedCommand[] => {
  const { acm, aggregator } = AGGREGATOR[chain];

  const grant = (target: string, signature: string): SeedCommand => ({
    target: acm,
    signature: "giveCallPermission(address,string,address)",
    params: [target, signature, aggregator],
  });
  const revoke = (target: string, signature: string): SeedCommand => ({
    target: acm,
    signature: "revokeCallPermission(address,string,address)",
    params: [target, signature, aggregator],
  });

  // ── Deprecation calls (setCollateralFactor → 0/0) ──
  const pools = POOLS[chain].filter(p => marketsToZero(p).length > 0);
  const setCalls: SeedCommand[] = pools.flatMap(p => generateStep2Commands(p).map(toSeed));
  if (chain === "bscmainnet") setCalls.push(...generateCoreEmodeCommands().map(toSeed)); // BNB Core e-mode pools

  // One grant/revoke per (comptroller, setter) — the core pool's 4-arg setter also covers its e-mode calls.
  const cfPerms = pools.map(p => ({ target: p.comptroller, signature: collateralFactorSig(p) }));

  // BNB Chain only: restore the XVS collateral factor (Core 4-arg setter, poolId 0 — grant already in cfPerms).
  if (chain === "bscmainnet") {
    setCalls.push({
      target: XVS_RESTORE.comptroller,
      signature: "setCollateralFactor(uint96,address,uint256,uint256)",
      params: [XVS_RESTORE.poolId, XVS_RESTORE.vToken, XVS_RESTORE.collateralFactor, XVS_RESTORE.liquidationThreshold],
    });
  }

  // ── Oracle calls: repoint the feed inside each asset's MAIN adapter ──
  const feeds = ORACLE_UPDATE[chain];
  const adapters = distinctAdapters(feeds);
  const oracleCalls: SeedCommand[] = feeds.map(f => ({
    target: f.mainAdapter,
    signature: SET_TOKEN_CONFIG_SIG,
    params: tokenConfigParams(f),
  }));

  return [
    ...cfPerms.map(p => grant(p.target, p.signature)),
    ...adapters.map(a => grant(a, SET_TOKEN_CONFIG_ACM_SIG)),
    ...setCalls,
    ...oracleCalls,
    ...cfPerms.map(p => revoke(p.target, p.signature)),
    ...adapters.map(a => revoke(a, SET_TOKEN_CONFIG_ACM_SIG)),
  ];
};
