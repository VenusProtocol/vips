import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  CORE_SOURCE_USDT,
  FAST_TRACK_TIMELOCK,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  HUB_REGISTRY,
  HUB_USDT,
} from "./addresses";
import {
  CORE_FLUX_GOVERNANCE,
  FRV_GOVERNANCE,
  HUB_GOVERNANCE,
  HUB_REGISTRY_GOVERNANCE,
  giveCallPermission,
} from "./permissions";

// ---------------------------------------------------------------------------------------------------
// VIP-680 (Fast-Track addendum) — BNB Chain Testnet.
//
// Grants the same Governance role set the main proposal gives the Normal Timelock to the Fast-Track
// timelock, across the whole stack (Hub + Core + FRV + Flux + HubRegistry), so urgent proposals can
// operate the Hub too. Split into its own proposal because all three timelocks' grants plus the wiring
// exceed a single proposal's block-gas budget on BSC.
//
// NOTE: this grants the Fast-Track timelock the FULL Governance set (fees, addYieldGroup/removeYieldGroup,
// registry management, ...) for testnet parity with the Normal Timelock. On mainnet the fast lanes would
// instead receive only a tightening subset (lower caps, pause, reorder queues); do not mirror this
// full-set grant to mainnet.
// ---------------------------------------------------------------------------------------------------

export const vip680FastTrack = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] Liquidity Hub (USDT) — Fast-Track timelock permissions (addendum)",
    description: `#### Summary

Third of five proposals onboarding the redeployed **Liquidity Hub (USDT)** on BNB Chain Testnet. Grants
the **Governance** role set to the **Fast-Track timelock** on **Hub_USDT**, the **Core**, **FRV** and
**Flux** yield sources, and the **HubRegistry**, so fast-track proposals can operate the Hub alongside
the Normal Timelock configured in the main proposal.

#### Actions

Grant the full Governance role set (registry, caps, queues, pause/unpause, fees, sweep, adapter updates,
\`emergencyReallocate\`, and registry \`addHub\`/\`removeHub\`) to the Fast-Track timelock across the stack.

#### Notes

- The Fast-Track timelock does not receive the operator-only \`reallocate\` role.
- Full-Governance parity with the Normal Timelock is a testnet choice; on mainnet the fast lanes would
  receive only a tightening subset. Do not mirror this grant to mainnet.
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...HUB_GOVERNANCE.map(sig => giveCallPermission(HUB_USDT, sig, FAST_TRACK_TIMELOCK)),
      ...CORE_FLUX_GOVERNANCE.map(sig => giveCallPermission(CORE_SOURCE_USDT, sig, FAST_TRACK_TIMELOCK)),
      ...FRV_GOVERNANCE.map(sig => giveCallPermission(FRV_SOURCE_USDT, sig, FAST_TRACK_TIMELOCK)),
      ...CORE_FLUX_GOVERNANCE.map(sig => giveCallPermission(FLUX_SOURCE_USDT, sig, FAST_TRACK_TIMELOCK)),
      ...HUB_REGISTRY_GOVERNANCE.map(sig => giveCallPermission(HUB_REGISTRY, sig, FAST_TRACK_TIMELOCK)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680FastTrack;
