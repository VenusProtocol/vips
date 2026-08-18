import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  HUB_REGISTRY,
  HUB_USDT,
  NORMAL_TIMELOCK,
} from "./addresses/bsctestnet";
import {
  CORE_FLUX_GOVERNANCE,
  FRV_GOVERNANCE,
  HUB_GOVERNANCE,
  HUB_REGISTRY_GOVERNANCE,
  giveCallPermission,
} from "./permissions";

// ---------------------------------------------------------------------------------------------------
// VIP-680 (main) — BNB Chain Testnet.
//
// First of five proposals that onboard the freshly redeployed Liquidity Hub (USDT) stack. This one
// gives the Normal Timelock full control of the stack: it grants the Governance role set on the Hub,
// the three yield sources (Core / FRV / Flux) and the HubRegistry, and it accepts the Hub's and the
// registry's pending Ownable2Step ownership (both were transferred to the Normal Timelock at deploy).
//
// Ownership is accepted here, early, on purpose: it retires the deployer's owner key immediately, so
// the deployer can no longer repoint `setAccessControlManager` in the deploy -> onboarding window. It
// has no effect on indexers, whose only ordering requirement (HubAdded before every YieldGroupAdded)
// lives entirely in the wiring proposal.
//
// Companion proposals: a wiring proposal registers the Hub and wires the three sources end-to-end (it
// needs the roles granted here, so it executes after this one); two addendum proposals grant the same
// Governance set to the Fast-Track and Critical timelocks; and a testnet-only proposal tops the
// Guardian up to full permissions.
// ---------------------------------------------------------------------------------------------------

export const vip680 = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] Liquidity Hub (USDT) — Normal Timelock permissions and ownership",
    description: `#### Summary

First of five proposals onboarding the newly redeployed **Liquidity Hub (USDT)** on BNB Chain Testnet.
The Hub, its three yield sources (Core, FRV, Flux) and the HubRegistry were deployed with no ACM
permissions and their ownership left pending to governance. This proposal gives the **Normal Timelock**
full control: the Governance role set across the whole stack, plus acceptance of the Hub's and
registry's pending ownership.

#### Access-control model

The Hub uses an asymmetric permission model: **Governance** can both loosen and tighten, while the
**Operator** can only tighten (lower caps, pause, reorder queues) plus \`reallocate\`. This proposal
provisions the Governance set for the Normal Timelock, which then performs the wiring in the companion
wiring proposal.

#### Actions

1. Grant the **Governance** role set to the Normal Timelock on **Hub_USDT** (registry, caps, queues,
   pause/unpause, fees, sweep, adapter updates, \`emergencyReallocate\`), the **Core**, **FRV** and
   **Flux** yield sources, and the **HubRegistry** (\`addHub\` / \`removeHub\`).
2. Accept the pending ownership of the **HubRegistry** and **Hub_USDT** (both transferred to the Normal
   Timelock at deploy), so the deployer no longer holds the owner key that gates
   \`setAccessControlManager\`.

#### Notes

- The Normal Timelock intentionally does **not** receive the operator-only \`reallocate\` role.
- No routing is wired here; the companion wiring proposal registers the Hub and the Core/FRV/Flux
  resources once this proposal has executed.
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Governance role set -> Normal Timelock, across the whole stack.
      ...HUB_GOVERNANCE.map(sig => giveCallPermission(ACM, HUB_USDT, sig, NORMAL_TIMELOCK)),
      ...CORE_FLUX_GOVERNANCE.map(sig => giveCallPermission(ACM, CORE_SOURCE_USDT, sig, NORMAL_TIMELOCK)),
      ...FRV_GOVERNANCE.map(sig => giveCallPermission(ACM, FRV_SOURCE_USDT, sig, NORMAL_TIMELOCK)),
      ...CORE_FLUX_GOVERNANCE.map(sig => giveCallPermission(ACM, FLUX_SOURCE_USDT, sig, NORMAL_TIMELOCK)),
      ...HUB_REGISTRY_GOVERNANCE.map(sig => giveCallPermission(ACM, HUB_REGISTRY, sig, NORMAL_TIMELOCK)),

      // 2. Accept pending ownership (Ownable2Step) — registry first, then the Hub.
      { target: HUB_REGISTRY, signature: "acceptOwnership()", params: [] },
      { target: HUB_USDT, signature: "acceptOwnership()", params: [] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680;
