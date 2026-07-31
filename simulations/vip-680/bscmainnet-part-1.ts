import { expect } from "chai";
import { forking, testVip } from "src/vip-framework";

import {
  ACM_BATCH_INDEX_BASE_PART_1,
  HUB_REGISTRY,
  NORMAL_TIMELOCK,
  STACKS,
  STACKS_PART_1,
  STACKS_PART_2,
} from "../../vips/vip-680/addresses/bscmainnet";
import vip680Part1Bscmainnet from "../../vips/vip-680/bscmainnet-part-1";
import { assetGrants, buildAcmBatchesPart1 } from "../../vips/vip-680/commands";
import { ADD_HUB, HUB_REGISTRY_GOVERNANCE } from "../../vips/vip-680/permissions";
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
  roleId,
  seedBatchesOnFork,
} from "./shared";

// ---------------------------------------------------------------------------------------------------
// VIP-680 part 1 — USDT and USDC. Part 2 is simulated on top of this one and reuses every assertion
// here via ./shared.
//
// The fork block is after the whole Hub stack was deployed but before the aggregator was seeded, so
// the before() hook seeds the batches itself. Re-pin this after the production seeding transactions
// and the deep-compare will validate the real batches instead — see provisionAcmBatches.ts.
//
// Keep it a live block, never 0: forking() wraps its callback in try/catch, so a block the RPC rejects
// would report zero tests and exit 0, a silent pass.
// ---------------------------------------------------------------------------------------------------
const BLOCK_NUMBER = 113200610;

const BATCHES = buildAcmBatchesPart1();
const GRANTS = flattenGrants(BATCHES);

forking(BLOCK_NUMBER, async () => {
  const state = newSimState();

  before(async () => {
    // Every stack, not just part 1's, so this file can assert part 1 leaves part 2's stack alone.
    await initSimState(state, STACKS);
    await seedBatchesOnFork(state.aggregator, BATCHES, ACM_BATCH_INDEX_BASE_PART_1);
  });

  describeAggregatorBatches(state, BATCHES, ACM_BATCH_INDEX_BASE_PART_1);

  describeUpgradeAuthority();

  describePermissionMatrix(BATCHES, {
    stacks: STACKS_PART_1,
    registrySigCount: HUB_REGISTRY_GOVERNANCE.length,
  });

  describeStacksUntouched(state, {
    title: "Pre-VIP state",
    stacks: STACKS_PART_1,
    grantsExpectedAbsent: GRANTS,
    registryAccepted: false,
  });

  testVip("VIP-680 Liquidity Hub onboarding (USDT, USDC) on BNB Chain — part 1 of 2", await vip680Part1Bscmainnet(), {
    proposer: PROPOSER,
    supporters: SUPPORTERS,
    callbackAfterExecution: makeExecutionCallback({
      stacks: STACKS_PART_1,
      // None of these roles exist yet, so every grant lands and emits.
      expectedRoleGrants: GRANTS.length,
      acceptsRegistry: true,
    }),
  });

  describePostVipPermissions(state, BATCHES, STACKS_PART_1);
  describePostVipOwnershipAndRegistration(state, { stacks: STACKS_PART_1, registeredStacks: STACKS_PART_1 });
  describePostVipWiring(state, STACKS_PART_1);
  describePostVipBootstrap(state, STACKS_PART_1);

  // The justification for splitting by asset is that the stacks are disjoint — asserted, not assumed.
  describe("Part 2's stack is untouched", () => {
    it("the U Hub is unregistered, unowned, unwired and empty", async () => {
      for (const s of STACKS_PART_2) {
        const b = boundFor(state, s);
        expect(await state.registry.isHub(s.hub)).to.equal(false);
        expect(addr(await state.registry.hubForAsset(s.asset))).to.equal(addr(ZERO));
        expect(addr(await b.hub.owner())).to.not.equal(addr(NORMAL_TIMELOCK));
        expect(addr(await b.hub.pendingOwner())).to.equal(addr(NORMAL_TIMELOCK));
        expect(await b.hub.registeredYieldGroups()).to.deep.equal([]);
        expect((await b.hub.totalSupply()).toString()).to.equal("0");
        for (const src of [b.core, b.flux, b.frv]) {
          expect(await src.resources()).to.deep.equal([]);
        }
      }
    });

    // assetGrants(U) only: part 2's batch also re-grants the registry's addHub, which part 1 has
    // legitimately granted by now.
    it("none of the U stack's own roles have been granted", async () => {
      for (const s of STACKS_PART_2) {
        for (const g of assetGrants(s)) {
          expect(await state.acm.hasRole(roleId(g.params[0], g.params[1]), g.params[2])).to.equal(
            false,
            `part-1 leaked ${g.params[0]} ${g.params[1]} ${g.params[2]}`,
          );
        }
      }
    });

    it("the registry's addHub role is already granted, which is what makes part 2's re-grant a no-op", async () => {
      expect(await state.acm.hasRole(roleId(HUB_REGISTRY, ADD_HUB), NORMAL_TIMELOCK)).to.equal(true);
    });
  });

  // Both mutate state; e2e must run before the griefing donation.
  describeEndToEnd(state, STACKS_PART_1);
  describeWithdrawQueueGriefing(state, STACKS_PART_1);
});
