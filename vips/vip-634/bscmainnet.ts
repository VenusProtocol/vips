import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BNB_BTC,
  BNB_CORE,
  BNB_DEFI,
  BNB_GAMEFI,
  ETH_CORE,
  OPBNB,
  OPTIMISM,
  UNICHAIN,
  generatePoolCommands,
} from "./phase4Markets";

const meta = {
  version: "v2",
  title: "VIP-634 Market Deprecation Phase 4 (Part 1 of 2)",
  description: `#### Summary

This proposal is the first of two VIPs implementing Phase 4 of the market deprecation outlined in the Venus community forum ([Deprecate Venus Core on opBNB / Optimism / Unichain + Isolated Pools](https://community.venus.io/t/deprecate-venus-core-on-opbnb-optimism-unichain-isolated-pools/5760) and [May 2026 Risk Parameter Update & Asset Off-boarding](https://community.venus.io/t/may-2026-risk-parameter-update-asset-off-boarding/5785)).

The work is split across two VIPs to respect the governor's 100-operation limit and the LayerZero 10 KB per-message cap. Part 1 covers the BNB Core pool, the BNB BTC / DeFi / GameFi isolated pools, and the opBNB, Optimism, Unichain and Ethereum Core deployments.

#### Description

These markets already had their collateral factors reduced to zero through prior off-boarding actions, but their reserve factors, interest rate models, and certain residual supply / borrow caps remain misaligned with a wound-down state. For each deprecated market this VIP:

1. Sets the reserve factor to 100% (markets already at 100% are skipped).
2. Repoints the interest rate model to the chain's push-out deprecation curve (base 300% / slope1 0% / jump 363.64% / kink 0.45 — flat 300% below the kink, ramping to a 500% maximum at full utilization). PLANET and stkBNB are excluded (~$0 borrows, IRM moot).
3. Closes the leftover Phase-1 gaps by setting outstanding supply / borrow caps to 0.

Liquidation thresholds are unchanged; no action reduces collateral factors of healthy positions in this part.

This parameter update is the first of a two-step wind-down. A follow-up VIP, expected approximately two weeks later, will set the liquidation thresholds and remaining collateral factors of these markets to zero, completing the wind-down.

#### Security and additional considerations

- **VIP execution simulation**: validated in a fork environment that each market ends with the 100% reserve factor, the push-out IRM, and zeroed caps.
- **Cross-chain payload size**: each LayerZero message is verified below the 10 KB Relayer cap at build time.`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip634 = () =>
  makeProposal(
    [
      // ── BNB Core (legacy) ──
      ...generatePoolCommands(BNB_CORE),

      // ── BNB isolated pools ──
      ...generatePoolCommands(BNB_BTC),
      ...generatePoolCommands(BNB_DEFI),
      ...generatePoolCommands(BNB_GAMEFI),

      // ── Remote chains ──
      ...generatePoolCommands(OPBNB),
      ...generatePoolCommands(OPTIMISM),
      ...generatePoolCommands(UNICHAIN),
      ...generatePoolCommands(ETH_CORE),
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip634;
