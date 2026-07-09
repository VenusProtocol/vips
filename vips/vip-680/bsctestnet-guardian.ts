import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  CORE_SOURCE_GOVERNANCE_SIGS,
  CORE_SOURCE_OPERATOR_SIGS,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_GOVERNANCE_SIGS,
  FRV_SOURCE_USDT,
  HUB_GOVERNANCE_SIGS,
  HUB_OPERATOR_SIGS,
  HUB_USDT,
  giveCallPermission,
} from "./bsctestnet";

const { GUARDIAN } = NETWORK_ADDRESSES.bsctestnet;

// ---------------------------------------------------------------------------------------------------
// VIP-680 (Guardian permissions) — TESTNET ONLY.
//
// The main VIP-680 proposal already grants the Guardian the Operator role set on Hub_USDT and the
// Core source. This proposal tops the Guardian up to the FULL Governance role set across the entire
// Hub stack (Hub_USDT + Core + FRV + Flux sources) so the backend can list, remove and reconfigure
// resources through the Guardian multisig during testing WITHOUT a governance proposal per change.
//
// This is a DELIBERATE testnet-only deviation from the mainnet asymmetric permission model, where the
// Operator (Guardian) is tighten-only and only Governance (the timelocks) may loosen — add routes,
// raise caps, unpause, update adapters, sweep. Do NOT mirror this proposal to mainnet.
//
// Because the Guardian already holds the Operator (tighten) signatures from the main proposal, this
// file only grants the Governance-only DELTAS on Hub_USDT and the Core source, plus the FULL
// Governance set on the FRV and Flux sources (where the Guardian holds nothing yet). Addresses, the
// ACM target and every role string are imported from the main VIP-680 file as the single source of
// truth. Flux reuses the Core role strings (identical YieldGroup code); FRV has its own set
// (YieldGroupFRV: no raise/lowerResourceCap, no setBlocksPerYear, plus forceRemoveResource).
// ---------------------------------------------------------------------------------------------------

// Governance-only signatures = Governance set minus the shared (also-Operator) tighten actions the
// Guardian already holds from the main proposal.
export const HUB_GOVERNANCE_ONLY_SIGS = HUB_GOVERNANCE_SIGS.filter(sig => !HUB_OPERATOR_SIGS.includes(sig));
export const CORE_SOURCE_GOVERNANCE_ONLY_SIGS = CORE_SOURCE_GOVERNANCE_SIGS.filter(
  sig => !CORE_SOURCE_OPERATOR_SIGS.includes(sig),
);

// Flux uses the same YieldGroup contract as Core, so its Governance role set is identical. The
// Guardian holds nothing on the Flux source yet, so it receives the full set here.
export const FLUX_SOURCE_GOVERNANCE_SIGS = CORE_SOURCE_GOVERNANCE_SIGS;

export const vip680Guardian = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 [BNB Chain Testnet] Configure Liquidity Hub (USDT) — Guardian full permissions (testnet only)",
    description: `#### Summary

**Testnet-only.** Tops the Guardian multisig up to the **full Governance role set** across the entire
Liquidity Hub (USDT) stack on BNB Chain Testnet: **Hub_USDT**, the **Core**, **FRV** and **Flux**
yield sources. This lets the backend add, remove and reconfigure resources (list new FRV vaults / Flux
markets, change caps, pause/unpause, swap adapters, reorder queues) directly through the Guardian
multisig during testing, without a governance proposal per change.

The main VIP-680 proposal already grants the Guardian the Operator (tighten-only) role set on
Hub_USDT and the Core source. This proposal grants the remaining Governance-only signatures on those
two contracts, plus the full Governance role set on the FRV and Flux sources (where the Guardian holds
nothing yet).

#### Access-control note

On mainnet the Hub uses an asymmetric model: only Governance (the timelocks) may loosen — add routes,
raise caps, unpause, update adapters, sweep — while the Operator (Guardian) is tighten-only. Granting
the Guardian the Governance set here is a **deliberate deviation made purely to speed up testnet
iteration, and must not be mirrored to mainnet.**

#### Actions

Grant to the **Guardian** multisig:

1. The Governance-only signatures on **Hub_USDT** (registry, cap raises, unpause, fees, sweep,
   \`emergencyReallocate\`) — completing the full Hub Governance set alongside its existing Operator
   grants.
2. The Governance-only signatures on the **Core source** (\`addResource\`, \`removeResource\`,
   \`updateResourceAdapter\`, \`unpauseResource\`, \`raiseResourceCap\`, \`setBlocksPerYear\`, \`sweep\`).
3. The full Governance role set on the **FRV source** (\`YieldGroupFRV\`).
4. The full Governance role set on the **Flux source** (\`YieldGroup\`, same as Core).

#### Notes

- Permissions only — this proposal performs no wiring. FRV and Flux still cannot be registered until a
  real FRV vault instance / Flux adapter exists on testnet; the Guardian will do that via multisig
  once each resource is available.
- Testnet-only. The Hub is not yet deployed on any mainnet.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Hub_USDT — Governance-only delta → Guardian (already holds the Operator/tighten set).
      ...HUB_GOVERNANCE_ONLY_SIGS.map(sig => giveCallPermission(HUB_USDT, sig, GUARDIAN)),

      // 2. Core source — Governance-only delta → Guardian.
      ...CORE_SOURCE_GOVERNANCE_ONLY_SIGS.map(sig => giveCallPermission(CORE_SOURCE_USDT, sig, GUARDIAN)),

      // 3. FRV source — full Governance set → Guardian (YieldGroupFRV role strings).
      ...FRV_SOURCE_GOVERNANCE_SIGS.map(sig => giveCallPermission(FRV_SOURCE_USDT, sig, GUARDIAN)),

      // 4. Flux source — full Governance set → Guardian (same YieldGroup role strings as Core).
      ...FLUX_SOURCE_GOVERNANCE_SIGS.map(sig => giveCallPermission(FLUX_SOURCE_USDT, sig, GUARDIAN)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Guardian;
