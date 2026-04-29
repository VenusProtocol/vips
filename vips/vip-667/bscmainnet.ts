import { ZERO_ADDRESS } from "src/networkAddresses";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUMONE_CONFIG } from "../vip-666/addresses/arbitrumone";
import { BASEMAINNET_CONFIG } from "../vip-666/addresses/basemainnet";
import { ETHEREUM_CONFIG } from "../vip-666/addresses/ethereum";
import { ChainConfig, GOVERNANCE_EBRAKE_PERMS_IL, governanceAccounts, grant } from "../vip-666/bscmainnet";

const NETWORKS: ChainConfig[] = [ETHEREUM_CONFIG, ARBITRUMONE_CONFIG, BASEMAINNET_CONFIG];

// VIP-667 (Sub-B): governance EBrake action grants + per-market wiring.
// Per-chain command count: gov ebrake action 32 + 3 × eligible markets.
//   - Ethereum: 32 + 27 (9 mkts) = 59
//   - Arbitrum: 32 + 15 (5 mkts) = 47
//   - Base:     32 +  6 (2 mkts) = 38
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
  //    UniswapOracle, point the SentinelOracle at the UniswapOracle for that token,
  //    then enable deviation monitoring on the DeviationSentinel. Markets with a
  //    ZERO_ADDRESS token or pool are skipped (placeholder safety).
  for (const market of cfg.monitoredMarkets) {
    if (market.token === ZERO_ADDRESS || market.pool === ZERO_ADDRESS) continue;
    commands.push(
      {
        target: cfg.uniswapOracle,
        signature: "setPoolConfig(address,address)",
        params: [market.token, market.pool],
        dstChainId,
      },
      {
        target: cfg.sentinelOracle,
        signature: "setTokenOracleConfig(address,address)",
        params: [market.token, cfg.uniswapOracle],
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
- Configure deviation monitoring (10% threshold) for the eligible Core Pool markets on each chain — 9 on Ethereum, 5 on Arbitrum One, 2 on Base

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
