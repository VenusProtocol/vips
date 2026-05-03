import { ZERO_ADDRESS } from "src/networkAddresses";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUMONE_CONFIG } from "../vip-666/addresses/arbitrumone";
import { BASEMAINNET_CONFIG } from "../vip-666/addresses/basemainnet";
import { ETHEREUM_CONFIG } from "../vip-666/addresses/ethereum";
import {
  ChainConfig,
  GOVERNANCE_EBRAKE_PERMS_IL,
  MonitoredMarket,
  governanceAccounts,
  grant,
} from "../vip-666/bscmainnet";

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

// VIP-667 (Sub-B): governance EBrake action grants + per-market wiring.
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

export const vip667 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-667 [Ethereum, Arbitrum One, Base] Configure DeviationSentinel + EBrakeV2 — Governance Actions & Market Wiring (2/2)",
    description: `#### Description

This is the second of two VIPs configuring the **DeviationSentinel** + **EBrakeV2** Emergency Brake stack on **Ethereum**, **Arbitrum One**, and **Base**. It depends on VIP-666 (Bootstrap & Permissions) being executed first.

Splitting the configuration across two VIPs keeps each per-chain payload under the destination chain's block gas limit. VIP-666 covers ownership, admin permissions, reset / sentinel → ebrake / ebrake → comptroller / multisig grants, and trusted-keeper whitelisting. This VIP covers governance EBrake action permissions and per-market deviation wiring.

Because EBrake on these chains uses \`isIsolatedPool=true\`, only the IL-supported subset of action functions is granted (Diamond-only functions revert on IL comptrollers).

#### Summary

If approved, this VIP will, for each of Ethereum, Arbitrum One, and Base:

- Grant **Guardian** and governance **Timelocks** the 8 IL-supported EBrake action functions
- Configure deviation monitoring (10% threshold) for the eligible Core Pool markets on each chain — 10 on Ethereum (9 Uniswap V3 + 1 Curve / eBTC), 5 on Arbitrum One (Uniswap V3), 4 on Base (2 Uniswap V3 + 2 Aerodrome Slipstream / cbBTC + wstETH)

**Permission event summary**: 96 PermissionGranted (32 per chain × 3 chains), 0 PermissionRevoked

#### References

- [VIP-666 (Bootstrap & Permissions)](https://app.venus.io/governance/proposal/666)
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

export default vip667;
