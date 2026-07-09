import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  CORE_SOURCE_GOVERNANCE_SIGS,
  CORE_SOURCE_USDT,
  HUB_GOVERNANCE_SIGS,
  HUB_USDT,
  giveCallPermission,
} from "./bsctestnet";

const { FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

// Addendum to VIP-680. The main proposal grants the Liquidity Hub (USDT) Governance role set to the
// Normal timelock (plus the Operator set to the Guardian) and performs the Core wiring. This addendum
// grants the SAME Governance role set on Hub_USDT and CoreSource_USDT to the Fast-Track and Critical
// timelocks, so urgent proposals can operate the Hub too. It is a separate proposal because all three
// timelocks' governance grants plus the wiring exceed a single proposal's block-gas budget on BSC.
// Addresses, ACM target, and role strings are imported from the main VIP-680 file as the single
// source of truth.
const FAST_LANE_TIMELOCKS = [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

export const vip680Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] Liquidity Hub (USDT) — Fast-Track and Critical timelock permissions (addendum)",
    description: `#### Summary

Addendum to VIP-680. Grants the **Governance** role set on the **Liquidity Hub (USDT)** and its
**Core yield source** to the **Fast-Track** and **Critical** timelocks on BNB Chain Testnet, so
urgent (fast-track / critical) proposals can operate the Hub in addition to the Normal timelock
configured in the main VIP-680 proposal.

#### Actions

Grant, on both **Hub_USDT** and the **Core source**, the full Governance role set (registry, caps,
queues, pause/unpause, fees, sweep, adapter updates, \`emergencyReallocate\`) to the Fast-Track and
Critical timelocks.

#### Notes

- This proposal grants timelock roles only. The Guardian's permissions are set separately: the
  Operator (tighten-only) set by the main VIP-680 proposal, and the full Governance set by the
  companion Guardian-permissions proposal (testnet-only).
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...FAST_LANE_TIMELOCKS.flatMap(timelock =>
        HUB_GOVERNANCE_SIGS.map(sig => giveCallPermission(HUB_USDT, sig, timelock)),
      ),
      ...FAST_LANE_TIMELOCKS.flatMap(timelock =>
        CORE_SOURCE_GOVERNANCE_SIGS.map(sig => giveCallPermission(CORE_SOURCE_USDT, sig, timelock)),
      ),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Addendum;
