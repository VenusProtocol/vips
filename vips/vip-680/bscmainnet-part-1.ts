import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ACM_BATCH_INDEX_BASE_PART_1, HUB_REGISTRY, STACKS_PART_1 } from "./addresses/bscmainnet";
import { aggregatorSandwich, buildAcmBatchesPart1, onboardingMeta, stackCommands } from "./commands";

// ---------------------------------------------------------------------------------------------------
// VIP-680 — BNB Chain Mainnet. Liquidity Hub onboarding, PART 1 of 2: USDT and USDC. Part 2 onboards
// U on the same pattern; see commands.ts for why the launch set is split and for every command built
// here.
//
// PART 1 CARRIES THE ONE-TIME REGISTRY WORK:
//   - HubRegistry.acceptOwnership() cannot be repeated (Ownable2Step zeroes pendingOwner on accept).
//     Note it is NOT a prerequisite for addHub, which is ACM-gated rather than onlyOwner.
//   - The registry's full governance set is granted here; part 2 re-grants addHub alone.
//
// Inline this would be 156 grants + 33 commands = 189, above proposalMaxOperations of 100. Batching
// the grants brings the whole onboarding down to 37 commands in one atomic transaction.
//
// Only the grants are batched. Wiring stays inline because its targets ARE the Hubs and the registry,
// so batching it would give a shared upgradeable contract standing Hub governance — and
// acceptOwnership() could not be batched at all, since Ownable2Step checks msg.sender against
// pendingOwner. It also leaves the substance of the proposal readable on chain.
//
// GAS (bscmainnet fork at block 113200610): propose() 6,259,088 (37.3% of the 16,777,216 per-tx cap),
// queue() 1,976,072, execute() 11,955,969 (71.3%). testVip asserts the cap on all three. propose() is
// a real constraint, not just execute — see the measurement in bscmainnet-part-2.ts.
//
// Ordering that must not be reshuffled: the aggregator sandwich runs first, because every wiring
// command is ACM-gated. Within a stack, see stackCommands().
//
// addHub also precedes every addYieldGroup, so HubAdded lands at a lower log index. That one is
// convention, not requirement: IHubRegistry states indexers MUST seed from state on HubAdded and that
// the ordering is "a latency optimization only, NOT a correctness requirement".
// ---------------------------------------------------------------------------------------------------

const VIP_NUMBER = 680;
const FOLLOW_UP_VIP_NUMBER = VIP_NUMBER + 1;

export const vip680Part1Bscmainnet = () => {
  const batches = buildAcmBatchesPart1();

  const meta = onboardingMeta({
    title: `VIP-${VIP_NUMBER} [BNB Chain] Liquidity Hub — onboard USDT and USDC (part 1 of 2)`,
    assetList: "two assets — **USDT** and **USDC**",
    stacks: STACKS_PART_1,
    batchIndexBase: ACM_BATCH_INDEX_BASE_PART_1,
    acceptsRegistry: true,
    registryRoles: "`addHub` and `removeHub`",
    scopeNote: `This is **part 1 of 2**. It onboards USDT and USDC, and performs the one-time acceptance of the
HubRegistry's pending ownership. A follow-up proposal, **VIP-${FOLLOW_UP_VIP_NUMBER}**, onboards **U** on the same pattern.

The launch set is split across two proposals only because provisioning all three assets in a single
transaction needs more gas than BNB Chain's per-transaction cap of 16,777,216 allows. The three Hub
stacks are independent contract sets: nothing in this proposal configures, or depends on, anything the
follow-up touches.`,
  });

  return makeProposal(
    [
      // 1. Execute the pre-seeded grant batches under a transient DEFAULT_ADMIN_ROLE.
      ...aggregatorSandwich(ACM_BATCH_INDEX_BASE_PART_1, batches.length),

      // 2. Take the registry, then register both Hubs, before any addYieldGroup below.
      { target: HUB_REGISTRY, signature: "acceptOwnership()", params: [] },
      ...STACKS_PART_1.map(s => ({ target: HUB_REGISTRY, signature: "addHub(address)", params: [s.hub] })),

      // 3+4. Per-asset wiring and bootstrap deposit.
      ...STACKS_PART_1.flatMap(stackCommands),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Part1Bscmainnet;
