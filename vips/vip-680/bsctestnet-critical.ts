import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  CORE_SOURCE_USDT,
  CRITICAL_TIMELOCK,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  HUB_REGISTRY,
  HUB_USDT,
} from "./addresses/bsctestnet";
import {
  CORE_FLUX_GOVERNANCE,
  FRV_GOVERNANCE,
  HUB_GOVERNANCE,
  HUB_REGISTRY_GOVERNANCE,
  giveCallPermission,
} from "./permissions";

// ---------------------------------------------------------------------------------------------------
// VIP-680 (Critical addendum) — BNB Chain Testnet.
//
// Grants the same Governance role set the main proposal gives the Normal Timelock to the Critical
// timelock, across the whole stack (Hub + Core + FRV + Flux + HubRegistry), so critical proposals can
// operate the Hub too. Separate proposal for the same block-gas reason as the Fast-Track addendum.
//
// NOTE: full-Governance parity with the Normal Timelock is a testnet choice; on mainnet the fast lanes
// would instead receive only a tightening subset. Do not mirror this full-set grant to mainnet.
// ---------------------------------------------------------------------------------------------------

export const vip680Critical = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] Liquidity Hub (USDT) — Critical timelock permissions (addendum)",
    description: `#### Summary

Fourth of five proposals onboarding the redeployed **Liquidity Hub (USDT)** on BNB Chain Testnet. Grants
the **Governance** role set to the **Critical timelock** on **Hub_USDT**, the **Core**, **FRV** and
**Flux** yield sources, and the **HubRegistry**, so critical proposals can operate the Hub alongside the
Normal Timelock configured in the main proposal.

#### Actions

Grant the full Governance role set (registry, caps, queues, pause/unpause, fees, sweep, adapter updates,
\`emergencyReallocate\`, and registry \`addHub\`/\`removeHub\`) to the Critical timelock across the stack.

#### Notes

- The Critical timelock does not receive the operator-only \`reallocate\` role.
- Full-Governance parity with the Normal Timelock is a testnet choice; on mainnet the fast lanes would
  receive only a tightening subset. Do not mirror this grant to mainnet.
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...HUB_GOVERNANCE.map(sig => giveCallPermission(ACM, HUB_USDT, sig, CRITICAL_TIMELOCK)),
      ...CORE_FLUX_GOVERNANCE.map(sig => giveCallPermission(ACM, CORE_SOURCE_USDT, sig, CRITICAL_TIMELOCK)),
      ...FRV_GOVERNANCE.map(sig => giveCallPermission(ACM, FRV_SOURCE_USDT, sig, CRITICAL_TIMELOCK)),
      ...CORE_FLUX_GOVERNANCE.map(sig => giveCallPermission(ACM, FLUX_SOURCE_USDT, sig, CRITICAL_TIMELOCK)),
      ...HUB_REGISTRY_GOVERNANCE.map(sig => giveCallPermission(ACM, HUB_REGISTRY, sig, CRITICAL_TIMELOCK)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Critical;
