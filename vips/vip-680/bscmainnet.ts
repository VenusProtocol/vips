import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  ACM_BATCH_INDEX,
  ADAPTER_CORE_V1,
  ADAPTER_FLUX,
  AUX_COMMANDS_AGGREGATOR,
  CORE_ABSOLUTE_CAP,
  CORE_PERCENTAGE_CAP_BPS,
  CORE_SOURCE_USDT,
  DEFAULT_ADMIN_ROLE,
  FAST_TRACK_TIMELOCK,
  FLUX_ABSOLUTE_CAP,
  FLUX_PERCENTAGE_CAP_BPS,
  FLUX_SOURCE_USDT,
  FRV_ABSOLUTE_CAP,
  FRV_PERCENTAGE_CAP_BPS,
  FRV_SOURCE_USDT,
  FUSDT_FLUX,
  HUB_REGISTRY,
  HUB_USDT,
  NORMAL_TIMELOCK,
  OPERATOR,
  VUSDT_CORE,
} from "./addresses/bscmainnet";
import {
  CORE_FLUX_FAST_TRACK,
  CORE_FLUX_GOVERNANCE,
  CORE_FLUX_OPERATOR,
  FRV_FAST_TRACK,
  FRV_GOVERNANCE,
  FRV_OPERATOR,
  HUB_FAST_TRACK,
  HUB_GOVERNANCE,
  HUB_OPERATOR,
  HUB_REGISTRY_GOVERNANCE,
} from "./permissions";

// ---------------------------------------------------------------------------------------------------
// VIP-680 — BNB Chain Mainnet. Liquidity Hub (USDT) onboarding, in ONE proposal.
//
// Testnet needed five proposals because each ACM grant was its own proposal command. Inline, mainnet
// would be 96 grants + 14 wiring = 110 commands — above GovernorBravo's proposalMaxOperations of 100
// (a hard revert in propose()) and far above the per-tx gas cap. Pre-seeding the grants as one
// AuxiliaryCommandsAggregator batch collapses them to three commands, so the entire onboarding —
// permissions, ownership, registration and wiring — lands atomically in 17. Nothing is deferred
// except the FRV resource, which cannot exist yet (see below).
//
// Only the grants are batched. The wiring stays inline because its targets ARE the Hub and the
// registry: batching it would mean granting a shared, upgradeable contract standing Hub governance,
// and `acceptOwnership()` could not be batched at all (Ownable2Step checks msg.sender against
// pendingOwner, which is the Timelock, not the aggregator). Keeping it inline also leaves the
// substance of the proposal readable on-chain instead of behind a batch index.
//
// This proposal MUST be REGULAR. Of the four governance accounts, only the Normal Timelock holds
// DEFAULT_ADMIN_ROLE on the ACM, and commands [0] and [2] need it. A fast-track or critical variant
// would revert on the grantRole.
//
// Permission model — asymmetric, and deliberately NOT the testnet one:
//   Normal Timelock  full Governance set (loosen and tighten, everything)
//   Fast-Track       risk/ops levers only, both directions; no add/remove, no fees, no adapter
//                    repointing, no sweep, no registry
//   Critical         nothing
//   Operator         tighten-only plus the operator-exclusive `reallocate`
// The testnet Guardian's full-Governance grant is a testnet-only deviation and is not mirrored here.
//
// Ordering is load-bearing and must not be reshuffled:
//   - the aggregator sandwich runs first, because every wiring command below is ACM-gated;
//   - addHub precedes every addYieldGroup, so HubAdded lands at a lower log index than any
//     YieldGroupAdded (indexers seed each Hub's yield-group set from that ordering);
//   - each addResource precedes its inner-queue setters (the setters reject unregistered resources);
//   - each addYieldGroup precedes the outer-queue setters (they reject unregistered groups).
//
// FRV: no FRV vault instance exists for USDT on mainnet — only the controller and implementation. The
// FRV YieldGroup is registered here so it is discoverable and capped from day one, but it gets no
// resource and is kept out of both outer queues. That is safe: YieldGroupBase.totalAssets() iterates
// an empty resource list and returns 0 rather than reverting, so the group counts as unfunded and the
// Hub's withdraw-queue coverage guard permits omitting it. A follow-up proposal adds the resource,
// its inner queues and its outer-queue slot once a vault is created.
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

// The exact 96 ACM calls the aggregator batch performs. Exported because three consumers must agree
// on it byte for byte: the seed script that stores it on the aggregator, the simulation that
// deep-compares it against on-chain `getBatch()`, and this proposal — which references it only by
// index, so nothing else would catch a drift.
export const buildAcmBatch = (): AcmCommand[] => [
  // --- Normal Timelock: full Governance set across the stack (51) -----------------------------------
  ...grants(HUB_USDT, HUB_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(CORE_SOURCE_USDT, CORE_FLUX_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(FLUX_SOURCE_USDT, CORE_FLUX_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(FRV_SOURCE_USDT, FRV_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(HUB_REGISTRY, HUB_REGISTRY_GOVERNANCE, NORMAL_TIMELOCK),

  // --- Fast-Track Timelock: risk/ops levers, both directions (27) -----------------------------------
  ...grants(HUB_USDT, HUB_FAST_TRACK, FAST_TRACK_TIMELOCK),
  ...grants(CORE_SOURCE_USDT, CORE_FLUX_FAST_TRACK, FAST_TRACK_TIMELOCK),
  ...grants(FLUX_SOURCE_USDT, CORE_FLUX_FAST_TRACK, FAST_TRACK_TIMELOCK),
  ...grants(FRV_SOURCE_USDT, FRV_FAST_TRACK, FAST_TRACK_TIMELOCK),

  // --- Operator: tighten-only plus `reallocate` (18) ------------------------------------------------
  ...grants(HUB_USDT, HUB_OPERATOR, OPERATOR),
  ...grants(CORE_SOURCE_USDT, CORE_FLUX_OPERATOR, OPERATOR),
  ...grants(FLUX_SOURCE_USDT, CORE_FLUX_OPERATOR, OPERATOR),
  ...grants(FRV_SOURCE_USDT, FRV_OPERATOR, OPERATOR),
];

// Inner queues: one resource each. FRV is intentionally absent — it has no resource yet.
const CORE_ONLY = [VUSDT_CORE];
const FLUX_ONLY = [FUSDT_FLUX];

// Outer queues: Flux first, Core last. Core is the uncapped backstop and would otherwise swallow every
// deposit before Flux received any. Same order for deposits and withdrawals, so the deposit-queue
// subset-of-withdraw-queue operator invariant holds by construction.
const OUTER_QUEUE = [FLUX_SOURCE_USDT, CORE_SOURCE_USDT];

export const vip680Bscmainnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-680 Liquidity Hub (USDT) — onboard on BNB Chain",
    description: `#### Summary

Onboards the **Liquidity Hub (USDT)** on BNB Chain in a single proposal: it provisions the access
control across the whole stack, accepts the Hub's and the registry's pending ownership, registers the
Hub in the **HubRegistry**, and wires the **Core** and **Flux** yield sources end to end.

The Hub is a per-asset ERC-4626 allocator vault. A lender deposits USDT and the Hub routes it across
Venus yield families under a governance-set policy, returning a yield-bearing share token whose
exchange rate rises as yield accrues. Fees launch disabled at 0/0/0.

#### Access-control model

The Hub uses an asymmetric permission model. **Governance** can both loosen and tighten; the
**Operator** can only tighten (lower caps, pause, reorder queues) plus the operator-exclusive
\`reallocate\`. This proposal provisions three tiers:

- **Normal Timelock** — the full Governance role set on the Hub, on the Core, FRV and Flux yield
  sources, and on the HubRegistry.
- **Fast-Track Timelock** — risk and operational levers only, in both directions: raise/lower the
  yield-group and per-resource caps, raise/lower the per-transaction withdrawal cap, reorder the
  inner and outer queues, pause and unpause the Hub, a yield group or a resource, and
  \`emergencyReallocate\`. It receives no ability to add or remove a yield group or resource, change
  fees, repoint a resource adapter, sweep, or touch the registry.
- **Operator** — the tighten-only set plus \`reallocate\`.

The Critical Timelock receives no permissions in this proposal.

#### Actions (one atomic transaction, in order)

1. Grant \`DEFAULT_ADMIN_ROLE\` on the AccessControlManager to the AuxiliaryCommandsAggregator, execute
   the pre-seeded batch of 96 permission grants, then revoke that role again in the same transaction.
   Every call in the batch targets the AccessControlManager, so the aggregator holds no permission on
   the Hub or the registry at any point.
2. Accept the pending ownership of the **HubRegistry**, then register **Hub_USDT** in it, so the
   \`HubAdded\` event precedes every \`YieldGroupAdded\`.
3. Accept the pending ownership of **Hub_USDT**. Ownership of both contracts was transferred to
   governance at deploy time and left pending; accepting it retires the deployer's owner key, which
   gates \`setAccessControlManager\`.
4. On the **Core** source, register **vUSDT** behind its adapter and set the inner deposit and
   withdraw queues.
5. On the **Flux** source, register the **Fluid fUSDT** fToken behind its adapter and set the inner
   deposit and withdraw queues.
6. Register the **Flux**, **Core** and **FRV** yield sources on the Hub, then point the Hub's outer
   deposit and withdraw queues at **[Flux, Core]**.

#### Notes

- Queue order sends deposits to Flux first, with Core last as the backstop.
- The **FRV** yield source is registered but left unwired: no fixed-rate vault instance exists for
  USDT on BNB Chain yet, so there is nothing to register as a resource. It is kept out of both outer
  queues while it holds no funds, and a follow-up proposal will wire it once a vault is created.
- The Migrator needs no permissions — it is immutable and permissionless.
- Fees launch at 0/0/0; the machinery exists for governance to enable them later.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Execute the pre-seeded batch of all 96 ACM grants, lending the aggregator
      //    DEFAULT_ADMIN_ROLE for exactly one command and taking it back in the same transaction.
      //    The batch contents are buildAcmBatch() above; the proposal names only the index, so
      //    ACM_BATCH_INDEX must be confirmed against on-chain getBatch() before proposing.
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR],
      },
      { target: AUX_COMMANDS_AGGREGATOR, signature: "executeBatch(uint256)", params: [ACM_BATCH_INDEX] },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR],
      },

      // 2. Take the registry, then register the Hub (must precede every addYieldGroup below).
      { target: HUB_REGISTRY, signature: "acceptOwnership()", params: [] },
      { target: HUB_REGISTRY, signature: "addHub(address)", params: [HUB_USDT] },

      // 3. Take the Hub, retiring the deployer's owner key.
      { target: HUB_USDT, signature: "acceptOwnership()", params: [] },

      // 4. Core source: register vUSDT behind AdapterCoreV1, then set inner queues.
      { target: CORE_SOURCE_USDT, signature: "addResource(address,address)", params: [VUSDT_CORE, ADAPTER_CORE_V1] },
      { target: CORE_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [CORE_ONLY] },
      { target: CORE_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [CORE_ONLY] },

      // 5. Flux source: register the Fluid fUSDT fToken behind AdapterFlux, then set inner queues.
      { target: FLUX_SOURCE_USDT, signature: "addResource(address,address)", params: [FUSDT_FLUX, ADAPTER_FLUX] },
      { target: FLUX_SOURCE_USDT, signature: "setInnerDepositQueue(address[])", params: [FLUX_ONLY] },
      { target: FLUX_SOURCE_USDT, signature: "setInnerWithdrawQueue(address[])", params: [FLUX_ONLY] },

      // 6. Register the three sources on the Hub (queue members first), then point the outer queues at
      //    them. FRV is registered but omitted from the queues: it holds no funds and has no resource,
      //    so the withdraw-queue funded-coverage guard is satisfied.
      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [FLUX_SOURCE_USDT, FLUX_ABSOLUTE_CAP, FLUX_PERCENTAGE_CAP_BPS],
      },
      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [CORE_SOURCE_USDT, CORE_ABSOLUTE_CAP, CORE_PERCENTAGE_CAP_BPS],
      },
      {
        target: HUB_USDT,
        signature: "addYieldGroup(address,uint256,uint16)",
        params: [FRV_SOURCE_USDT, FRV_ABSOLUTE_CAP, FRV_PERCENTAGE_CAP_BPS],
      },
      { target: HUB_USDT, signature: "setOuterDepositQueue(address[])", params: [OUTER_QUEUE] },
      { target: HUB_USDT, signature: "setOuterWithdrawQueue(address[])", params: [OUTER_QUEUE] },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Bscmainnet;
