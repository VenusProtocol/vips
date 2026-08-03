import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ACM_BATCH_INDEX_BASE_PART_2, HUB_REGISTRY, STACKS_PART_2 } from "./addresses/bscmainnet";
import { aggregatorSandwich, buildAcmBatchesPart2, onboardingMeta, stackCommands } from "./commands";

// ---------------------------------------------------------------------------------------------------
// VIP-680 — BNB Chain Mainnet. Liquidity Hub onboarding, PART 2 of 2: U. Part 1 onboards USDT and
// USDC and is executed first; both build every command from ./commands.ts.
//
// This part does not accept the HubRegistry's pending ownership — part 1 does, and a second
// acceptOwnership() would revert. It does re-grant `addHub`, so its own registration is authorised by
// its own batch rather than by part 1 having landed. That re-grant is a no-op once part 1 is in:
// measured on a fork, a repeat grant costs 30,584 gas against 52,821 for the first, and emits nothing.
// `removeHub` is not re-granted; this part never calls it.
//
// THE AGGREGATOR IS REQUIRED HERE TOO, for a different reason than in part 1. Inline this would be 94
// commands, which DOES fit proposalMaxOperations of 100 — the operation count is not what rules it
// out. `propose()` is: GovernorBravo copies every target, value, signature and calldata into storage
// in one transaction. Measured on a bscmainnet fork, the inline variant's propose() needed 22,954,977
// gas — 136.8% of the 16,777,216 per-tx cap — and failed the framework's assertion before execute() was
// ever reached. Do not "reclaim" the 6-command margin under proposalMaxOperations.
//
// GAS (bscmainnet fork at block 113736000, on top of part 1, against the batches actually stored on
// chain): propose() 3,530,169 (21.0%), queue() 1,057,724, execute() 6,148,240 (36.6%).
//
// Only the grants are batched; see bscmainnet-part-1.ts for why the wiring stays inline, and for the
// ordering rules, which are identical here.
// ---------------------------------------------------------------------------------------------------

// Its own on-chain proposal, so its own VIP number — see the note in bscmainnet-part-1.ts.
const PRECEDING_VIP_NUMBER = 680;
const VIP_NUMBER = PRECEDING_VIP_NUMBER + 1;

export const vip680Part2Bscmainnet = () => {
  const batches = buildAcmBatchesPart2();

  const meta = onboardingMeta({
    title: `VIP-${VIP_NUMBER} [BNB Chain] Liquidity Hub — onboard U (part 2 of 2)`,
    assetList: "one further asset — **U**",
    stacks: STACKS_PART_2,
    batchIndexBase: ACM_BATCH_INDEX_BASE_PART_2,
    acceptsRegistry: false,
    // One clause; the rationale is in the Notes bullet below.
    registryRoles: "`addHub` alone",
    scopeNote: `This is **part 2 of 2**, completing the Liquidity Hub launch set on BNB Chain. The preceding
proposal, **VIP-${PRECEDING_VIP_NUMBER}**, onboarded USDT and USDC and accepted the HubRegistry's pending ownership; this one
onboards U on the identical pattern and adds it to the same registry.

The launch set is split across two proposals only because provisioning all three assets in a single
transaction needs more gas than BNB Chain's per-transaction cap of 16,777,216 allows. The three Hub
stacks are independent contract sets: this proposal configures only the U stack and changes nothing
about the USDT or USDC Hubs.`,
    extraNotes: [
      "The batch re-issues the registry's `addHub` role to the Normal Timelock, which the preceding " +
        "proposal already granted. Re-granting a role that is already held writes nothing and emits " +
        "nothing on chain, so it costs roughly 8,000 gas out of this proposal's 6,148,240. It is " +
        "carried so that this proposal's own `addHub` call is authorised by its own grants rather " +
        "than by the preceding proposal having landed first. The registry's `removeHub` role is " +
        "deliberately not re-issued: this proposal never calls it.",
    ],
  });

  return makeProposal(
    [
      // 1. Execute the pre-seeded grant batch under a transient DEFAULT_ADMIN_ROLE.
      ...aggregatorSandwich(ACM_BATCH_INDEX_BASE_PART_2, batches.length),

      // 2. Register the Hub, before any addYieldGroup below. Registry ownership is irrelevant here:
      //    addHub is ACM-gated, not onlyOwner.
      ...STACKS_PART_2.map(s => ({ target: HUB_REGISTRY, signature: "addHub(address)", params: [s.hub] })),

      // 3+4. Per-asset wiring and bootstrap deposit.
      ...STACKS_PART_2.flatMap(stackCommands),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip680Part2Bscmainnet;
