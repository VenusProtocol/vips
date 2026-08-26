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

const buildDisableCmd = (ctx: ChainContext, m: MarketEntry): Command => ({
  target: ctx.deviationSentinel,
  signature: "setTokenMonitoringEnabled(address,bool)",
  params: [m.token, false],
  dstChainId: ctx.dstChainId,
});

const commandsForMarket = (ctx: ChainContext, m: MarketEntry): Command[] => {
  switch (m.action) {
    case "skip":
      return [];
    case "retune":
      return [buildSetTokenConfigCmd(ctx, m, m.targetPct, true)];
    case "promote":
    case "poolSwap": {
      const cmds = [buildPoolConfigCmd(ctx, m)];
      if (!m.skipOracleRepoint) cmds.push(buildSentinelOracleCmd(ctx, m));
      cmds.push(buildSetTokenConfigCmd(ctx, m, m.targetPct, true));
      return cmds;
    }
    case "poolOnly": {
      // Re-register the pool + (optionally) repoint the SentinelOracle but leave the
      // DeviationSentinel threshold untouched (these markets are not in the doc's threshold tables).
      const cmds = [buildPoolConfigCmd(ctx, m)];
      if (!m.skipOracleRepoint) cmds.push(buildSentinelOracleCmd(ctx, m));
      return cmds;
    }
    case "disable":
      return [buildDisableCmd(ctx, m)];
    default:
      return assertNever(m.action, `${ctx.name}: ${m.symbol} has unknown action`);
  }
};

const buildChainCommands = (ctx: ChainContext): Command[] => ctx.markets.flatMap(m => commandsForMarket(ctx, m));

export const buildAllCommands = (): Command[] => CHAINS.flatMap(buildChainCommands);

export const vip658 = () => {
  const meta = {
    version: "v2",
    title: "VIP-658 [BNB Chain, Ethereum, Arbitrum One, Base] DeviationSentinel 2026-08 Parameter Adjustment",
    description: `#### Summary

Retunes **DeviationSentinel** thresholds to a unified **5%** across BNB Chain, Ethereum, Arbitrum One and Base, repoints several markets' price-source pools to deeper DEX pools, and disables monitoring for BSC TUSD. No new contracts are deployed and no ACM grants change — every setter used was permissioned in VIP-590 (BSC) / VIP-616 (remote chains), and the Curve/Uniswap targets are compatible with the already-deployed CurveOracle / UniswapOracle (as in VIP-624).

#### Scope

**BNB Chain — 14 commands**

- Retune to **5%**: U, USD1, lisUSD (1% → 5%); SolvBTC, slisBNB, wBETH (3% → 5%); FDUSD (10% → 5%)
- Pool move + retune to **5%**: USDC (1% → 5%) and USDT (3% → 5%) → PancakeSwap V3 USDT/USDC 0.05% (0x4f31Fa980a675570939B737Ebdde0471a4Be40Eb)
- Configuration removals: **TUSD** — disable monitoring (setTokenMonitoringEnabled(TUSD, false)); **DAI** — already disabled on-chain (VIP-644), no command emitted

**Ethereum — 26 commands**

- Retune to **5%**: USDe (1% → 5%); USDS (10% → 5%)
- Pool move + retune to **5%**: USDC / USDT / DAI → Curve 3pool (0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7); crvUSD → Curve USDT/crvUSD (0x390f3595bCa2Df7d23783dFd126427CCeb997BF4); sUSDe → Curve crvUSD/sUSDe (0x57064F49Ad7123C92560882a45518374ad982e85); sUSDS → Curve sUSDe/sUSDS (0x3CEf1AFC0E8324b57293a6E7cE663781bbEFBB79); WBTC → Uniswap V3 USDT/WBTC 0.30% (0x9Db9e0e53058C89e5B94e29621a205198648425B); LBTC → Uniswap V3 WBTC/LBTC 0.01% (0x0b599ebf4E05af48b56D38E2DDe520570C366460); tBTC → Curve WBTC/tBTC (0xB7ECB2AA52AA64a717180E030241bC75Cd946726)
- Pool move only (threshold left at 10%): **WETH** → Uniswap V3 WETH/USDT 0.30% (0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36)

_Note: for crvUSD, sUSDS, WBTC, LBTC and WETH the SentinelOracle already routes to the target DEX oracle (curve→curve / uniswap→uniswap), so only the pool binding (and, where applicable, the threshold) is updated — the redundant SentinelOracle repoint is elided, which also keeps the single cross-chain LayerZero message within its payload-size cap._

**Arbitrum One — 7 commands**

- Retune to **5%**: USDC, USD₮0 (1% → 5%)
- Pool move + retune to **5%**: WBTC (3% → 5%) → Uniswap V3 WBTC/WETH 0.05% (0x2f5e87C9312fa29aed5c179E456625D79015299c)
- Pool move only (threshold unchanged): **ARB** → Uniswap V3 ARB/WETH 0.05% (0xC6F780497A95e246EB9449f5e4770916DCd6396A)

**Base — 3 commands**

- Retune to **5%**: USDC (1% → 5%); cbBTC, wstETH (3% → 5%). No pool changes.

#### Notes

- **Shared-pool co-trip:** moving BSC USDC + USDT onto the same PancakeSwap USDT/USDC pool, and Ethereum USDC / USDT / DAI onto the Curve 3pool, means those stables share a price source and can trip together (opposite directions) on a shared-pool deviation. This is the same design property documented in VIP-624 for pre-existing shared pools.
- **FDUSD (BSC) and USDS (Ethereum)** were previously kept at 10% (thin-pool exceptions); this VIP retunes both to 5% per the recommendation.
- **WETH (Ethereum) and ARB (Arbitrum One)** get a pool move but keep their existing thresholds — they are not in the recommendation's threshold tables.
- **TUSD (BSC)** monitoring is disabled; its stored config is left intact (the DeviationSentinel has no removal function, and setTokenConfig rejects deviation = 0). A disabled market can neither be tripped nor report a deviation. **DAI (BSC)** was already disabled by VIP-644, so no command is emitted for it.

#### References

- [VIP-590 (BSC DeviationSentinel initial wire)](https://app.venus.io/#/governance/proposal/590?chainId=56)
- [VIP-616 (Ethereum / Arbitrum / Base initial wire)](https://app.venus.io/#/governance/proposal/616?chainId=56)
- [VIP-624 (DeviationSentinel Parameter Recommendation)](https://app.venus.io/#/governance/proposal/624?chainId=56)
- [VIP-644 (BSC DAI monitoring disabled)](https://app.venus.io/#/governance/proposal/644?chainId=56)
- [DeviationSentinel contract source](https://github.com/VenusProtocol/venus-periphery/tree/develop/contracts/DeviationSentinel)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(buildAllCommands(), meta, ProposalType.REGULAR);
};

export default vip658;
