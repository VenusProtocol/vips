import { Command } from "src/types";

import {
  ARBITRUM_LIQUID_STAKED_ETH,
  BASE_CORE,
  BNB_BTC,
  BNB_CORE,
  BNB_DEFI,
  BNB_GAMEFI,
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_MEME,
  BNB_STABLECOINS,
  BNB_TRON,
  ETH_CORE,
  ETH_CURVE,
  ETH_LIQUID_STAKED_ETH,
  Mkt,
  OPBNB,
  OPTIMISM,
  PoolDef,
  UNICHAIN,
  ZKSYNC_CORE,
} from "../vip-634/phase4Markets";

// ─────────────────────────────────────────────────────────────────────────────
// Phase-4 market deprecation — Step 2 of 2: set the collateral factor AND the
// liquidation threshold of every in-scope market to zero, fully removing these
// assets as collateral and completing the wind-down begun in VIP-634 / VIP-635.
//
// The collateral factor is already zero on every market (confirmed on-chain), so
// the operative change is the liquidation threshold. Each market is zeroed with a
// single setCollateralFactor call that writes both parameters at once:
//   - isolated pools:            setCollateralFactor(address,uint256,uint256)
//   - BNB Core (diamond, pools): setCollateralFactor(uint96,address,uint256,uint256)
//
// The 87 markets in scope are the same ones covered by Step 1. The four Ethereum
// Core yv* markets that Step 1 dropped from its command list (to fit the propose
// transaction under the EIP-7825 gas cap) are folded back in here, since Step 2's
// single call per market leaves ample room in the Ethereum LayerZero message.
// ─────────────────────────────────────────────────────────────────────────────

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

// The work is split across two VIPs, mirroring the Step 1 split (VIP-634 / VIP-635),
// because a single propose transaction bundling all 87 markets exceeds the BNB Chain
// per-transaction gas cap (EIP-7825, 16.78M). The division of pools is identical to
// Step 1, so each part covers the same markets its Step 1 counterpart did.
//
// Part 1 (VIP-645): BNB Core + BNB BTC / DeFi / GameFi isolated pools, and the opBNB,
//   Optimism, Unichain and Ethereum Core deployments.
// Part 2 (VIP-646): BNB Meme / Liquid Staked BNB / Liquid Staked ETH / Stablecoins /
//   Tron isolated pools, the Ethereum Curve and Liquid Staked ETH pools, and the
//   Arbitrum, Base and zkSync Era deployments.
export const PART1_POOLS: PoolDef[] = [
  BNB_CORE,
  BNB_BTC,
  BNB_DEFI,
  BNB_GAMEFI,
  OPBNB,
  OPTIMISM,
  UNICHAIN,
  ETH_CORE_STEP2,
];

export const PART2_POOLS: PoolDef[] = [
  BNB_MEME,
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_STABLECOINS,
  BNB_TRON,
  ETH_CURVE,
  ETH_LIQUID_STAKED_ETH,
  ARBITRUM_LIQUID_STAKED_ETH,
  BASE_CORE,
  ZKSYNC_CORE,
];

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
