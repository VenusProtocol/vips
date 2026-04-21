import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { DEVIATION_SENTINEL, DEVIATION_THRESHOLD, MARKETS, PANCAKESWAP_ORACLE, SENTINEL_ORACLE } from "./config";

export const vip666 = () => {
  const meta = {
    version: "v2",
    title: "VIP-666 [BNB Chain] Expand DeviationSentinel coverage to 29 Core Pool markets",
    description: `## Summary

This VIP expands **DeviationSentinel** oracle-deviation monitoring on BNB Chain mainnet from a single market (CAKE) to **29 Core Pool markets**, applying a unified **10%** deviation threshold and routing every market through the existing **PancakeSwapOracle** configured in [VIP-590](https://app.venus.io/governance/proposal/590) and re-wired through EBrakeV2 in [VIP-610](https://app.venus.io/governance/proposal/610).

## What This VIP Does

For each of the 29 markets the VIP performs three configuration calls:

1. **PancakeSwapOracle.setPoolConfig(token, pool)** — bind the underlying token to its PancakeSwap V3 pool.
2. **SentinelOracle.setTokenOracleConfig(token, PancakeSwapOracle)** — route SentinelOracle price queries for the token to PancakeSwapOracle.
3. **DeviationSentinel.setTokenConfig(token, (10, true))** — set a 10% deviation threshold and enable monitoring.

All three permissions were granted to the Normal Timelock in VIP-590; no additional permission changes are required.

The full 29-market list with pool addresses, TVL and volume is in the VIP pull request and the accompanying spec.

### Notes

- **CAKE re-configuration**: VIP-590 bound CAKE to the CAKE/BUSD pool at a 20% threshold. This VIP repoints CAKE to \`0x133b3d95bad5405d14d53473671200e9342896bf\` (CAKE/WBNB 0.25%) and tightens the threshold to 10%.
- **Shared pool — USDT and WBNB**: both markets bind to the same USDT/WBNB pool \`0x172fcd41e0913e95784454622d1c3724f546f849\`. \`PancakeSwapOracle.tokenPools\` is keyed by the underlying token, so each market gets an independent entry and its own circuit breaker.
- **Pegged-asset matching**: solvBTC/BTCB, wBETH/ETH and slisBNB/WBNB pools are chosen so the DEX quote asset matches the ResilientOracle reference token, isolating the peg ratio from base-asset price noise.

#### References

- [VIP Pull Request](https://github.com/VenusProtocol/vips/pull/666)
- [VIP-590 — Initial DeviationSentinel deployment](https://app.venus.io/governance/proposal/590)
- [VIP-610 — EBrakeV2 wiring](https://app.venus.io/governance/proposal/610)
- [DeviationSentinel](https://bscscan.com/address/${DEVIATION_SENTINEL})
- [SentinelOracle](https://bscscan.com/address/${SENTINEL_ORACLE})
- [PancakeSwapOracle](https://bscscan.com/address/${PANCAKESWAP_ORACLE})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Bind each token to its PancakeSwap V3 pool on PancakeSwapOracle
      ...MARKETS.map(({ token, pool }) => ({
        target: PANCAKESWAP_ORACLE,
        signature: "setPoolConfig(address,address)",
        params: [token, pool],
      })),

      // 2. Route SentinelOracle queries for each token to PancakeSwapOracle
      //    (idempotent for CAKE — already wired in VIP-590)
      ...MARKETS.map(({ token }) => ({
        target: SENTINEL_ORACLE,
        signature: "setTokenOracleConfig(address,address)",
        params: [token, PANCAKESWAP_ORACLE],
      })),

      // 3. Set unified 10% deviation threshold and enable monitoring on DeviationSentinel
      //    (overwrites CAKE's prior 20% configuration from VIP-590)
      ...MARKETS.map(({ token }) => ({
        target: DEVIATION_SENTINEL,
        signature: "setTokenConfig(address,(uint8,bool))",
        params: [token, [DEVIATION_THRESHOLD, true]],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip666;
