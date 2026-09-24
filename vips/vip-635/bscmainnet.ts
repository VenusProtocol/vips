import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUM_LIQUID_STAKED_ETH,
  BASE_CORE,
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_MEME,
  BNB_STABLECOINS,
  BNB_TRON,
  ETH_CURVE,
  ETH_LIQUID_STAKED_ETH,
  ZKSYNC_CORE,
  generatePoolCommands,
} from "../vip-634/phase4Markets";

const meta = {
  version: "v2",
  title: "VIP-635 Market Deprecation Phase 4 (Part 2 of 2)",
  description: `#### Summary

This proposal is the second of two VIPs implementing Phase 4 of the market deprecation outlined in the Venus community forum ([Deprecate Venus Core on opBNB / Optimism / Unichain + Isolated Pools](https://community.venus.io/t/deprecate-venus-core-on-opbnb-optimism-unichain-isolated-pools/5760) and [May 2026 Risk Parameter Update & Asset Off-boarding](https://community.venus.io/t/may-2026-risk-parameter-update-asset-off-boarding/5785)).

The work is split across two VIPs to respect the governor's 100-operation limit and the LayerZero 10 KB per-message cap. Part 2 covers the BNB Meme / Liquid Staked BNB / Liquid Staked ETH / Stablecoins / Tron isolated pools, the Ethereum Curve and Ethereum Liquid Staked ETH pools, and the Arbitrum, Base and zkSync Era deployments.

#### Description

Most in-scope markets already had their collateral factors reduced to zero through prior off-boarding actions; this VIP brings the remaining parameters — reserve factors, interest rate models, residual caps, and the two BNB Liquid Staked ETH markets still carrying a 5% collateral factor — in line with a wound-down state. For each deprecated market this VIP:

1. Sets the reserve factor to 100% (markets already at 100% are skipped).
2. Repoints the interest rate model to the chain's push-out deprecation curve (base 300% / slope1 0% / jump 363.64% / kink 0.45 — flat 300% below the kink, ramping to a 500% maximum at full utilization).
3. Closes the leftover Phase-1 gaps by setting outstanding supply / borrow caps to 0, and sets the collateral factor to 0 for the two BNB Liquid Staked ETH markets (weETH, wstETH) that still carry a 5% collateral factor. Liquidation thresholds are unchanged, so no healthy position is liquidated.

This parameter update is the first of a two-step wind-down. A follow-up VIP, expected approximately two weeks later, will set the liquidation thresholds and remaining collateral factors of these markets to zero, completing the wind-down.

#### Security and additional considerations

- **VIP execution simulation**: validated in a fork environment that each market ends with the 100% reserve factor, the push-out IRM, zeroed caps, and (for the two flagged markets) a 0% collateral factor.
- **Cross-chain payload size**: each LayerZero message is verified below the 10 KB Relayer cap at build time.`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip635 = () =>
  makeProposal(
    [
      // ── BNB isolated pools ──
      ...generatePoolCommands(BNB_MEME),
      ...generatePoolCommands(BNB_LIQUID_STAKED_BNB),
      ...generatePoolCommands(BNB_LIQUID_STAKED_ETH),
      ...generatePoolCommands(BNB_STABLECOINS),
      ...generatePoolCommands(BNB_TRON),

      // ── Remote chains (Ethereum Curve + Liquid Staked ETH merge into one LZ message) ──
      ...generatePoolCommands(ETH_CURVE),
      ...generatePoolCommands(ETH_LIQUID_STAKED_ETH),
      ...generatePoolCommands(ARBITRUM_LIQUID_STAKED_ETH),
      ...generatePoolCommands(BASE_CORE),
      ...generatePoolCommands(ZKSYNC_CORE),
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip635;
