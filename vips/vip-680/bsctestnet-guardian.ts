import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  GUARDIAN,
  HUB_REGISTRY,
  HUB_USDT,
} from "./addresses/bsctestnet";
import {
  CORE_FLUX_GOVERNANCE,
  FRV_GOVERNANCE,
  HUB_FULL,
  HUB_REGISTRY_GOVERNANCE,
  giveCallPermission,
} from "./permissions";

// ---------------------------------------------------------------------------------------------------
// VIP-680 (Guardian permissions) — BNB Chain Testnet, TESTNET ONLY.
//
// Grants the Guardian multisig the FULL permission set across the whole Hub stack (Hub_USDT + Core +
// FRV + Flux sources + HubRegistry) so the backend can add, remove and reconfigure resources — list new
// FRV vaults / Flux markets, change caps, pause/unpause, swap adapters, reorder queues, register/remove
// Hubs — directly through the multisig during testing, without a governance proposal per change.
//
// This is a DELIBERATE testnet-only deviation from the mainnet asymmetric model, where the Operator
// (Guardian) is tighten-only and only Governance (the timelocks) may loosen. DO NOT mirror this proposal
// to mainnet: the mainnet Guardian must receive only the Operator sets (see permissions.ts).
//
// The Hub grant uses HUB_FULL = Governance ∪ {reallocate} (the operator-only sig), so the Guardian holds
// every gated Hub function. On the sources the Operator sets are subsumed by Governance, so the full
// Governance set is granted directly; FRV uses its own set (YieldGroupFRV: no cap setters, no
// setBlocksPerYear, plus forceRemoveResource).
// ---------------------------------------------------------------------------------------------------

export const vip680Guardian = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] Liquidity Hub (USDT) — Guardian full permissions (testnet only)",
    description: `#### Summary

**Testnet-only.** Last of five proposals onboarding the redeployed **Liquidity Hub (USDT)** on BNB Chain
Testnet. Grants the **Guardian** multisig the **full permission set** across the entire stack:
**Hub_USDT**, the **Core**, **FRV** and **Flux** yield sources, and the **HubRegistry**. This lets the
backend add, remove and reconfigure resources (list new FRV vaults / Flux markets, change caps,
pause/unpause, swap adapters, reorder queues, register/remove Hubs) directly through the Guardian
multisig during testing, without a governance proposal per change.

#### Access-control note

On mainnet the Hub uses an asymmetric model: only Governance (the timelocks) may loosen, while the
Operator (Guardian) is tighten-only. Granting the Guardian the full set here is a **deliberate deviation
made purely to speed up testnet iteration, and must not be mirrored to mainnet.**

#### Actions

Grant to the **Guardian** multisig:

1. Every gated function on **Hub_USDT** — the full Governance set plus the operator-only \`reallocate\`.
2. The full Governance role set on the **Core**, **FRV** and **Flux** yield sources.
3. \`addHub\` / \`removeHub\` on the **HubRegistry**.

#### Notes

- Permissions only — this proposal performs no wiring.
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Hub_USDT — every gated function (Governance ∪ reallocate) -> Guardian.
      ...HUB_FULL.map(sig => giveCallPermission(ACM, HUB_USDT, sig, GUARDIAN)),

      // 2. Core / FRV / Flux sources — full Governance set -> Guardian.
      ...CORE_FLUX_GOVERNANCE.map(sig => giveCallPermission(ACM, CORE_SOURCE_USDT, sig, GUARDIAN)),
      ...FRV_GOVERNANCE.map(sig => giveCallPermission(ACM, FRV_SOURCE_USDT, sig, GUARDIAN)),
      ...CORE_FLUX_GOVERNANCE.map(sig => giveCallPermission(ACM, FLUX_SOURCE_USDT, sig, GUARDIAN)),

      // 3. HubRegistry — addHub / removeHub -> Guardian.
      ...HUB_REGISTRY_GOVERNANCE.map(sig => giveCallPermission(ACM, HUB_REGISTRY, sig, GUARDIAN)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Guardian;
