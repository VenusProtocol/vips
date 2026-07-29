import { Command } from "src/types";

import {
  ACM,
  ADAPTER_CORE_V1,
  ADAPTER_FLUX,
  ADAPTER_FRV,
  AUX_COMMANDS_AGGREGATOR,
  BOOTSTRAP_RECEIVER,
  BOOTSTRAP_SEED,
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
  STACKS_PART_1,
  STACKS_PART_2,
  VTREASURY,
} from "./addresses/bscmainnet";
import {
  ADD_HUB,
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

// ===================================================================================================
// VIP-680 [BNB Chain Mainnet] — command builders shared by both Liquidity Hub onboarding proposals.
//
//   bscmainnet-part-1.ts  USDT + USDC, plus the one-time HubRegistry ownership acceptance
//   bscmainnet-part-2.ts  U
//
// The launch set is split because all three assets in one proposal cost at least 17,682,972 gas
// against the 16,777,216 per-tx cap (BEP-652 / EIP-7825). A floor, not an exact figure: it was
// measured before FRV joined each withdraw queue and before the bootstrap deposits, both of which
// only add. The stacks are disjoint, so the split is packaging, not sequencing.
//
// Both proposals build every command here, so what is proposed and what the simulations assert cannot
// drift. Role sets live in ./permissions.ts.
//
// Both MUST be REGULAR: of the four governance accounts only the Normal Timelock holds
// DEFAULT_ADMIN_ROLE on the ACM, which the grant/revoke sandwich needs.
// ===================================================================================================

export interface AcmCommand {
  target: string;
  signature: string;
  params: [string, string, string];
}

// `contract` is an argument, not the target: every entry calls the ACM. That is what keeps the
// aggregator from ever needing a permission on a Hub or the registry.
const grants = (contract: string, sigs: string[], account: string): AcmCommand[] =>
  sigs.map(sig => ({
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [contract, sig, account] as [string, string, string],
  }));

// 77 grants per asset stack. The counts are pinned in the simulation's permission-matrix checks.
export const assetGrants = (s: HubStack): AcmCommand[] => [
  // Normal Timelock (49)
  ...grants(s.hub, HUB_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(s.core, CORE_FLUX_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(s.flux, CORE_FLUX_GOVERNANCE, NORMAL_TIMELOCK),
  ...grants(s.frv, FRV_GOVERNANCE, NORMAL_TIMELOCK),
  // Guardian (7)
  ...grants(s.hub, HUB_GUARDIAN, GUARDIAN),
  ...grants(s.core, CORE_FLUX_GUARDIAN, GUARDIAN),
  ...grants(s.flux, CORE_FLUX_GUARDIAN, GUARDIAN),
  ...grants(s.frv, FRV_GUARDIAN, GUARDIAN),
  // Operator (21)
  ...grants(s.hub, HUB_OPERATOR, OPERATOR),
  ...grants(s.core, CORE_FLUX_OPERATOR, OPERATOR),
  ...grants(s.flux, CORE_FLUX_OPERATOR, OPERATOR),
  ...grants(s.frv, FRV_OPERATOR, OPERATOR),
];

// One batch per asset stack, the registry grants riding in the first. The proposal references batches
// only by index, so the seeding script and the simulation both rebuild them from here — nothing else
// would catch a drift between what is stored and what is replayed.
const buildBatches = (stacks: HubStack[], registrySigs: string[]): AcmCommand[][] =>
  stacks.map((s, i) =>
    i === 0 ? [...assetGrants(s), ...grants(HUB_REGISTRY, registrySigs, NORMAL_TIMELOCK)] : assetGrants(s),
  );

// USDT = base, USDC = base+1. The registry's full governance set is granted here, once.
export const buildAcmBatchesPart1 = (): AcmCommand[][] => buildBatches(STACKS_PART_1, HUB_REGISTRY_GOVERNANCE);

// Re-grants `addHub` so part 2 is authorised by its own grants rather than by part 1 having landed.
// Once part 1 has landed this is a no-op: OZ's _grantRole is guarded by `if (!hasRole(...))`, so no
// event, no SSTORE, ~8k gas. `removeHub` is not re-granted — part 2 never calls it.
export const buildAcmBatchesPart2 = (): AcmCommand[][] => buildBatches(STACKS_PART_2, [ADD_HUB]);

// Lend the aggregator DEFAULT_ADMIN_ROLE for the executeBatch commands and take it back in the same
// transaction. Only the batch INDICES are encoded, so the base must match on-chain batchCount() at
// seeding time — see the TODO(ops) in addresses/bscmainnet.ts.
export const aggregatorSandwich = (batchIndexBase: number, batchCount: number): Command[] => [
  {
    target: ACM,
    signature: "grantRole(bytes32,address)",
    params: [DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR],
  },
  ...Array.from({ length: batchCount }, (_, i) => ({
    target: AUX_COMMANDS_AGGREGATOR,
    signature: "executeBatch(uint256)",
    params: [batchIndexBase + i],
  })),
  {
    target: ACM,
    signature: "revokeRole(bytes32,address)",
    params: [DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR],
  },
];

// Wiring and bootstrap for one asset stack, in the only order that works:
//   - addResource before the inner-queue setters, which reject unregistered resources;
//   - addYieldGroup before the outer-queue setters, which reject unregistered groups;
//   - the bootstrap deposit last, since `deposit` routes through the outer deposit queue.
//
// FRV is registered but wired to nothing: no fixed-rate vault exists for these assets yet. It is out
// of the deposit queue (nothing to route into) but LAST in the withdraw queue rather than omitted.
//
// Omitting it would be a griefing vector. `setOuterWithdrawQueue` rejects a queue that drops a
// registered group with `totalAssets() > 0`, and YieldGroupBase.totalAssets() counts idle balance —
// so a 1 wei transfer to an omitted FRV would permanently block the Operator from reordering the
// queue. Listing it leaves no omission for that guard to reject.
//
// Last costs nothing: the withdraw loop breaks on `remaining > 0`, and an empty group returns 0
// immediately. It stays correct once a vault is wired, since AdapterFRV.maxWithdraw returns 0 outside
// terminal states — a locked FRV can never serve a withdrawal, while Core and Flux always can.
export const stackCommands = (s: HubStack): Command[] => [
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
  { target: s.hub, signature: "setOuterWithdrawQueue(address[])", params: [[s.flux, s.core, s.frv]] },

  // Shares go to the burn address, so the seed can never be redeemed back out.
  {
    target: VTREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [s.asset, BOOTSTRAP_SEED, NORMAL_TIMELOCK],
  },
  { target: s.asset, signature: "approve(address,uint256)", params: [s.hub, BOOTSTRAP_SEED] },
  { target: s.hub, signature: "deposit(uint256,address)", params: [BOOTSTRAP_SEED, BOOTSTRAP_RECEIVER] },
];

// ---------------------------------------------------------------------------------------------------
// Voter-facing description, shared so the two proposals describe the same mechanism the same way.
//
// Most of each proposal sits behind `executeBatch(index)`, whose calldata reveals nothing. Addresses
// and batch indices are therefore interpolated from the address book, so a voter can read the stored
// batches before voting. Same shape as VIP-627's "Deployed contracts" section.
// ---------------------------------------------------------------------------------------------------
export const onboardingMeta = (opts: {
  title: string;
  /** Markdown asset list as it reads in a sentence, e.g. "**USDT** and **USDC**". */
  assetList: string;
  /** The asset stacks this proposal onboards, in onboarding order. */
  stacks: HubStack[];
  /** First aggregator batch index this proposal replays; one batch per stack follows consecutively. */
  batchIndexBase: number;
  /** True for part 1 only: the HubRegistry's pending ownership is accepted once, by the first part. */
  acceptsRegistry: boolean;
  /**
   * HubRegistry roles this proposal grants, as a sentence fragment. Separate from `acceptsRegistry`
   * because both parts grant on the registry but only part 1 accepts its ownership.
   */
  registryRoles: string;
  /** Paragraph placed under "Scope", explaining this part's place in the two-proposal sequence. */
  scopeNote: string;
  /** Extra "Notes" bullets, for anything specific to one part. Each is one markdown line. */
  extraNotes?: string[];
}) => {
  const { title, assetList, stacks, batchIndexBase, acceptsRegistry, registryRoles, scopeNote } = opts;
  const extraNotes = (opts.extraNotes ?? []).map(n => `\n- ${n}`).join("");
  const stackCount = stacks.length;
  const hub = stackCount === 1 ? "Hub" : "Hubs";
  const batchPhrase = stackCount === 1 ? "the pre-seeded batch" : `the ${stackCount} pre-seeded batches`;
  const batchCalls = stacks
    .map((_, i) => `\`getBatch(${batchIndexBase + i})\``)
    .join(stackCount === 2 ? " and " : ", ");
  const batchIndexList =
    stackCount === 1
      ? `batch index ${batchIndexBase}`
      : `batch indices ${batchIndexBase}-${batchIndexBase + stackCount - 1}`;
  // Part 2 onboards a single asset, where "For each asset: ..." reads wrong.
  const perAsset = (rest: string) =>
    stackCount === 1 ? rest.charAt(0).toUpperCase() + rest.slice(1) : `For each asset: ${rest}`;

  return {
    version: "v2",
    title,
    description: `#### Summary

Onboards the **Liquidity Hub** on BNB Chain for ${assetList}. ${perAsset("it provisions the access")}
control across the whole stack, accepts the Hub's pending ownership, registers the Hub in the shared
**HubRegistry**, wires the **Core** and **Flux** yield sources end to end, and seeds the Hub with a
small bootstrap deposit from the Venus Treasury.${
      acceptsRegistry ? " The registry's pending ownership is accepted here, once." : ""
    }

Each Hub is a per-asset ERC-4626 allocator vault. A lender deposits the asset and the Hub routes it
across Venus yield families under a governance-set policy, returning a yield-bearing share token whose
exchange rate rises as yield accrues. Fees launch disabled at 0/0/0.

#### Scope

${scopeNote}

#### Access-control model

The Hub uses an asymmetric permission model, provisioned identically on every stack:

- **Normal Timelock** — the full Governance role set on each Hub and on its Core, Flux and FRV
  sources, plus ${registryRoles} on the **HubRegistry**.
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
- Outer deposit queue **[Core, Flux]**, outer withdraw queue **[Flux, Core, FRV]** on each Hub.

#### Actions (one atomic transaction, in order)

1. Grant \`DEFAULT_ADMIN_ROLE\` on the AccessControlManager to the AuxiliaryCommandsAggregator, execute
   ${batchPhrase} of permission grants${
      stackCount === 1 ? "" : " (one per asset)"
    }, then revoke that role again in the same
   transaction. The batch contents were stored on-chain before this proposal was created and cannot be
   changed by it, so they can be read and checked before voting with ${batchCalls} on the aggregator.
   Every stored call targets the AccessControlManager itself, so the aggregator never holds a
   permission on a Hub or on the registry.
2. ${acceptsRegistry ? "Accept the pending ownership of the **HubRegistry**, then register" : "Register"} the ${
      stackCount === 1 ? "Hub" : `${stackCount} Hubs`
    } in the registry, before any yield group is added, so
   ${stackCount === 1 ? "the" : "each"} \`HubAdded\` event precedes every \`YieldGroupAdded\`.
3. ${perAsset("accept the Hub's pending ownership (retiring the deployer's owner key); on the")}
   **Core** source register the vToken behind its adapter and set the inner queues; on the **Flux**
   source register the fToken behind its adapter and set the inner queues; register the Core, Flux
   and FRV yield sources on the Hub; and point the Hub's outer deposit queue at **[Core, Flux]** and
   its outer withdraw queue at **[Flux, Core, FRV]**.
4. ${perAsset("withdraw **10 tokens** from the Venus Treasury, approve the Hub for exactly that")}
   amount, and deposit it. The resulting shares are minted to the burn address
   \`0x000000000000000000000000000000000000dEaD\`, so every Hub launches already seeded and can never
   return to a zero-supply state.

#### Notes

- The **bootstrap deposit** is defence in depth. The ${hub} ${
      stackCount === 1 ? "is" : "are"
    } deployed with an ERC-4626 decimals
  offset of 6, which is what makes a first-deposit inflation attack non-griefing; seeding each Hub in
  the same transaction additionally guarantees that no external account is ever the first depositor.
  Burning the shares (rather than holding them in the Treasury) makes "the Hub is never empty" an
  on-chain property instead of a policy, at a one-off cost of 10 tokens per asset.
- Each **FRV** yield source is registered but left unwired: no fixed-rate vault instance exists for
  these assets on BNB Chain yet, so there is nothing to register as a resource, and it is kept out of
  the deposit queue so nothing routes into it. It is placed last in the withdraw queue rather than
  omitted. Omitting it would let anyone transfer 1 wei of the asset to the FRV source and permanently
  block the Operator from reordering the withdraw queue, because the Hub rejects a withdraw queue that
  drops a source holding any balance. Listing it last removes that lever at no cost: a source with
  nothing withdrawable is skipped, and the queue is only walked that far when the earlier sources
  cannot cover a redemption. A follow-up proposal will wire it once a vault is created.
- The Migrator needs no permissions — it is immutable and permissionless.
- Fees launch at 0/0/0; the machinery exists for governance to enable them later.${extraNotes}

#### Security and additional considerations

- The \`DEFAULT_ADMIN_ROLE\` grant to the AuxiliaryCommandsAggregator is scoped to this proposal: it is
  granted, used to replay ${batchPhrase}, and revoked in the same transaction. The aggregator replays
  whatever was stored under ${
    stackCount === 1 ? "that index" : "those indices"
  }, so the contents — not the mechanism — are what to
  check; they are frozen on-chain and readable via ${batchCalls}.
- The **Operator** and the **Guardian** are multisigs, not timelocks: anything they are granted here
  takes effect with no governance delay. Both are deliberately one-directional. The Operator can
  tighten, rebalance and pause, and can raise a yield-group cap to make room for a \`reallocate\`, but
  cannot unpause, change fees, add or remove a yield group or resource, repoint an adapter, or
  \`sweep\`. The Guardian can only pause and route funds out of danger; it holds no unpause, so it can
  never undo a governance-ordered pause.
- Every Hub and yield source sits behind a beacon, and the HubRegistry behind a proxy, whose upgrade
  authority is the Normal Timelock. This proposal does not change that, and does not upgrade anything.
- The bootstrap deposit spends **${stackCount * 10} tokens** of Treasury funds in total and mints the
  resulting shares to the burn address, so that value is permanently unrecoverable by design.

#### Deployed contracts (BNB Chain)

${stacks
  .map(
    s =>
      `- **${s.key}** — Hub \`${s.hub}\`, Core source \`${s.core}\`, Flux source \`${s.flux}\`, FRV source \`${s.frv}\``,
  )
  .join("\n")}

Shared across all assets:

- HubRegistry: \`${HUB_REGISTRY}\`
- AdapterCoreV1: \`${ADAPTER_CORE_V1}\` · AdapterFlux: \`${ADAPTER_FLUX}\` · AdapterFRV: \`${ADAPTER_FRV}\`
- AuxiliaryCommandsAggregator: \`${AUX_COMMANDS_AGGREGATOR}\` (${batchIndexList})
- Operator: \`${OPERATOR}\` · Guardian: \`${GUARDIAN}\`
- Venus Treasury (funds the bootstrap deposits): \`${VTREASURY}\``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
};
