import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  ACM_BATCH_INDEX_BASE,
  ADAPTER_CORE_V1,
  ADAPTER_FLUX,
  AUX_COMMANDS_AGGREGATOR,
  CORE_ABSOLUTE_CAP,
  CORE_PERCENTAGE_CAP_BPS,
  DEFAULT_ADMIN_ROLE,
  FLUX_ABSOLUTE_CAP,
  FLUX_PERCENTAGE_CAP_BPS,
  FRV_ABSOLUTE_CAP,
  FRV_PERCENTAGE_CAP_BPS,
  GUARDIAN,
  HUB_REGISTRY,
  type HubStack,
  NORMAL_TIMELOCK,
  OPERATOR,
  STACKS,
} from "./addresses/bscmainnet";
import {
  CORE_FLUX_GOVERNANCE,
  CORE_FLUX_GUARDIAN,
  CORE_FLUX_OPERATOR,
  FRV_GOVERNANCE,
  FRV_GUARDIAN,
  FRV_OPERATOR,
  HUB_GOVERNANCE,
  HUB_GUARDIAN,
  HUB_OPERATOR,
  HUB_REGISTRY_GOVERNANCE,
} from "./permissions";

// ---------------------------------------------------------------------------------------------------
// VIP-680 — BNB Chain Mainnet. Liquidity Hub onboarding for THREE assets (USDT, USDC, U), in ONE
// proposal. One Hub per asset, each with its own Core / Flux / FRV sources; the registry, adapters and
// beacons are shared once per chain.
//
// Inline, this would be 233 ACM grants + 40 wiring = 273 commands, far above GovernorBravo's
// proposalMaxOperations of 100 and the per-tx gas cap. The grants are pre-seeded into the
// AuxiliaryCommandsAggregator as THREE batches (one per asset; the registry's two grants ride in the
// USDT batch) and replayed by three executeBatch commands, so the whole onboarding — permissions,
// ownership, registration and wiring — lands atomically in ~45 commands. One batch per asset keeps each
// executeBatch (~79 grants) well under the per-tx gas cap.
//
// Only the grants are batched. The wiring stays inline because its targets ARE the Hubs and the
// registry: batching it would mean granting a shared, upgradeable contract standing Hub governance, and
// acceptOwnership() could not be batched at all (Ownable2Step checks msg.sender against pendingOwner,
// the Timelock, not the aggregator). Keeping it inline also leaves the substance of the proposal
// readable on-chain instead of behind a batch index.
//
// This proposal MUST be REGULAR. Of the four governance accounts, only the Normal Timelock holds
// DEFAULT_ADMIN_ROLE on the ACM, and the grant/revoke sandwich needs it.
//
// Permission model — per the shipment plan's permission tables (the README's asymmetric model, with
// raise-caps assigned to the Operator rather than the Guardian):
//   Normal Timelock  full Governance set across every Hub, source and the registry (loosen and tighten)
//   Guardian         instant emergency containment only: pause (Hub / group / resource),
//                    emergencyReallocate, and FRV forceRemoveResource. No unpause, no cap changes.
//   Operator         routine keeper: raise/lower caps, lower per-tx cap, reorder queues, pause, and the
//                    operator-exclusive `reallocate`.
//   Critical         nothing. Fast-Track  nothing.
// `reallocate` is granted to the Operator only; Governance uses the strictly-more-capable
// `emergencyReallocate` (works while paused), so it is never granted `reallocate`.
//
// Ordering is load-bearing and must not be reshuffled:
//   - the aggregator sandwich runs first, because every wiring command below is ACM-gated;
//   - every addHub precedes every addYieldGroup, so each HubAdded lands at a lower log index than any
//     YieldGroupAdded (indexers seed each Hub's yield-group set from that ordering);
//   - each addResource precedes its inner-queue setters (the setters reject unregistered resources);
//   - each addYieldGroup precedes the outer-queue setters (they reject unregistered groups).
//
// FRV: no FRV vault instance exists for any of these assets on mainnet — only the controller and
// implementation. Each FRV YieldGroup is registered here so it is discoverable and capped from day one,
// but it gets no resource and is kept out of both outer queues. That is safe: YieldGroupBase
// .totalAssets() iterates an empty resource list and returns 0 rather than reverting, so the group
// counts as unfunded and the Hub's withdraw-queue coverage guard permits omitting it. A follow-up
// proposal adds each resource, its inner queues and its outer-queue slot once a vault is created.
// ---------------------------------------------------------------------------------------------------

export interface AcmCommand {
  target: string;
  signature: string;
  params: [string, string, string];
}

// Every entry targets the ACM itself; the Hub-stack contract is an ARGUMENT, not the target. That is
// what keeps the aggregator free of any Hub permission — it only ever calls the ACM.
const grants = (contract: string, sigs: string[], account: string): AcmCommand[] =>
  sigs.map(sig => ({
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [contract, sig, account] as [string, string, string],
  }));

// The 77 ACM grants for a single asset stack: Governance to Normal, containment to the Guardian,
// the keeper set to the Operator, across the Hub and its Core / Flux / FRV sources.
const assetGrants = (s: HubStack): AcmCommand[] => [
  // Normal Timelock — full Governance set (49)
  ...grants(s.hub, HUB_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(s.core, CORE_FLUX_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(s.flux, CORE_FLUX_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(s.frv, FRV_GOVERNANCE, NORMAL_TIMELOCK),
  // Guardian — instant emergency containment (7)
  ...grants(s.hub, HUB_GUARDIAN, GUARDIAN),
  ...grants(s.core, CORE_FLUX_GUARDIAN, GUARDIAN),
  ...grants(s.flux, CORE_FLUX_GUARDIAN, GUARDIAN),
  ...grants(s.frv, FRV_GUARDIAN, GUARDIAN),
  // Operator — routine keeper (21)
  ...grants(s.hub, HUB_OPERATOR, OPERATOR),
  ...grants(s.core, CORE_FLUX_OPERATOR, OPERATOR),
  ...grants(s.flux, CORE_FLUX_OPERATOR, OPERATOR),
  ...grants(s.frv, FRV_OPERATOR, OPERATOR),
];

// The three aggregator batches, one per asset stack, in STACKS order (USDT = base, USDC = base+1,
// U = base+2). The registry's two governance grants ride in the first (USDT) batch. Exported because
// three consumers must agree on it byte for byte: the seed script that stores it, the simulation that
// deep-compares it against on-chain getBatch(), and this proposal — which references it only by index,
// so nothing else would catch a drift.
export const buildAcmBatches = (): AcmCommand[][] =>
  STACKS.map((s, i) =>
    i === 0 ? [...assetGrants(s), ...grants(HUB_REGISTRY, HUB_REGISTRY_GOVERNANCE, NORMAL_TIMELOCK)] : assetGrants(s),
  );

export const vip680Bscmainnet = () => {
  const batches = buildAcmBatches();

  const meta = {
    version: "v2",
    title: "VIP-680 Liquidity Hub — onboard USDT, USDC and U on BNB Chain",
    description: `#### Summary

Onboards the **Liquidity Hub** on BNB Chain for three assets — **USDT**, **USDC** and **U** — in a
single proposal. For each asset it provisions the access control across the whole stack, accepts the
Hub's pending ownership, registers the Hub in the shared **HubRegistry**, and wires the **Core** and
**Flux** yield sources end to end. The registry's pending ownership is accepted once.

Each Hub is a per-asset ERC-4626 allocator vault. A lender deposits the asset and the Hub routes it
across Venus yield families under a governance-set policy, returning a yield-bearing share token whose
exchange rate rises as yield accrues. Fees launch disabled at 0/0/0.

#### Access-control model

The Hub uses an asymmetric permission model, provisioned identically on all three stacks:

- **Normal Timelock** — the full Governance role set on each Hub, on its Core, Flux and FRV sources,
  and on the HubRegistry.
- **Guardian** — instant emergency containment only: pause the Hub, a yield group or a resource,
  \`emergencyReallocate\` (works while the Hub is paused), and \`forceRemoveResource\` on FRV. It
  receives no unpause, no cap changes, no queues, no fees, no adapter repointing, and nothing on the
  registry.
- **Operator** — the routine keeper: raise and lower the yield-group and per-resource caps, lower the
  per-transaction withdrawal cap, reorder the inner and outer queues, pause the Hub, a group or a
  resource, and the operator-exclusive \`reallocate\`.

The Critical and Fast-Track Timelocks receive no permissions in this proposal. \`reallocate\` is
granted to the Operator only.

#### Caps and routing (identical per asset)

- **Core** — absolute cap 2,000,000,000; percentage cap disabled. Deposits land here first.
- **Flux** — absolute cap 7,000,000; percentage cap 20% of Hub TVL. Fills via \`reallocate\`.
- **FRV** — absolute cap 5,000,000; percentage cap 30%. Registered but unwired (no live vault).
- Outer deposit queue **[Core, Flux]**, outer withdraw queue **[Flux, Core]** on each Hub.

#### Actions (one atomic transaction, in order)

1. Grant \`DEFAULT_ADMIN_ROLE\` on the AccessControlManager to the AuxiliaryCommandsAggregator, execute
   the three pre-seeded batches of permission grants (one per asset), then revoke that role again in
   the same transaction. Every call in every batch targets the AccessControlManager, so the aggregator
   holds no permission on any Hub or the registry at any point.
2. Accept the pending ownership of the **HubRegistry**, then register all three Hubs, so each
   \`HubAdded\` event precedes every \`YieldGroupAdded\`.
3. For each asset: accept the Hub's pending ownership (retiring the deployer's owner key); on the
   **Core** source register the vToken behind its adapter and set the inner queues; on the **Flux**
   source register the Fluid fToken behind its adapter and set the inner queues; register the Core,
   Flux and FRV yield sources on the Hub; and point the Hub's outer deposit queue at **[Core, Flux]**
   and its outer withdraw queue at **[Flux, Core]**.

#### Notes

- Each **FRV** yield source is registered but left unwired: no fixed-rate vault instance exists for
  these assets on BNB Chain yet, so there is nothing to register as a resource. FRV is kept out of both
  outer queues while it holds no funds, and a follow-up proposal will wire it once a vault is created.
- The Migrator needs no permissions — it is immutable and permissionless.
- Fees launch at 0/0/0; the machinery exists for governance to enable them later.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Execute the three pre-seeded grant batches, lending the aggregator DEFAULT_ADMIN_ROLE for
      //    exactly the executeBatch commands and taking it back in the same transaction. The batch
      //    contents are buildAcmBatches() above; the proposal names only the indices, so
      //    ACM_BATCH_INDEX_BASE must be confirmed against on-chain batchCount() before proposing.
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR],
      },
      ...batches.map((_, i) => ({
        target: AUX_COMMANDS_AGGREGATOR,
        signature: "executeBatch(uint256)",
        params: [ACM_BATCH_INDEX_BASE + i],
      })),
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR],
      },

      // 2. Take the registry, then register every Hub (all addHub before any addYieldGroup below).
      { target: HUB_REGISTRY, signature: "acceptOwnership()", params: [] },
      ...STACKS.map(s => ({ target: HUB_REGISTRY, signature: "addHub(address)", params: [s.hub] })),

      // 3. Per-asset wiring: accept the Hub, register the Core and Flux resources with their inner
      //    queues, register the three yield groups with their caps, then point the outer queues at
      //    [Core, Flux] (deposit) and [Flux, Core] (withdraw). FRV is registered but omitted from the
      //    queues: it holds no funds and has no resource, so the withdraw-queue coverage guard passes.
      ...STACKS.flatMap(s => [
        { target: s.hub, signature: "acceptOwnership()", params: [] },

        { target: s.core, signature: "addResource(address,address)", params: [s.vToken, ADAPTER_CORE_V1] },
        { target: s.core, signature: "setInnerDepositQueue(address[])", params: [[s.vToken]] },
        { target: s.core, signature: "setInnerWithdrawQueue(address[])", params: [[s.vToken]] },

        { target: s.flux, signature: "addResource(address,address)", params: [s.fToken, ADAPTER_FLUX] },
        { target: s.flux, signature: "setInnerDepositQueue(address[])", params: [[s.fToken]] },
        { target: s.flux, signature: "setInnerWithdrawQueue(address[])", params: [[s.fToken]] },

        {
          target: s.hub,
          signature: "addYieldGroup(address,uint256,uint16)",
          params: [s.core, CORE_ABSOLUTE_CAP, CORE_PERCENTAGE_CAP_BPS],
        },
        {
          target: s.hub,
          signature: "addYieldGroup(address,uint256,uint16)",
          params: [s.flux, FLUX_ABSOLUTE_CAP, FLUX_PERCENTAGE_CAP_BPS],
        },
        {
          target: s.hub,
          signature: "addYieldGroup(address,uint256,uint16)",
          params: [s.frv, FRV_ABSOLUTE_CAP, FRV_PERCENTAGE_CAP_BPS],
        },
        { target: s.hub, signature: "setOuterDepositQueue(address[])", params: [[s.core, s.flux]] },
        { target: s.hub, signature: "setOuterWithdrawQueue(address[])", params: [[s.flux, s.core]] },
      ]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Bscmainnet;
