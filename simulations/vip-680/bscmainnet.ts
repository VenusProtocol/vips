import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  ACM_BATCH_INDEX_BASE,
  ADAPTER_CORE_V1,
  ADAPTER_FLUX,
  AUX_COMMANDS_AGGREGATOR,
  CORE_ABSOLUTE_CAP,
  CORE_PERCENTAGE_CAP_BPS,
  CRITICAL_TIMELOCK,
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
} from "../../vips/vip-680/addresses/bscmainnet";
import vip680Bscmainnet, { buildAcmBatches } from "../../vips/vip-680/bscmainnet";
import {
  CORE_FLUX_GOVERNANCE,
  CORE_FLUX_GUARDIAN,
  FRV_GOVERNANCE,
  FRV_GUARDIAN,
  HUB_GOVERNANCE,
  HUB_GUARDIAN,
  HUB_REGISTRY_GOVERNANCE,
  REALLOCATE,
} from "../../vips/vip-680/permissions";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import AUX_AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import HUB_ABI from "./abi/Hub.json";
import HUB_REGISTRY_ABI from "./abi/HubRegistry.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// ---------------------------------------------------------------------------------------------------
// Fork block: a recent bscmainnet block after the Liquidity Hub stack was deployed, while the real
// chain has NOT yet been seeded (batchCount() is still 2 == ACM_BATCH_INDEX_BASE), so the before() hook
// seeds the three batches on the fork. Once the production seed transactions exist and this block is
// pinned after them, batchCount() is past the base index, the seeding becomes a no-op, and the
// deep-compare below then validates the REAL batches.
//
// Keep this a live block (never 0): forking() wraps its callback in try/catch, so a block the RPC
// rejects would abort registration and the file would report ZERO tests while exiting 0 — a silent
// pass. With a live block the fork connects and any failure surfaces as a named assertion error.
// ---------------------------------------------------------------------------------------------------
const BLOCK_NUMBER = 112783065;

const ZERO = ethers.constants.AddressZero;

// The exact ACM role id giveCallPermission(contract, sig, account) grants:
// keccak256(abi.encodePacked(contract, functionSig)). Asserting hasRole on this specific role is immune
// to the isAllowedToCall wildcard fallback (keccak256(address(0), sig)), so "not granted" checks cannot
// be masked by a pre-existing wildcard. That matters most for sweep(address,address) and
// pauseResource(address), role strings shared across the Hub and every YieldGroup.
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const addr = (a: string) => ethers.utils.getAddress(a);

// An address in the aggregator's authorizedBatchers allowlist (verified on-chain, seeded by VIP-628).
// Impersonated below to seed the batches on the fork, since the real chain is only seeded once the VIP
// is final.
const AUTHORIZED_BATCHER = "0x9b0A3EAE7f174937d31745B710BbeA68e9D1BEf7";

// The three aggregator batches this VIP replays (one per asset), and the same lists flattened to
// (contract, sig, account) triples for the role assertions. Derived from buildAcmBatches() — the one
// source of truth the proposal, the seed script and this simulation all share, so the sim cannot drift
// from what executes. Every batch entry targets the ACM; the Hub-stack contract is params[0].
const BATCHES = buildAcmBatches();
const GRANTS = BATCHES.flat().map(c => ({ contract: c.params[0], sig: c.params[1], account: c.params[2] }));
const grantsFor = (account: string) => GRANTS.filter(g => addr(g.account) === addr(account));

// Encode one batch exactly as the seed script does, so the fork seeding and the on-chain deep-compare
// both exercise the same bytes.
const encodeBatch = (b: number) =>
  BATCHES[b].map(c => ({
    target: c.target,
    data: new ethers.utils.Interface([`function ${c.signature}`]).encodeFunctionData(
      c.signature.slice(0, c.signature.indexOf("(")),
      c.params,
    ),
  }));

// True while any Hub-stack address is still a placeholder. The dedup check keys on raw addresses, so it
// only becomes meaningful once distinct real addresses are filled — guard it until then.
const HAS_PLACEHOLDER =
  OPERATOR === ZERO ||
  HUB_REGISTRY === ZERO ||
  STACKS.some(s => [s.hub, s.core, s.flux, s.frv].some(a => a === ZERO));
const structuralIt = HAS_PLACEHOLDER ? it.skip : it;

// Everything the Normal Timelock gets that the Guardian deliberately does NOT: add/remove yield groups
// and resources, raise/lower caps, the queues, the fee setters, sweep, updateResourceAdapter,
// setBlocksPerYear, unpause, and the whole registry. Computed as a set difference so it stays correct
// if the sets in permissions.ts change.
const WITHHELD_FROM_GUARDIAN: [string, string][] = STACKS.flatMap((s): [string, string][] => [
  ...HUB_GOVERNANCE.filter(x => !HUB_GUARDIAN.includes(x)).map((x): [string, string] => [s.hub, x]),
  ...CORE_FLUX_GOVERNANCE.filter(x => !CORE_FLUX_GUARDIAN.includes(x)).map((x): [string, string] => [s.core, x]),
  ...CORE_FLUX_GOVERNANCE.filter(x => !CORE_FLUX_GUARDIAN.includes(x)).map((x): [string, string] => [s.flux, x]),
  ...FRV_GOVERNANCE.filter(x => !FRV_GUARDIAN.includes(x)).map((x): [string, string] => [s.frv, x]),
]).concat(HUB_REGISTRY_GOVERNANCE.map((x): [string, string] => [HUB_REGISTRY, x]));

// Per-asset grant tallies, address-independent: Normal 49, Guardian 7, Operator 21 per stack, plus the
// registry's 2 Normal grants. Used for the shape assertions and the expected event counts.
const N = STACKS.length;
const TOTAL_GRANTS = GRANTS.length;

interface Bound {
  s: HubStack;
  hub: Contract;
  core: Contract;
  flux: Contract;
  frv: Contract;
}

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;
  let registry: Contract;
  let aggregator: Contract;
  const bound: Bound[] = [];

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    registry = await ethers.getContractAt(HUB_REGISTRY_ABI, HUB_REGISTRY);
    aggregator = await ethers.getContractAt(AUX_AGGREGATOR_ABI, AUX_COMMANDS_AGGREGATOR);

    for (const s of STACKS) {
      bound.push({
        s,
        hub: await ethers.getContractAt(HUB_ABI, s.hub),
        core: await ethers.getContractAt(YIELD_GROUP_ABI, s.core),
        flux: await ethers.getContractAt(YIELD_GROUP_ABI, s.flux),
        frv: await ethers.getContractAt(YIELD_GROUP_ABI, s.frv),
      });
    }

    // Seed the batches on the fork if the real chain has not been seeded yet. Once the production seed
    // transactions exist and BLOCK_NUMBER is pinned after them, batchCount() is already past the base
    // index and this is a no-op — the deep-compare below then validates the REAL batches.
    const batchCount: number = (await aggregator.batchCount()).toNumber();
    if (batchCount === ACM_BATCH_INDEX_BASE) {
      const batcher = await initMainnetUser(AUTHORIZED_BATCHER, ethers.utils.parseEther("1"));
      for (let b = 0; b < BATCHES.length; b++) {
        await aggregator
          .connect(batcher)
          ["addBatch((address,bytes)[],uint256)"](encodeBatch(b), ACM_BATCH_INDEX_BASE + b);
      }
    }
  });

  describe("Aggregator batches", () => {
    it("each seeded batch is exactly buildAcmBatches(), call for call", async () => {
      for (let b = 0; b < BATCHES.length; b++) {
        const expected = encodeBatch(b);
        const stored: { target: string; data: string }[] = await aggregator.getBatch(ACM_BATCH_INDEX_BASE + b);
        expect(stored.length).to.equal(expected.length, `batch ${b} length`);
        for (let i = 0; i < expected.length; i++) {
          expect(addr(stored[i].target)).to.equal(addr(expected[i].target), `batch ${b} call ${i} target`);
          expect(stored[i].data).to.equal(expected[i].data, `batch ${b} call ${i} calldata`);
        }
      }
    });

    it("every batch call targets the ACM, so the aggregator needs no Hub permission", () => {
      for (const c of BATCHES.flat()) {
        expect(addr(c.target)).to.equal(addr(ACM));
        expect(c.signature).to.equal("giveCallPermission(address,string,address)");
      }
    });

    it("the Normal Timelock can call executeBatch", async () => {
      expect(await acm.hasRole(roleId(AUX_COMMANDS_AGGREGATOR, "executeBatch(uint256)"), NORMAL_TIMELOCK)).to.equal(
        true,
      );
    });
  });

  describe("Permission matrix shape", () => {
    it("grants the right totals: 149 governance / 21 guardian / 63 operator", () => {
      expect(TOTAL_GRANTS).to.equal(233);
      expect(grantsFor(NORMAL_TIMELOCK).length).to.equal(49 * N + HUB_REGISTRY_GOVERNANCE.length);
      expect(grantsFor(GUARDIAN).length).to.equal(7 * N);
      expect(grantsFor(OPERATOR).length).to.equal(21 * N);
    });

    it("splits into one batch per asset, registry grants riding in the first", () => {
      expect(BATCHES.length).to.equal(N);
      expect(BATCHES[0].length).to.equal(77 + HUB_REGISTRY_GOVERNANCE.length);
      for (let b = 1; b < N; b++) expect(BATCHES[b].length).to.equal(77);
    });

    structuralIt("contains no duplicate (contract, sig, account) entry", () => {
      const keys = GRANTS.map(g => `${addr(g.contract)}|${g.sig}|${addr(g.account)}`);
      expect(new Set(keys).size).to.equal(GRANTS.length);
    });

    it("grants nothing to the Critical Timelock", () => {
      expect(grantsFor(CRITICAL_TIMELOCK).length).to.equal(0);
    });

    it("grants the operator-only reallocate role to the Operator alone", () => {
      const reallocateGrantees = [...new Set(GRANTS.filter(g => g.sig === REALLOCATE).map(g => addr(g.account)))];
      expect(reallocateGrantees).to.deep.equal([addr(OPERATOR)]);
    });
  });

  describe("Pre-VIP state", () => {
    it("every Hub and the HubRegistry are pending-owned by the Normal Timelock (not yet accepted)", async () => {
      expect(addr(await registry.pendingOwner())).to.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await registry.owner())).to.not.equal(addr(NORMAL_TIMELOCK));
      for (const { hub } of bound) {
        expect(addr(await hub.pendingOwner())).to.equal(addr(NORMAL_TIMELOCK));
        expect(addr(await hub.owner())).to.not.equal(addr(NORMAL_TIMELOCK));
      }
    });

    it("every contract is already bound to the canonical ACM", async () => {
      // The sources have NO owner and NO setAccessControlManager — _accessControlManager is written
      // once at init with no setter anywhere, so a wrong value here is unrepairable by governance and
      // must block the proposal.
      const contracts: Contract[] = [registry];
      for (const { hub, core, flux, frv } of bound) contracts.push(hub, core, flux, frv);
      for (const c of contracts) {
        expect(addr(await c.accessControlManager())).to.equal(addr(ACM));
      }
    });

    it("every source is bound to its own Hub and asset", async () => {
      for (const { s, hub, core, flux, frv } of bound) {
        for (const src of [core, flux, frv]) {
          expect(addr(await src.hub())).to.equal(addr(s.hub));
          expect(addr(await src.asset())).to.equal(addr(s.asset));
        }
        expect(addr(await hub.asset())).to.equal(addr(s.asset));
      }
    });

    it("nobody holds any of the roles this proposal grants", async () => {
      for (const g of GRANTS) {
        expect(await acm.hasRole(roleId(g.contract, g.sig), g.account)).to.equal(
          false,
          `pre ${g.contract} ${g.sig} ${g.account}`,
        );
      }
    });

    it("the aggregator does not hold DEFAULT_ADMIN_ROLE", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR)).to.equal(false);
    });

    it("every Hub is unregistered, unwired and holds no yield groups", async () => {
      for (const { s, hub, core, flux, frv } of bound) {
        expect(await registry.isHub(s.hub)).to.equal(false);
        expect(addr(await registry.hubForAsset(s.asset))).to.equal(addr(ZERO));
        expect(await hub.registeredYieldGroups()).to.deep.equal([]);
        for (const src of [core, flux, frv]) {
          expect(await src.resources()).to.deep.equal([]);
        }
      }
    });
  });

  // Governance voter override. At this fork block the live REGULAR config is votingPeriod 192384,
  // proposalThreshold 1,000,000 XVS and quorum 1,500,000 XVS. The framework's auto-resolver picks the
  // only account above the 1M threshold as the proposer and drops the default proposer from the pool,
  // leaving proposer + two default supporters at ~1.41M for-votes, below quorum, so the proposal would
  // be Defeated. Override with a proposer that clears the 1M threshold and supporters (the default
  // proposer plus the two default supporters) that together lift for-votes to ~1.88M, clearing quorum.
  // Voting power read on-chain (XVS Vault getPriorVotes) at block 112783064.
  const PROPOSER = "0x34221485302f6F2029660a000908B5FCABB9BC6e"; // 1,127,978 XVS (>= 1M threshold)
  const SUPPORTERS = [
    "0x5176671de05380379399b669ed276feec99d59cb", // 464,316 XVS (framework's default proposer)
    "0xc444949e0054a23c44fc45789738bdf64aed2391", // 131,934 XVS
    "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E", // 154,142 XVS
  ];

  testVip("VIP-680 Liquidity Hub onboarding (USDT, USDC, U) on BNB Chain", await vip680Bscmainnet(), {
    proposer: PROPOSER,
    supporters: SUPPORTERS,
    callbackAfterExecution: async txResponse => {
      // Each giveCallPermission calls grantRole internally, so every one of the TOTAL_GRANTS grants
      // emits RoleGranted; the one DEFAULT_ADMIN_ROLE grant lent to the aggregator adds one more, and
      // that admin role is taken back in the same transaction (one RoleRevoked). The deployed ACM
      // emits no PermissionGranted event, so RoleGranted alone counts the grants (the "every grant
      // landed" hasRole checks below verify each permission independently).
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked"],
        [TOTAL_GRANTS + 1, 1],
      );
      // The registry and all N Hubs complete their Ownable2Step transfer; each Hub registers three
      // yield groups. expectEvents counts by event name across the supplied ABIs without filtering by
      // emitting address, so one ABI catches OwnershipTransferred from both the registry and the Hubs.
      await expectEvents(txResponse, [HUB_ABI], ["OwnershipTransferred", "YieldGroupAdded"], [1 + N, 3 * N]);
      await expectEvents(txResponse, [HUB_REGISTRY_ABI], ["HubAdded"], [N]);
      // Core and Flux only — FRV gets no resource in this proposal.
      await expectEvents(txResponse, [YIELD_GROUP_ABI], ["ResourceAdded"], [2 * N]);

      // Normative indexer requirement: every HubAdded must land at a lower log index than every
      // YieldGroupAdded, so the HubAdded handler can seed each Hub's yield-group set. The proposal
      // emits all N addHub calls before any addYieldGroup, so max(HubAdded) < min(YieldGroupAdded).
      const receipt = await txResponse.wait();
      const topicHubAdded = new ethers.utils.Interface(HUB_REGISTRY_ABI).getEventTopic("HubAdded");
      const topicYieldGroupAdded = new ethers.utils.Interface(HUB_ABI).getEventTopic("YieldGroupAdded");
      const hubAddedIdx = receipt.logs.filter(l => l.topics[0] === topicHubAdded).map(l => l.logIndex);
      const yieldGroupAddedIdx = receipt.logs.filter(l => l.topics[0] === topicYieldGroupAdded).map(l => l.logIndex);
      expect(hubAddedIdx.length).to.equal(N);
      expect(yieldGroupAddedIdx.length).to.equal(3 * N);
      expect(Math.max(...hubAddedIdx)).to.be.lessThan(Math.min(...yieldGroupAddedIdx));
    },
  });

  describe("Post-VIP permissions", () => {
    it("every grant landed", async () => {
      for (const g of GRANTS) {
        expect(await acm.hasRole(roleId(g.contract, g.sig), g.account)).to.equal(
          true,
          `post ${g.contract} ${g.sig} ${g.account}`,
        );
      }
    });

    it("the aggregator no longer holds DEFAULT_ADMIN_ROLE", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR)).to.equal(false);
    });

    it("the Guardian holds none of the roles reserved to the Normal Timelock", async () => {
      for (const [c, s] of WITHHELD_FROM_GUARDIAN) {
        expect(await acm.hasRole(roleId(c, s), GUARDIAN)).to.equal(false, `guardian ${c} ${s}`);
      }
    });

    it("no timelock holds the operator-only reallocate role on any Hub", async () => {
      for (const { s } of bound) {
        expect(await acm.hasRole(roleId(s.hub, REALLOCATE), NORMAL_TIMELOCK)).to.equal(false);
        expect(await acm.hasRole(roleId(s.hub, REALLOCATE), GUARDIAN)).to.equal(false);
        expect(await acm.hasRole(roleId(s.hub, REALLOCATE), CRITICAL_TIMELOCK)).to.equal(false);
      }
    });

    it("the Operator holds nothing outside its own set", async () => {
      const held = new Set(grantsFor(OPERATOR).map(g => `${addr(g.contract)}|${g.sig}`));
      const everythingElse = GRANTS.filter(g => !held.has(`${addr(g.contract)}|${g.sig}`));
      for (const g of everythingElse) {
        expect(await acm.hasRole(roleId(g.contract, g.sig), OPERATOR)).to.equal(
          false,
          `operator ${g.contract} ${g.sig}`,
        );
      }
    });

    it("the Critical Timelock holds nothing at all", async () => {
      for (const g of GRANTS) {
        expect(await acm.hasRole(roleId(g.contract, g.sig), CRITICAL_TIMELOCK)).to.equal(
          false,
          `critical ${g.contract} ${g.sig}`,
        );
      }
    });
  });

  describe("Post-VIP ownership and registration", () => {
    it("every Hub and the HubRegistry are now owned by the Normal Timelock, no pending transfer", async () => {
      expect(addr(await registry.owner())).to.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await registry.pendingOwner())).to.equal(addr(ZERO));
      for (const { hub } of bound) {
        expect(addr(await hub.owner())).to.equal(addr(NORMAL_TIMELOCK));
        expect(addr(await hub.pendingOwner())).to.equal(addr(ZERO));
      }
    });

    it("all three Hubs are registered in the HubRegistry, both directions", async () => {
      expect((await registry.getHubsCount()).toNumber()).to.equal(N);
      for (const { s } of bound) {
        expect(await registry.isHub(s.hub)).to.equal(true);
        expect(addr(await registry.hubForAsset(s.asset))).to.equal(addr(s.hub));
        expect(addr(await registry.assetForHub(s.hub))).to.equal(addr(s.asset));
      }
    });
  });

  describe("Post-VIP wiring", () => {
    it("each Hub has all three yield groups registered, unpaused, at their configured caps", async () => {
      for (const { s, hub } of bound) {
        expect((await hub.registeredYieldGroups()).map(addr)).to.have.members([s.core, s.flux, s.frv].map(addr));
        const expected: [string, string, number][] = [
          [s.core, CORE_ABSOLUTE_CAP, CORE_PERCENTAGE_CAP_BPS],
          [s.flux, FLUX_ABSOLUTE_CAP, FLUX_PERCENTAGE_CAP_BPS],
          [s.frv, FRV_ABSOLUTE_CAP, FRV_PERCENTAGE_CAP_BPS],
        ];
        for (const [src, absoluteCap, pctBps] of expected) {
          const cfg = await hub.yieldGroupConfig(src);
          expect(cfg.registered).to.equal(true);
          expect(cfg.paused).to.equal(false);
          expect(cfg.absoluteCap.toString()).to.equal(absoluteCap.toString());
          expect(cfg.percentageCapBps).to.equal(pctBps);
        }
      }
    });

    it("each Hub routes deposits [Core, Flux] and withdrawals [Flux, Core]", async () => {
      for (const { s, hub } of bound) {
        expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal([s.core, s.flux].map(addr));
        expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal([s.flux, s.core].map(addr));
      }
    });

    it("Core and Flux each hold their resource behind the right adapter, with matching inner queues", async () => {
      for (const { s, core, flux } of bound) {
        const cases: [Contract, string, string][] = [
          [core, s.vToken, ADAPTER_CORE_V1],
          [flux, s.fToken, ADAPTER_FLUX],
        ];
        for (const [src, resource, adapter] of cases) {
          expect((await src.resources()).map(addr)).to.deep.equal([addr(resource)]);
          const [registered, paused, boundAdapter] = await src.resourceConfig(resource);
          expect(registered).to.equal(true);
          expect(paused).to.equal(false);
          expect(addr(boundAdapter)).to.equal(addr(adapter));
          expect((await src.innerDepositQueue()).map(addr)).to.deep.equal([addr(resource)]);
          expect((await src.innerWithdrawQueue()).map(addr)).to.deep.equal([addr(resource)]);
        }
      }
    });

    it("every FRV group is registered on its Hub but left unwired and off both outer queues", async () => {
      for (const { s, hub, frv } of bound) {
        expect(await frv.resources()).to.deep.equal([]);
        expect((await frv.innerDepositQueue()).length).to.equal(0);
        expect((await frv.innerWithdrawQueue()).length).to.equal(0);
        expect((await hub.outerDepositQueue()).map(addr)).to.not.include(addr(s.frv));
        expect((await hub.outerWithdrawQueue()).map(addr)).to.not.include(addr(s.frv));
        // YieldGroupBase.totalAssets() iterates an empty resource list and returns 0 rather than
        // reverting. A reverting view would be treated as funded and would have made
        // setOuterWithdrawQueue([Flux, Core]) revert with WithdrawQueueOmitsFundedYieldGroup.
        expect((await frv.totalAssets()).toString()).to.equal("0");
      }
    });

    it("every Hub advertises deposit capacity and launches unpaused with fees at 0/0/0", async () => {
      for (const { hub } of bound) {
        // maxDeposit walks the whole live path: Hub outer queue -> source inner queue -> adapter.
        expect(await hub.maxDeposit(NORMAL_TIMELOCK)).to.be.gt(0);
        const fees = await hub.feeBps();
        expect(fees.managementBps).to.equal(0);
        expect(fees.performanceBps).to.equal(0);
        expect(await hub.redeemFeeBps()).to.equal(0);
        expect(await hub.hubPaused()).to.equal(false);
      }
    });
  });
});
