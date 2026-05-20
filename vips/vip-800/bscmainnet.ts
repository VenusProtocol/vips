import { Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as ARBITRUM from "./addresses/arbitrumone";
import * as BASE from "./addresses/basemainnet";
import * as BSC from "./addresses/bscmainnet";
import * as ETHEREUM from "./addresses/ethereum";
import { ChainContext, MarketEntry } from "./config";

// ──────────────────────────────────────────────────────────────────────────
// Per-chain contexts
// ──────────────────────────────────────────────────────────────────────────

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

const CHAINS: readonly ChainContext[] = [BSC_CTX, ETHEREUM_CTX, ARBITRUMONE_CTX, BASEMAINNET_CTX];

// ──────────────────────────────────────────────────────────────────────────
// Command builders
// Each MarketEntry expands to 0–3 commands depending on its `action`.
// ──────────────────────────────────────────────────────────────────────────

const assertNever = (x: never, message: string): never => {
  throw new Error(`${message}: ${JSON.stringify(x)}`);
};

const dexOracleFor = (ctx: ChainContext, m: MarketEntry): string => {
  const t = m.oracleType ?? "uniswap";
  switch (t) {
    case "uniswap":
      return ctx.uniswapOracle;
    case "curve":
      if (!ctx.curveOracle) throw new Error(`${ctx.name}: ${m.symbol} requires CurveOracle but none configured`);
      return ctx.curveOracle;
    case "aerodrome":
      if (!ctx.aerodromeOracle)
        throw new Error(`${ctx.name}: ${m.symbol} requires AerodromeSlipstreamOracle but none configured`);
      return ctx.aerodromeOracle;
    default:
      return assertNever(t, `${ctx.name}: ${m.symbol} has unknown oracleType`);
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
    case "promote":
    case "poolSwap":
      return [
        buildPoolConfigCmd(ctx, m),
        buildSentinelOracleCmd(ctx, m),
        buildSetTokenConfigCmd(ctx, m, m.targetPct, true),
      ];
    default:
      return assertNever(m.action, `${ctx.name}: ${m.symbol} has unknown action`);
  }
};

const buildChainCommands = (ctx: ChainContext): Command[] => ctx.markets.flatMap(m => commandsForMarket(ctx, m));

// Exposed for the simulation suite so tests can assert against the same shape
// the proposal builder consumes (e.g. total-command-count assertions per chain).
export const buildAllCommands = (): Command[] => CHAINS.flatMap(buildChainCommands);

// ──────────────────────────────────────────────────────────────────────────
// VIP-800
// ──────────────────────────────────────────────────────────────────────────

export const vip800 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain, Ethereum, Arbitrum One, Base] DeviationSentinel Parameter Recommendation",
    description: `#### Summary

Retunes **DeviationSentinel** thresholds from a uniform 10% (set in VIP-590 / VIP-613 on BSC and VIP-616 on Ethereum / Arbitrum / Base) to volatility-matched tiers, and wires three previously-unmonitored BSC markets (TWT, BCH, AAVE) at 10%.

| Tier | Threshold | Applies to |
| --- | --- | --- |
| Stable | **1%** | USDC, USDT, USDe, DAI, USD1, TUSD, lisUSD, U, USD₮0, crvUSD, USDS, sUSDe, sUSDS |
| Wrapped / ratio-fed | **3%** | WBTC, LBTC, eBTC, tBTC, cbBTC, solvBTC, wstETH, wBETH, slisBNB |
| Volatile | **10%** | WETH, WBNB, BTCB, ETH, CAKE, XRP, SOL, LINK, DOGE, XAUM, ADA, LTC, ARB, TWT, BCH, AAVE |

No new contracts are deployed and no ACM grants change — every setter used was permissioned in VIP-590 (BSC) or VIP-616 (remote chains).

#### Scope

**BNB Chain — 18 commands**

- Retune to **1%**: USDC, U, USDT, USD1, TUSD, lisUSD
- Retune to **3%**: solvBTC, slisBNB, wBETH
- Promote (new wire at 10%): TWT, BCH, AAVE

**Ethereum — 20 commands**

- Retune to **1%**: USDC, USDT, USDe, DAI
- Retune to **3%**: WBTC, LBTC, eBTC, tBTC
- USDS pool swap: UniV3 DAI/USDS → Curve PYUSD/USDS (~400× deeper), threshold **1%**
- Promote (new wire): crvUSD → **1%**, sUSDe → **1%**, sUSDS → **1%**

**Arbitrum One — 3 commands**

- Retune to **1%**: USDC, USD₮0
- Retune to **3%**: WBTC

**Base — 3 commands**

- Retune to **1%**: USDC
- Retune to **3%**: cbBTC, wstETH (routed via AerodromeSlipstreamOracle)

#### Notes

- **Thin BSC pools** (TRX, FDUSD, UNI, DAI, XVS) stay enabled at 10% with no on-chain change — false-positive risk on shallow pools is preferred to leaving these markets unmonitored.
- **Co-trip pools** (shared between markets at different tiers): USDT (1%) / WBNB (10%) on BSC pool \`0x172f…f849\`; WETH (10%) / USDC (1%) on Base pool \`0x6c56…1372\`. A deviation event on the shared pool trips the stable first.
- **Quote-asset dependency** on Ethereum: USDS, sUSDe, sUSDS price against PYUSD / USDT / USDT respectively. If the reference asset is the off-peg party, the keeper should respond via \`SentinelOracle.setDirectPrice\` rather than tightening the wrapper market.
- **zkSync** stays out of scope until pool depth crosses the $250K gate.

#### References

- [VIP-590 (BSC initial wire)](https://venus.io/governance#/governance/proposal/590?chainId=56)
- [VIP-610 (BSC EBrakeV2 wire)](https://venus.io/governance#/governance/proposal/610?chainId=56)
- [VIP-613 (BSC market expansion)](https://venus.io/governance#/governance/proposal/613?chainId=56)
- [VIP-616 (Ethereum / Arbitrum / Base initial wire)](https://venus.io/governance#/governance/proposal/616?chainId=56)
- [DeviationSentinel contract source](https://github.com/VenusProtocol/venus-periphery/tree/develop/contracts/DeviationSentinel)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(buildAllCommands(), meta, ProposalType.REGULAR);
};

export default vip800;
