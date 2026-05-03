import { ZERO_ADDRESS } from "src/networkAddresses";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUMONE_CONFIG } from "../vip-616/addresses/arbitrumone";
import { BASEMAINNET_CONFIG } from "../vip-616/addresses/basemainnet";
import { ETHEREUM_CONFIG } from "../vip-616/addresses/ethereum";
import {
  ChainConfig,
  GOVERNANCE_EBRAKE_PERMS_IL,
  MonitoredMarket,
  governanceAccounts,
  grant,
} from "../vip-616/bscmainnet";

const NETWORKS: ChainConfig[] = [ETHEREUM_CONFIG, ARBITRUMONE_CONFIG, BASEMAINNET_CONFIG];

// Resolve the DEX oracle for a market based on its `oracleType`. Defaults to UniswapOracle.
// Misconfiguration (e.g. oracleType="curve" on a chain without a CurveOracle deployment)
// surfaces here at proposal-build time rather than at on-chain execution.
const resolveDexOracle = (cfg: ChainConfig, market: MonitoredMarket): string => {
  switch (market.oracleType ?? "uniswap") {
    case "uniswap":
      return cfg.uniswapOracle;
    case "curve":
      if (!cfg.curveOracle) throw new Error(`${cfg.name}: ${market.symbol} requires curveOracle in ChainConfig`);
      return cfg.curveOracle;
    case "aerodrome":
      if (!cfg.aerodromeOracle)
        throw new Error(`${cfg.name}: ${market.symbol} requires aerodromeOracle in ChainConfig`);
      return cfg.aerodromeOracle;
  }
};

// Build the DEX-side `setPoolConfig` call for a market. UniswapOracle and AerodromeSlipstreamOracle
// share the (token, pool) signature; CurveOracle takes additional (coinIndex, refCoinIndex,
// referenceToken, assetDecimals) fields for its get_dy()-based pricing scheme.
const buildSetPoolCommand = (cfg: ChainConfig, market: MonitoredMarket, dstChainId: number): Command => {
  const oracle = resolveDexOracle(cfg, market);
  if ((market.oracleType ?? "uniswap") === "curve") {
    if (
      market.coinIndex === undefined ||
      market.refCoinIndex === undefined ||
      !market.referenceToken ||
      market.assetDecimals === undefined
    ) {
      throw new Error(
        `${cfg.name}: ${market.symbol} (curve) requires coinIndex + refCoinIndex + referenceToken + assetDecimals`,
      );
    }
    return {
      target: oracle,
      signature: "setPoolConfig(address,address,uint8,uint8,address,uint8)",
      params: [
        market.token,
        market.pool,
        market.coinIndex,
        market.refCoinIndex,
        market.referenceToken,
        market.assetDecimals,
      ],
      dstChainId,
    };
  }
  return {
    target: oracle,
    signature: "setPoolConfig(address,address)",
    params: [market.token, market.pool],
    dstChainId,
  };
};

// VIP-617 (Sub-B): governance EBrake action grants + per-market wiring.
// Per-chain command count: gov ebrake action 32 + 3 × eligible markets.
//   - Ethereum: 32 + 30 (10 mkts: 9 Uniswap + 1 Curve) = 62
//   - Arbitrum: 32 + 15 ( 5 mkts: 5 Uniswap)           = 47
//   - Base:     32 + 12 ( 4 mkts: 2 Uniswap + 2 Aero)  = 44
// All under their respective block gas limits with the LayerZero adapter param.
const buildChainCommandsB = (cfg: ChainConfig): Command[] => {
  const { acm, dstChainId } = cfg;

  const commands: Command[] = [
    // 1. Grant Guardian + governance Timelocks the IL-supported EBrake action functions
    ...governanceAccounts(cfg).flatMap(account =>
      GOVERNANCE_EBRAKE_PERMS_IL.map(sig => grant(acm, cfg.eBrake, sig, account, dstChainId)),
    ),
  ];

  // 2. Per-market wiring. For each eligible market, configure the DEX pool on the
  //    chain-appropriate DEX oracle (Uniswap / Curve / Aerodrome Slipstream), point the
  //    SentinelOracle at that oracle for the token, then enable deviation monitoring on
  //    the DeviationSentinel. Markets with a ZERO_ADDRESS token or pool are skipped
  //    (placeholder safety).
  for (const market of cfg.monitoredMarkets) {
    if (market.token === ZERO_ADDRESS || market.pool === ZERO_ADDRESS) continue;
    const dexOracle = resolveDexOracle(cfg, market);
    commands.push(
      buildSetPoolCommand(cfg, market, dstChainId),
      {
        target: cfg.sentinelOracle,
        signature: "setTokenOracleConfig(address,address)",
        params: [market.token, dexOracle],
        dstChainId,
      },
      {
        target: cfg.deviationSentinel,
        signature: "setTokenConfig(address,(uint8,bool))",
        params: [market.token, [market.deviationPercent, true]],
        dstChainId,
      },
    );
  }

  return commands;
};

export const vip617 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-617 [Ethereum, Arbitrum One, Base] Configure DeviationSentinel + EBrakeV2 — Governance Actions & Market Wiring (2/2)",
    description: `#### Context

With ownership and permissions in place from VIP-616, this VIP grants governance the ability to manually invoke EBrake actions and turns on deviation monitoring for the 19 eligible markets at a unified 10% threshold.

#### Per-chain Actions

For each chain, the VIP performs the following 2 blocks of work:

1. **Grant the 8 IL-supported EBrake action perms** to Guardian + 3 Timelocks (same set Multisig Pauser receives in VIP-616 step 6).
2. **For each monitored market** — 3 calls per market:
    - Bind the underlying token to its DEX pool on the appropriate DEX oracle
    - Route SentinelOracle to that DEX oracle for the token
    - Enable DeviationSentinel monitoring at the 10% threshold

#### DEX oracles routed

- **Uniswap V3** (UniswapOracle) — default, covers most markets on all 3 chains
- **Curve** (CurveOracle) — Ethereum only, for the eBTC/WBTC StableSwap-NG pool
- **Aerodrome Slipstream** (AerodromeSlipstreamOracle) — Base only, for cbBTC + wstETH

#### References

- [VIP-616 (Bootstrap & Permissions)](https://app.venus.io/governance/proposal/616)
- [VIP-590 (BSC)](https://app.venus.io/governance/proposal/590)
- [VIP-610 (BSC)](https://app.venus.io/governance/proposal/610)
- [Original Proposal: Emergency Brake — Price Deviation Safeguard Mechanism](https://community.venus.io/t/proposal-emergency-brake-price-deviation-safeguard-mechanism/5668)
- [GitHub PR](https://github.com/VenusProtocol/vips/pull/702)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(NETWORKS.flatMap(buildChainCommandsB), meta, ProposalType.REGULAR);
};

export default vip617;
