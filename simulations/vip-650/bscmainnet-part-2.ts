import { expect } from "chai";
import { forking, testVip } from "src/vip-framework";

import {
  ACM_BATCH_INDEX_BASE_PART_1,
  ACM_BATCH_INDEX_BASE_PART_2,
  HUB_REGISTRY,
  NORMAL_TIMELOCK,
  STACKS,
  STACKS_PART_1,
  STACKS_PART_2,
} from "../../vips/vip-650/addresses/bscmainnet";
import vip650Part1Bscmainnet from "../../vips/vip-650/bscmainnet-part-1";
import vip651Part2Bscmainnet from "../../vips/vip-650/bscmainnet-part-2";
import { assetGrants, buildAcmBatchesPart1, buildAcmBatchesPart2 } from "../../vips/vip-650/commands";
import { ADD_HUB } from "../../vips/vip-650/permissions";
import {
  PROPOSER,
  SUPPORTERS,
  ZERO,
  addr,
  boundFor,
  describeAggregatorBatches,
  describeEndToEnd,
  describePermissionMatrix,
  describePostVipBootstrap,
  describePostVipOwnershipAndRegistration,
  describePostVipPermissions,
  describePostVipWiring,
  describeStacksUntouched,
  describeUpgradeAuthority,
  describeWithdrawQueueGriefing,
  flattenGrants,
  initSimState,
  makeExecutionCallback,
  newSimState,
  requireBatchesOnChain,
  roleId,
} from "./shared";

// ---------------------------------------------------------------------------------------------------
// VIP-651 part 2 — U. Simulated in the sequence mainnet will see: part 1 executes as setup, then part
// 2 is proposed and executed against the resulting state. Fork block matches part 1's, so the two
// simulations agree on the pre-state.
//
// Each part runs under its own gas budget, which is the point of the split. testVip asserts the per-tx
// cap on propose, queue and execute, so a regression fails here rather than on chain.
// ---------------------------------------------------------------------------------------------------
const BLOCK_NUMBER = 113736000;

const BATCHES_PART_1 = buildAcmBatchesPart1();
const BATCHES = buildAcmBatchesPart2();
const GRANTS = flattenGrants(BATCHES);

// The re-granted `addHub` emits nothing, since part 1 already granted it — exactly one fewer event
// than the batch has entries. Asserting this rather than GRANTS.length proves the no-op.
const REDUNDANT_REGRANTS = 1;
const EXPECTED_ROLE_GRANTS = GRANTS.length - REDUNDANT_REGRANTS;

forking(BLOCK_NUMBER, async () => {
  const state = newSimState();

  before(async () => {
    // Every stack: this file verifies the end state of the whole launch set, not just U's.
    await initSimState(state, STACKS);
    // Both parts' batches, since part 1 is replayed here as setup before part 2 is proposed.
    await requireBatchesOnChain(state.aggregator, BATCHES_PART_1, ACM_BATCH_INDEX_BASE_PART_1);
    await requireBatchesOnChain(state.aggregator, BATCHES, ACM_BATCH_INDEX_BASE_PART_2);
  });

  describeAggregatorBatches(state, BATCHES, ACM_BATCH_INDEX_BASE_PART_2);

  describeUpgradeAuthority();

  describePermissionMatrix(BATCHES, {
    stacks: STACKS_PART_2,
    // `addHub` only; `removeHub` is not re-granted because part 2 never calls it.
    registrySigCount: 1,
  });

  describeStacksUntouched(state, {
    title: "Pre-VIP state (before either part)",
    stacks: STACKS_PART_2,
    // Nothing has executed yet, so even the redundant addHub re-grant must be absent.
    grantsExpectedAbsent: GRANTS,
    registryAccepted: false,
  });

  testVip("VIP-650 part 1 (setup for the part-2 simulation)", await vip650Part1Bscmainnet(), {
    proposer: PROPOSER,
    supporters: SUPPORTERS,
  });

  describe("State after part 1", () => {
    it("the registry is owned by the Normal Timelock and holds the two part-1 Hubs", async () => {
      expect(addr(await state.registry.owner())).to.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await state.registry.pendingOwner())).to.equal(addr(ZERO));
      expect((await state.registry.getHubsCount()).toNumber()).to.equal(STACKS_PART_1.length);
      for (const s of STACKS_PART_1) {
        expect(await state.registry.isHub(s.hub)).to.equal(true);
      }
    });

    // The precondition EXPECTED_ROLE_GRANTS is derived from. If part 1 ever stopped granting it, this
    // fails here rather than as a confusing event-count mismatch below.
    it("the registry's addHub role is already granted, so part 2's re-grant is a no-op", async () => {
      expect(await state.acm.hasRole(roleId(HUB_REGISTRY, ADD_HUB), NORMAL_TIMELOCK)).to.equal(true);
    });

    it("the U stack is still completely untouched", async () => {
      for (const s of STACKS_PART_2) {
        const b = boundFor(state, s);
        expect(await state.registry.isHub(s.hub)).to.equal(false);
        expect(addr(await state.registry.hubForAsset(s.asset))).to.equal(addr(ZERO));
        expect(addr(await b.hub.pendingOwner())).to.equal(addr(NORMAL_TIMELOCK));
        expect(addr(await b.hub.owner())).to.not.equal(addr(NORMAL_TIMELOCK));
        expect(await b.hub.registeredYieldGroups()).to.deep.equal([]);
        expect((await b.hub.totalSupply()).toString()).to.equal("0");
        for (const src of [b.core, b.flux, b.frv]) {
          expect(await src.resources()).to.deep.equal([]);
        }
        for (const g of assetGrants(s)) {
          expect(await state.acm.hasRole(roleId(g.params[0], g.params[1]), g.params[2])).to.equal(
            false,
            `part-1 leaked ${g.params[0]} ${g.params[1]} ${g.params[2]}`,
          );
        }
      }
    });
  });

  testVip("VIP-651 Liquidity Hub onboarding (U) on BNB Chain — part 2 of 2", await vip651Part2Bscmainnet(), {
    proposer: PROPOSER,
    supporters: SUPPORTERS,
    callbackAfterExecution: makeExecutionCallback({
      stacks: STACKS_PART_2,
      expectedRoleGrants: EXPECTED_ROLE_GRANTS,
      acceptsRegistry: false,
    }),
  });

  // Scoped to what THIS proposal grants.
  describePostVipPermissions(state, BATCHES, STACKS_PART_2);

  // Everything below is the end state of the full launch set, with both parts executed.
  describePostVipOwnershipAndRegistration(state, { stacks: STACKS, registeredStacks: STACKS });
  describePostVipWiring(state, STACKS);
  describePostVipBootstrap(state, STACKS);

  describe("End state — part 2 changed nothing about part 1's Hubs", () => {
    it("the part-1 Hubs still hold exactly their own bootstrap seed and their own assets", async () => {
      // Registration is per-asset, so registering U must not displace either part-1 mapping.
      for (const s of STACKS_PART_1) {
        const b = boundFor(state, s);
        expect(addr(await state.registry.hubForAsset(s.asset))).to.equal(addr(s.hub));
        expect(addr(await state.registry.assetForHub(s.hub))).to.equal(addr(s.asset));
        expect(addr(await b.hub.asset())).to.equal(addr(s.asset));
      }
    });
  });

  // Both mutate state; e2e must run before the griefing donation. Over the full launch set, since by
  // now all three Hubs must actually work, not just U's.
  describeEndToEnd(state, STACKS);
  describeWithdrawQueueGriefing(state, STACKS);
});
