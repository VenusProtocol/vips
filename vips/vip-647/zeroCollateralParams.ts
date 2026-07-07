/**
 * Phase-4 market deprecation, Step 2 — shared scope + command builders used by VIP-647.
 *
 * Exports:
 *   - LT_ALREADY_ZERO — vTokens already at liquidation threshold 0, skipped as no-ops.
 *   - CORE_EMODE      — BNB Core markets that also live in an e-mode pool (extra zeroing).
 *   - ETH_CORE_STEP2  — Ethereum Core plus the four yv* markets re-added for Step 2.
 *   - generateStep2Commands / generateCoreEmodeCommands — emit the setCollateralFactor(cf=0, lt=0) calls.
 *   - marketsToZero   — the per-pool market list the commands and simulation checks share.
 *   - PT_SUSDE / PT_SUSDE_EXTRA_PERMS / generatePtSusdeCommands — the full deprecation (RF/IRM/cap + CF/LT)
 *     for the PT-sUSDE market that was omitted from the Phase-4 scope.
 */
import { Command } from "src/types";

import { BNB_CORE, ETH_CORE, Mkt, PUSHOUT_IRM, PoolDef, RF_FULL } from "../vip-634/phase4Markets";

// The four Ethereum Core yv* markets, re-added for Step 2 (commented out of the
// Step 1 command list in vip-634/phase4Markets.ts).
const ETH_CORE_YV_MARKETS: Mkt[] = [
  { symbol: "yvUSDC-1", vToken: "0xf87c0a64dc3a8622D6c63265FA29137788163879" },
  { symbol: "yvUSDT-1", vToken: "0x475d0C68a8CD275c15D1F01F4f291804E445F677" },
  { symbol: "yvUSDS-1", vToken: "0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764" },
  { symbol: "yvWETH-1", vToken: "0xba3916302cBA4aBcB51a01e706fC6051AaF272A0" },
];

// Ethereum Core in Step 2 covers the same five markets as Step 1 plus the four yv* markets.
export const ETH_CORE_STEP2: PoolDef = {
  ...ETH_CORE,
  markets: [...ETH_CORE.markets, ...ETH_CORE_YV_MARKETS],
};

// Markets whose liquidation threshold is already 0 on-chain (reads dated 2026-07-06).
// Zeroing them is a pure no-op, so they are dropped from both the command list and the
// pre/post-VIP assertions. Keyed by vToken address (lower-case).
export const LT_ALREADY_ZERO = new Set<string>(
  [
    "0x8F2AE20b25c327714248C95dFD3b02815cC82302", // BNB BTC pool                — BTCB
    "0x53728FD51060a85ac41974C6C3Eb1DaE42776723", // BNB DeFi pool               — ankrBNB
    "0xeCCACF760FEA7943C5b0285BD09F601505A29c05", // BNB Liquid Staked ETH pool  — ETH
    "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3", // BNB Core pool               — TUSDOLD
    "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93", // BNB Core pool               — TRXOLD
    "0x95c78222B3D6e262426483D42CfA53685A67Ab9D", // BNB Core pool               — BUSD
    "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0", // BNB Core pool               — SXP
    "0x39D6d13Ea59548637104E40e729E4aABE27FE106", // Arbitrum Liquid Staked ETH  — WETH
  ].map(a => a.toLowerCase()),
);

// BNB Core markets that additionally belong to an e-mode pool. Their base-pool
// (poolId 0) threshold is zeroed by generateStep2Commands(BNB_CORE); these entries
// zero the threshold in the e-mode pool as well. Verified on-chain (2026-07-06).
export interface CoreEmodeEntry {
  symbol: string;
  vToken: string;
  poolId: number;
}
export const CORE_EMODE: CoreEmodeEntry[] = [
  { symbol: "DOT", vToken: "0x1610bc33319e9398de5f57B33a5b184c806aD217", poolId: 14 },
  { symbol: "FIL", vToken: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343", poolId: 12 },
  { symbol: "THE", vToken: "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f", poolId: 15 },
];

// Markets in a pool that still carry a non-zero liquidation threshold (i.e. everything
// except the already-zero markets). Exported so the simulation checks stay in lock-step
// with the emitted commands.
export const marketsToZero = (pool: PoolDef): Mkt[] =>
  pool.markets.filter(m => !LT_ALREADY_ZERO.has(m.vToken.toLowerCase()));

// BNB Core uses the diamond's pool-aware setter; every other pool is an isolated-pool
// Comptroller with the two-threshold setter.
const isCorePool = (pool: PoolDef): boolean => pool.legacy === true;

// One command per in-scope market, zeroing both collateral factor and liquidation threshold.
export const generateStep2Commands = (pool: PoolDef): Command[] => {
  const chain = pool.dstChainId !== undefined ? { dstChainId: pool.dstChainId } : {};
  const core = isCorePool(pool);
  return marketsToZero(pool).map(m =>
    core
      ? {
          target: pool.comptroller,
          signature: "setCollateralFactor(uint96,address,uint256,uint256)",
          params: [0, m.vToken, 0, 0],
          ...chain,
        }
      : {
          target: pool.comptroller,
          signature: "setCollateralFactor(address,uint256,uint256)",
          params: [m.vToken, 0, 0],
          ...chain,
        },
  );
};

// Zero the liquidation threshold of the BNB Core markets that also live in an e-mode pool.
export const generateCoreEmodeCommands = (): Command[] =>
  CORE_EMODE.map(m => ({
    target: BNB_CORE.comptroller,
    signature: "setCollateralFactor(uint96,address,uint256,uint256)",
    params: [m.poolId, m.vToken, 0, 0],
  }));

// PT-sUSDE-26JUN2025 (BNB Core, base pool) was omitted from the Phase-4 scope, so it never received
// Step 1 (RF → 100%, push-out IRM, supply cap → 0). It gets the full deprecation here — Step 1 plus
// Step 2 (CF/LT → 0) — while staying listed so the remaining suppliers can still redeem.
export const PT_SUSDE = {
  comptroller: BNB_CORE.comptroller,
  vToken: "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866",
  poolId: 0,
  irm: PUSHOUT_IRM.bscCore,
};

// ACM permissions the PT-sUSDE deprecation needs on top of the batch's existing 4-arg CF grant:
// the vToken-scoped RF and IRM setters and the comptroller supply-cap setter (legacy signatures).
export const PT_SUSDE_EXTRA_PERMS: { target: string; signature: string }[] = [
  { target: PT_SUSDE.vToken, signature: "_setReserveFactor(uint256)" },
  { target: PT_SUSDE.vToken, signature: "_setInterestRateModel(address)" },
  { target: PT_SUSDE.comptroller, signature: "_setMarketSupplyCaps(address[],uint256[])" },
];

// Full deprecation for PT-sUSDE: RF → 100%, push-out IRM, supply cap → 0, CF/LT → 0.
export const generatePtSusdeCommands = (): Command[] => [
  { target: PT_SUSDE.vToken, signature: "_setReserveFactor(uint256)", params: [RF_FULL] },
  { target: PT_SUSDE.vToken, signature: "_setInterestRateModel(address)", params: [PT_SUSDE.irm] },
  {
    target: PT_SUSDE.comptroller,
    signature: "_setMarketSupplyCaps(address[],uint256[])",
    params: [[PT_SUSDE.vToken], [0]],
  },
  {
    target: PT_SUSDE.comptroller,
    signature: "setCollateralFactor(uint96,address,uint256,uint256)",
    params: [PT_SUSDE.poolId, PT_SUSDE.vToken, 0, 0],
  },
];
