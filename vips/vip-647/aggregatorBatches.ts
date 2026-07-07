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
 */
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
  PT_SUSDE_EXTRA_PERMS,
  generateCoreEmodeCommands,
  generatePtSusdeCommands,
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

  // One grant/revoke per (comptroller, setter).
  const cfPerms = pools.map(p => ({ target: p.comptroller, signature: collateralFactorSig(p) }));

  // BNB Chain only: the e-mode zeroing uses the BNB Core 4-arg setter. Ensure its grant is present
  // regardless of whether BNB Core survived the deprecation market filter above.
  if (chain === "bscmainnet") {
    const coreSig = "setCollateralFactor(uint96,address,uint256,uint256)";
    if (!cfPerms.some(p => p.target === BNB_CORE.comptroller && p.signature === coreSig)) {
      cfPerms.push({ target: BNB_CORE.comptroller, signature: coreSig });
    }
    setCalls.push(...generateCoreEmodeCommands().map(toSeed)); // BNB Core e-mode pools (DOT/FIL/THE)

    // PT-sUSDE full deprecation (missed from Phase-4 scope): RF/IRM/cap + CF/LT. The 4-arg CF setter is
    // already granted above; add the vToken RF/IRM and comptroller supply-cap grants.
    cfPerms.push(...PT_SUSDE_EXTRA_PERMS);
    setCalls.push(...generatePtSusdeCommands().map(toSeed));
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
