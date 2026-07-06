import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PART2_POOLS, generateStep2Commands } from "../vip-645/deprecationStep2";

const meta = {
  version: "v2",
  title: "VIP-646 Market Deprecation Phase 4 (Step 2, Part 2 of 2)",
  description: `#### Summary

This proposal is the second of two VIPs implementing Step 2 — the final step — of the wind-down of deprecated and off-boarded markets across BNB Chain, opBNB, Optimism, Unichain, Ethereum, Base, Arbitrum and zkSync Era. Step 1 ([VIP-634](https://community.venus.io/t/deprecate-venus-core-on-opbnb-optimism-unichain-isolated-pools/5760) and [VIP-635](https://community.venus.io/t/may-2026-risk-parameter-update-asset-off-boarding/5785)) set reserve factors to 100%, repointed each market to a deprecation interest rate model, and closed the residual supply / borrow cap and collateral-factor gaps. Step 2 sets the liquidation threshold of every market in scope to zero, fully removing these assets as collateral.

As in Step 1, the work is split across two VIPs to respect the BNB Chain per-transaction gas cap. Part 1 (VIP-645) covers the BNB Core pool, the BNB BTC / DeFi / GameFi isolated pools, and the opBNB, Optimism, Unichain and Ethereum Core deployments. Part 2 covers the BNB Meme / Liquid Staked BNB / Liquid Staked ETH / Stablecoins / Tron isolated pools, the Ethereum Curve and Ethereum Liquid Staked ETH pools, and the Arbitrum, Base and zkSync Era deployments.

#### Background

Step 1 has executed on-chain, and the two-week notice period announced at that time — during which any user holding a position in these markets was encouraged to repay borrows or withdraw collateral — has now elapsed. The collateral factor of every market in scope is already zero, so no additional borrowing power can be drawn against these assets. What remains is the liquidation threshold, which continues to count existing collateral toward the health of open positions. This proposal removes that final piece.

#### Details

This VIP sets both the collateral factor and the liquidation threshold of the Part 2 markets to zero. Because the collateral factor is already zero on every market, the operative change is the liquidation threshold; both parameters are written together in a single call per market. Markets whose liquidation threshold is already zero are omitted, as zeroing them would be a no-op.

The liquidation threshold is the ratio of collateral value at which a position becomes eligible for liquidation. Setting it to zero means a deprecated asset contributes no value toward keeping a position solvent, so any position still relying on one of these assets as collateral becomes eligible for liquidation.

For example, consider a position that has supplied $1,000 of a deprecated asset as collateral and borrowed $400 of an active asset. While the liquidation threshold is 60%, the position is healthy: $1,000 × 60% = $600 of supported debt against $400 borrowed. Once the liquidation threshold is set to zero, the deprecated collateral supports $0 of debt, the $400 borrow is no longer covered, and the position becomes eligible for liquidation.

**Final action required**: Once Step 2 executes, any position using a deprecated or off-boarded asset as collateral will be eligible for liquidation. Affected users are strongly encouraged to repay outstanding borrows or withdraw collateral from these markets before execution.

#### Security and additional considerations

- **VIP execution simulation**: validated in a fork environment that each in-scope market ends with a zero collateral factor and a zero liquidation threshold.
- **Cross-chain payload size**: each LayerZero message is verified below the 10 KB Relayer cap at build time.`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip646 = () => makeProposal(PART2_POOLS.flatMap(generateStep2Commands), meta, ProposalType.REGULAR);

export default vip646;
