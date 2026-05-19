import { Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as ARBITRUM from "./addresses/arbitrumone";
import * as BASE from "./addresses/basemainnet";
import * as BSC from "./addresses/bscmainnet";
import * as ETHEREUM from "./addresses/ethereum";
import type { MarketEntry } from "./config";

// ──────────────────────────────────────────────────────────────────────────
// Per-chain context — bundles the addresses + market table + LayerZero dest.
// BSC commands have no `dstChainId` (governance hub); remote chains route via
// OmnichainProposalSender → OmnichainGovernanceExecutor on the destination.
// Exported so simulations can iterate the same per-chain spec without duplication.
// ──────────────────────────────────────────────────────────────────────────

export interface ChainContext {
  name: string;
  deviationSentinel: string;
  sentinelOracle: string;
  uniswapOracle: string;
  curveOracle?: string;
  aerodromeOracle?: string;
  markets: MarketEntry[];
  dstChainId?: LzChainId; // omitted for BSC
}

export const BSC_CTX: ChainContext = {
  name: "BSC",
  deviationSentinel: BSC.DEVIATION_SENTINEL,
  sentinelOracle: BSC.SENTINEL_ORACLE,
  uniswapOracle: BSC.PANCAKESWAP_ORACLE,
  markets: BSC.BSC_MARKETS,
};

export const ETHEREUM_CTX: ChainContext = {
  name: "Ethereum",
  deviationSentinel: ETHEREUM.DEVIATION_SENTINEL,
  sentinelOracle: ETHEREUM.SENTINEL_ORACLE,
  uniswapOracle: ETHEREUM.UNISWAP_ORACLE,
  curveOracle: ETHEREUM.CURVE_ORACLE,
  markets: ETHEREUM.ETHEREUM_MARKETS,
  dstChainId: LzChainId.ethereum,
};

export const ARBITRUMONE_CTX: ChainContext = {
  name: "Arbitrum One",
  deviationSentinel: ARBITRUM.DEVIATION_SENTINEL,
  sentinelOracle: ARBITRUM.SENTINEL_ORACLE,
  uniswapOracle: ARBITRUM.UNISWAP_ORACLE,
  markets: ARBITRUM.ARBITRUMONE_MARKETS,
  dstChainId: LzChainId.arbitrumone,
};

export const BASEMAINNET_CTX: ChainContext = {
  name: "Base",
  deviationSentinel: BASE.DEVIATION_SENTINEL,
  sentinelOracle: BASE.SENTINEL_ORACLE,
  uniswapOracle: BASE.UNISWAP_ORACLE,
  aerodromeOracle: BASE.AERODROME_ORACLE,
  markets: BASE.BASEMAINNET_MARKETS,
  dstChainId: LzChainId.basemainnet,
};

const CHAINS: ChainContext[] = [BSC_CTX, ETHEREUM_CTX, ARBITRUMONE_CTX, BASEMAINNET_CTX];

// ──────────────────────────────────────────────────────────────────────────
// Command builders. Each MarketEntry expands into 0–3 commands depending on its
// `action` field — see config.ts for action semantics.
// ──────────────────────────────────────────────────────────────────────────

const dexOracleFor = (ctx: ChainContext, m: MarketEntry): string => {
  switch (m.oracleType ?? "uniswap") {
    case "uniswap":
      return ctx.uniswapOracle;
    case "curve":
      if (!ctx.curveOracle) throw new Error(`${ctx.name}: ${m.symbol} requires CurveOracle but none configured`);
      return ctx.curveOracle;
    case "aerodrome":
      if (!ctx.aerodromeOracle)
        throw new Error(`${ctx.name}: ${m.symbol} requires AerodromeSlipstreamOracle but none configured`);
      return ctx.aerodromeOracle;
  }
};

const buildPoolConfigCmd = (ctx: ChainContext, m: MarketEntry): Command => {
  const target = dexOracleFor(ctx, m);
  if (m.oracleType === "curve") {
    if (m.coinIndex === undefined || m.refCoinIndex === undefined || !m.referenceToken || m.assetDecimals === undefined)
      throw new Error(
        `${ctx.name}: ${m.symbol} curve entry missing coinIndex/refCoinIndex/referenceToken/assetDecimals`,
      );
    return {
      target,
      signature: "setPoolConfig(address,address,uint8,uint8,address,uint8)",
      params: [m.token, m.pool, m.coinIndex, m.refCoinIndex, m.referenceToken, m.assetDecimals],
      dstChainId: ctx.dstChainId,
    };
  }
  return {
    target,
    signature: "setPoolConfig(address,address)",
    params: [m.token, m.pool],
    dstChainId: ctx.dstChainId,
  };
};

const buildSentinelOracleCmd = (ctx: ChainContext, m: MarketEntry): Command => ({
  target: ctx.sentinelOracle,
  signature: "setTokenOracleConfig(address,address)",
  params: [m.token, dexOracleFor(ctx, m)],
  dstChainId: ctx.dstChainId,
});

const buildSetTokenConfigCmd = (ctx: ChainContext, m: MarketEntry, pct: number, enabled: boolean): Command => ({
  target: ctx.deviationSentinel,
  signature: "setTokenConfig(address,(uint8,bool))",
  params: [m.token, [pct, enabled]],
  dstChainId: ctx.dstChainId,
});

const commandsForMarket = (ctx: ChainContext, m: MarketEntry): Command[] => {
  switch (m.action) {
    case "skip":
      return [];
    case "retune":
      return [buildSetTokenConfigCmd(ctx, m, m.targetPct, true)];
    case "disable":
      // Single-purpose toggle. The contract reverts setTokenConfig with deviation=0
      // (ZeroDeviation), so we can't zero the threshold here. The stored 10% persists;
      // a future re-enable VIP must call setTokenConfig(token, (newTier, true)) first
      // rather than just flipping enabled back on.
      return [
        {
          target: ctx.deviationSentinel,
          signature: "setTokenMonitoringEnabled(address,bool)",
          params: [m.token, false],
          dstChainId: ctx.dstChainId,
        },
      ];
    case "promote":
    case "poolSwap":
      return [
        buildPoolConfigCmd(ctx, m),
        buildSentinelOracleCmd(ctx, m),
        buildSetTokenConfigCmd(ctx, m, m.targetPct, true),
      ];
  }
};

const buildChainCommands = (ctx: ChainContext): Command[] => ctx.markets.flatMap(m => commandsForMarket(ctx, m));

// ──────────────────────────────────────────────────────────────────────────
// VIP-800
// ──────────────────────────────────────────────────────────────────────────

export const vip800 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain, Ethereum, Arbitrum One, Base] DeviationSentinel Parameter Recommendation",
    description: `#### Summary

This VIP retunes **DeviationSentinel** parameters across BNB Chain, Ethereum, Arbitrum One, and Base — moving from the unified 10% threshold deployed in VIP-590 / VIP-613 (BSC) and VIP-616 (non-BSC) to **tiered thresholds** matched to each asset's intrinsic volatility:

- **1%** — stables (target $1)
- **3%** — wrapped & ratio-fed assets (BTC wrappers, ETH LSTs, BNB LSTs)
- **10%** — volatile majors (unchanged)

It also applies a **$250K pool-TVL gate**: markets whose DEX pool is shallow enough that ~$10K of slot0 manipulation could trip a 1% threshold are disabled until depth improves. No new contracts are deployed and no ACM permissions change — every setter called here was permissioned to the Normal Timelock by VIP-590 (BSC) and VIP-616 (non-BSC).

#### Scope

**BNB Chain** — 14 commands

- Retune 9 markets to tighter tiers: USDC / U / USDT / USD1 / TUSD / lisUSD → **1%**; solvBTC / slisBNB / wBETH → **3%**
- Disable monitoring on 5 deferred markets (TRX, FDUSD, UNI, DAI, XVS) — all sit below the $250K TVL gate. Stored threshold left at 10% (contract forbids zero-threshold configs)
- 4 pending-delist markets (TWT, DOT, FIL, BCH) were never wired by VIP-613 — no on-chain action; tracked separately by the delisting flow
- 11 unchanged 10% markets (WBNB, BTCB, ETH, CAKE, XRP, SOL, LINK, DOGE, XAUM, ADA, LTC) — no commands emitted (VIP-613 already tightened CAKE 20% → 10%)

**Ethereum** — 23 commands

- Retune 8 markets: USDC / USDT / USDe / DAI → **1%**; WBTC / LBTC / eBTC / tBTC → **3%**
- **USDS pool swap**: rebind from UniV3 DAI/USDS ($211K TVL, below gate) to Curve PYUSD/USDS (~$99.7M, ~400× deeper), threshold → 1%. Introduces a PYUSD-pricing dependency (off-peg PYUSD would propagate as a false USDS deviation)
- **Promote crvUSD**, **EIGEN**, **sUSDe**, **sUSDS** (none currently wired — on-chain confirmed via DeviationSentinel.tokenConfigs read returning (0,false) for each): full new wire via UniswapOracle (crvUSD, EIGEN, sUSDe) or CurveOracle (sUSDS). sUSDe and sUSDS inherit a USDT-pricing dependency
- WETH retained at 10%; no command

**Arbitrum One** — 3 commands

- Retune USDC, USD₮0 → **1%**; WBTC → **3%**
- WETH and ARB retained at 10%; no commands

**Base** — 3 commands

- Retune USDC → **1%**; cbBTC, wstETH → **3%** (cbBTC and wstETH route through AerodromeSlipstreamOracle, wired by VIP-616)
- WETH retained at 10%; no command
- Note: the WETH/USDC pool 0x6c56…1372 was independently verified on-chain as genuine Uniswap V3 (7-tuple slot0, factory = 0x3312…6FDfD). The "Aerodrome Slipstream source correction" hypothesised in the parameter spec was inaccurate; VIP-616 wiring via UniswapOracle is correct, no rewire needed

**zkSync** — out of scope. VIP-616 didn't wire zkSync; it stays out of Step 1 until SyncSwap V3 / PCS V3 depth crosses the $250K gate.

#### Disable semantics

Disabled markets use the single-purpose \`setTokenMonitoringEnabled(token, false)\` toggle. (The contract reverts \`setTokenConfig\` with deviation=0 via the \`ZeroDeviation()\` error — so a fail-safe zero-threshold disable isn't on the table.) The stored 10% threshold persists. A future re-enable VIP must call \`setTokenConfig(token, (newTier, true))\` before flipping monitoring back on, otherwise the market would resume at the old 10% policy rather than the appropriate tier.

#### Quote-asset dependency note

Three Ethereum markets (USDS, sUSDe, sUSDS) carry a non-USD reference asset on their DEX side (PYUSD, USDT, USDT respectively). The keeper should cross-check the reference asset's USD peg against an independent feed before firing — if the reference is the off-peg party, route the response through SentinelOracle.setDirectPrice rather than tightening the wrapper market.

#### References

- [Task spec](../../../vips/vip-800/task.md) (will be removed once VIP-800 is on-chain; full data preserved in addresses/<chain>.ts)
- [VIP-590 (BSC initial wire)](https://app.venus.io/governance/proposal/590)
- [VIP-610 (BSC EBrakeV2 wire)](https://app.venus.io/governance/proposal/610)
- [VIP-613 (BSC market expansion, 25 markets at 10%)](https://app.venus.io/governance/proposal/613)
- [VIP-616 (Ethereum / Arbitrum / Base initial wire)](https://app.venus.io/governance/proposal/616)
- [DeviationSentinel contract source](../../../../venus-periphery/contracts/DeviationSentinel/DeviationSentinel.sol)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  const commands: Command[] = CHAINS.flatMap(buildChainCommands);

  return makeProposal(commands, meta, ProposalType.REGULAR);
};

export default vip800;
