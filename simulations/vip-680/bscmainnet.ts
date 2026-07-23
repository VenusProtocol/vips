import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  ACM_BATCH_INDEX,
  ADAPTER_CORE_V1,
  ADAPTER_FLUX,
  AUX_COMMANDS_AGGREGATOR,
  CORE_ABSOLUTE_CAP,
  CORE_PERCENTAGE_CAP_BPS,
  CORE_SOURCE_USDT,
  CRITICAL_TIMELOCK,
  DEFAULT_ADMIN_ROLE,
  FAST_TRACK_TIMELOCK,
  FLUX_ABSOLUTE_CAP,
  FLUX_PERCENTAGE_CAP_BPS,
  FLUX_SOURCE_USDT,
  FRV_ABSOLUTE_CAP,
  FRV_PERCENTAGE_CAP_BPS,
  FRV_SOURCE_USDT,
  FUSDT_FLUX,
  GUARDIAN,
  HUB_REGISTRY,
  HUB_USDT,
  NORMAL_TIMELOCK,
  OPERATOR,
  USDT,
  VUSDT_CORE,
} from "../../vips/vip-680/addresses/bscmainnet";
import vip680Bscmainnet, { buildAcmBatch } from "../../vips/vip-680/bscmainnet";
import {
  CORE_FLUX_FAST_TRACK,
  CORE_FLUX_GOVERNANCE,
  FRV_FAST_TRACK,
  FRV_GOVERNANCE,
  HUB_FAST_TRACK,
  HUB_GOVERNANCE,
  HUB_REGISTRY_GOVERNANCE,
  REALLOCATE,
} from "../../vips/vip-680/permissions";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import AUX_AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import HUB_ABI from "./abi/Hub.json";
import HUB_REGISTRY_ABI from "./abi/HubRegistry.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// ---------------------------------------------------------------------------------------------------
// TODO(deploy): bump to a bscmainnet block AFTER the Liquidity Hub stack is deployed.
//
// This simulation cannot pass before that, by construction: testVip's "can be proposed" step runs
// validateTargetAddresses(), which requires bytecode at every target, and the Hub-stack addresses in
// addresses/bscmainnet.ts are still zero placeholders. Expect it red until the deploy lands — that is
// the mechanical expression of "the stack is not deployed yet", not a defect in this file.
//
// The value below is a real, recent block rather than 0 on purpose. forking() wraps its callback in
// try/catch, so a block the RPC rejects would abort registration and the file would report ZERO tests
// while exiting 0 — a silent pass. With a live block the fork connects and the failure surfaces as
// named assertion errors instead.
// ---------------------------------------------------------------------------------------------------
const BLOCK_NUMBER = 111658139;

// The exact ACM role id giveCallPermission(contract, sig, account) grants:
// keccak256(abi.encodePacked(contract, functionSig)). Asserting hasRole on this specific role is immune
// to the isAllowedToCall wildcard fallback (keccak256(address(0), sig)), so "not granted" checks cannot
// be masked by a pre-existing wildcard. That matters most for sweep(address,address), which is a role
// string shared by the Hub and every YieldGroup.
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const addr = (a: string) => ethers.utils.getAddress(a);

// An address in the aggregator's authorizedBatchers allowlist (verified on-chain, seeded by VIP-628).
// Impersonated below to seed the batch on the fork, since the real chain is only seeded once the VIP
// is final.
const AUTHORIZED_BATCHER = "0x9b0A3EAE7f174937d31745B710BbeA68e9D1BEf7";

// The batch the aggregator will replay, and the same list flattened to (contract, sig, account)
// triples for the role assertions. Derived from buildAcmBatch() — the one source of truth the
// proposal, the seed script and this simulation all share, so the sim cannot drift from what
// executes. Every batch entry targets the ACM; the Hub-stack contract is params[0].
const ACM_BATCH = buildAcmBatch();
const GRANTS = ACM_BATCH.map(c => ({ contract: c.params[0], sig: c.params[1], account: c.params[2] }));
const grantsFor = (account: string) => GRANTS.filter(g => addr(g.account) === addr(account));

// Encode the batch exactly as the seed script does, so the fork seeding and the on-chain deep-compare
// both exercise the same bytes.
const encodeBatch = () =>
  ACM_BATCH.map(c => ({
    target: c.target,
    data: new ethers.utils.Interface([`function ${c.signature}`]).encodeFunctionData(
      c.signature.slice(0, c.signature.indexOf("(")),
      c.params,
    ),
  }));

// Everything the Normal Timelock gets that the Fast-Track timelock deliberately does NOT: add/remove
// yield groups and resources, the four fee setters, sweep, updateResourceAdapter, setBlocksPerYear,
// forceRemoveResource and the whole registry. Computed as a set difference so it stays correct if the
// sets in permissions.ts change.
const WITHHELD_FROM_FAST_TRACK: [string, string][] = [
  ...HUB_GOVERNANCE.filter(s => !HUB_FAST_TRACK.includes(s)).map((s): [string, string] => [HUB_USDT, s]),
  ...CORE_FLUX_GOVERNANCE.filter(s => !CORE_FLUX_FAST_TRACK.includes(s)).map((s): [string, string] => [
    CORE_SOURCE_USDT,
    s,
  ]),
  ...CORE_FLUX_GOVERNANCE.filter(s => !CORE_FLUX_FAST_TRACK.includes(s)).map((s): [string, string] => [
    FLUX_SOURCE_USDT,
    s,
  ]),
  ...FRV_GOVERNANCE.filter(s => !FRV_FAST_TRACK.includes(s)).map((s): [string, string] => [FRV_SOURCE_USDT, s]),
  ...HUB_REGISTRY_GOVERNANCE.map((s): [string, string] => [HUB_REGISTRY, s]),
];

const OUTER_QUEUE = [FLUX_SOURCE_USDT, CORE_SOURCE_USDT];

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;
  let hub: Contract;
  let registry: Contract;
  let core: Contract;
  let flux: Contract;
  let frv: Contract;
  let aggregator: Contract;

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    registry = await ethers.getContractAt(HUB_REGISTRY_ABI, HUB_REGISTRY);
    core = await ethers.getContractAt(YIELD_GROUP_ABI, CORE_SOURCE_USDT);
    flux = await ethers.getContractAt(YIELD_GROUP_ABI, FLUX_SOURCE_USDT);
    frv = await ethers.getContractAt(YIELD_GROUP_ABI, FRV_SOURCE_USDT);
    aggregator = await ethers.getContractAt(AUX_AGGREGATOR_ABI, AUX_COMMANDS_AGGREGATOR);

    // Seed the batch on the fork if the real chain has not been seeded yet. Once the production seed
    // transaction exists and BLOCK_NUMBER is pinned after it, batchCount() is already past
    // ACM_BATCH_INDEX and this is a no-op — the deep-compare below then validates the REAL batch.
    const batchCount: number = (await aggregator.batchCount()).toNumber();
    if (batchCount === ACM_BATCH_INDEX) {
      const batcher = await initMainnetUser(AUTHORIZED_BATCHER, ethers.utils.parseEther("1"));
      await aggregator.connect(batcher)["addBatch((address,bytes)[],uint256)"](encodeBatch(), ACM_BATCH_INDEX);
    }
  });

  describe("Aggregator batch", () => {
    it("the seeded batch is exactly buildAcmBatch(), call for call", async () => {
      const expected = encodeBatch();
      const stored: { target: string; data: string }[] = await aggregator.getBatch(ACM_BATCH_INDEX);
      expect(stored.length).to.equal(expected.length);
      for (let i = 0; i < expected.length; i++) {
        expect(addr(stored[i].target)).to.equal(addr(expected[i].target), `batch call ${i} target`);
        expect(stored[i].data).to.equal(expected[i].data, `batch call ${i} calldata`);
      }
    });

    it("every batch call targets the ACM, so the aggregator needs no Hub permission", () => {
      for (const c of ACM_BATCH) {
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
    it("grants 96 permissions, split 51 governance / 27 fast-track / 18 operator", () => {
      expect(GRANTS.length).to.equal(96);
      expect(grantsFor(NORMAL_TIMELOCK).length).to.equal(51);
      expect(grantsFor(FAST_TRACK_TIMELOCK).length).to.equal(27);
      expect(grantsFor(OPERATOR).length).to.equal(18);
    });

    it("contains no duplicate (contract, sig, account) entry", () => {
      const keys = GRANTS.map(g => `${addr(g.contract)}|${g.sig}|${addr(g.account)}`);
      expect(new Set(keys).size).to.equal(GRANTS.length);
    });

    it("grants nothing to the Critical Timelock or the Guardian", () => {
      expect(grantsFor(CRITICAL_TIMELOCK).length).to.equal(0);
      // Only holds while OPERATOR is not itself the Guardian; skip the check if it is.
      if (addr(OPERATOR) !== addr(GUARDIAN)) {
        expect(grantsFor(GUARDIAN).length).to.equal(0);
      }
    });

    it("never grants the operator-only reallocate role to a timelock", () => {
      const reallocateGrantees = GRANTS.filter(g => g.sig === REALLOCATE).map(g => addr(g.account));
      expect(reallocateGrantees).to.deep.equal([addr(OPERATOR)]);
    });
  });

  describe("Pre-VIP state", () => {
    it("Hub and HubRegistry are pending-owned by the Normal Timelock (not yet accepted)", async () => {
      expect(addr(await hub.pendingOwner())).to.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await registry.pendingOwner())).to.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await hub.owner())).to.not.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await registry.owner())).to.not.equal(addr(NORMAL_TIMELOCK));
    });

    it("every contract is already bound to the canonical ACM", async () => {
      // The sources have NO owner and NO setAccessControlManager — _accessControlManager is written
      // once at init with no setter anywhere, so a wrong value here is unrepairable by governance and
      // must block the proposal.
      for (const c of [hub, registry, core, flux, frv]) {
        expect(addr(await c.accessControlManager())).to.equal(addr(ACM));
      }
    });

    it("every source is bound to this Hub and to USDT", async () => {
      for (const src of [core, flux, frv]) {
        expect(addr(await src.hub())).to.equal(addr(HUB_USDT));
        expect(addr(await src.asset())).to.equal(addr(USDT));
      }
      expect(addr(await hub.asset())).to.equal(addr(USDT));
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

    it("Hub is unregistered, unwired and holds no yield groups", async () => {
      expect(await registry.isHub(HUB_USDT)).to.equal(false);
      expect(addr(await registry.hubForAsset(USDT))).to.equal(addr(ethers.constants.AddressZero));
      expect(await hub.registeredYieldGroups()).to.deep.equal([]);
      for (const src of [core, flux, frv]) {
        expect(await src.resources()).to.deep.equal([]);
      }
    });
  });

  testVip("VIP-680 Liquidity Hub (USDT) onboarding on BNB Chain", await vip680Bscmainnet(), {
    callbackAfterExecution: async txResponse => {
      // 96 permission grants (each giveCallPermission calls grantRole internally) + the one
      // DEFAULT_ADMIN_ROLE grant lent to the aggregator = 97 RoleGranted; that admin role is taken
      // back in the same transaction = 1 RoleRevoked. PermissionGranted is emitted only by
      // giveCallPermission, so it counts the permissions alone.
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked", "PermissionGranted"],
        [97, 1, 96],
      );
      // Hub + HubRegistry each complete their Ownable2Step transfer. expectEvents counts by event
      // name across the supplied ABIs without filtering by emitting address, so one ABI catches both.
      await expectEvents(txResponse, [HUB_ABI], ["OwnershipTransferred", "YieldGroupAdded"], [2, 3]);
      await expectEvents(txResponse, [HUB_REGISTRY_ABI], ["HubAdded"], [1]);
      // Core and Flux only — FRV gets no resource in this proposal.
      await expectEvents(txResponse, [YIELD_GROUP_ABI], ["ResourceAdded"], [2]);

      // Normative indexer requirement: HubAdded must land at a lower log index than every
      // YieldGroupAdded, so the HubAdded handler can seed each Hub's yield-group set.
      const receipt = await txResponse.wait();
      const topicHubAdded = new ethers.utils.Interface(HUB_REGISTRY_ABI).getEventTopic("HubAdded");
      const topicYieldGroupAdded = new ethers.utils.Interface(HUB_ABI).getEventTopic("YieldGroupAdded");
      const hubAddedIdx = receipt.logs.filter(l => l.topics[0] === topicHubAdded).map(l => l.logIndex);
      const yieldGroupAddedIdx = receipt.logs.filter(l => l.topics[0] === topicYieldGroupAdded).map(l => l.logIndex);
      expect(hubAddedIdx.length).to.equal(1);
      expect(yieldGroupAddedIdx.length).to.equal(3);
      expect(hubAddedIdx[0]).to.be.lessThan(Math.min(...yieldGroupAddedIdx));
    },
  });

  describe("Post-VIP permissions", () => {
    it("every one of the 96 grants landed", async () => {
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

    it("Fast-Track holds none of the shape-changing roles reserved to the Normal Timelock", async () => {
      for (const [c, s] of WITHHELD_FROM_FAST_TRACK) {
        expect(await acm.hasRole(roleId(c, s), FAST_TRACK_TIMELOCK)).to.equal(false, `fast-track ${c} ${s}`);
      }
    });

    it("the Normal Timelock does NOT hold the operator-only reallocate role", async () => {
      expect(await acm.hasRole(roleId(HUB_USDT, REALLOCATE), NORMAL_TIMELOCK)).to.equal(false);
      expect(await acm.hasRole(roleId(HUB_USDT, REALLOCATE), FAST_TRACK_TIMELOCK)).to.equal(false);
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
    it("Hub and HubRegistry are now owned by the Normal Timelock, with no pending transfer", async () => {
      expect(addr(await hub.owner())).to.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await registry.owner())).to.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await hub.pendingOwner())).to.equal(addr(ethers.constants.AddressZero));
      expect(addr(await registry.pendingOwner())).to.equal(addr(ethers.constants.AddressZero));
    });

    it("Hub is registered in the HubRegistry, both directions", async () => {
      expect(await registry.isHub(HUB_USDT)).to.equal(true);
      expect((await registry.getHubsCount()).toNumber()).to.equal(1);
      expect(addr(await registry.hubForAsset(USDT))).to.equal(addr(HUB_USDT));
      expect(addr(await registry.assetForHub(HUB_USDT))).to.equal(addr(USDT));
    });
  });

  describe("Post-VIP wiring", () => {
    it("all three yield groups are registered, unpaused, at their configured caps", async () => {
      expect((await hub.registeredYieldGroups()).map(addr)).to.have.members(
        [FLUX_SOURCE_USDT, CORE_SOURCE_USDT, FRV_SOURCE_USDT].map(addr),
      );
      const expected: [string, string, number][] = [
        [CORE_SOURCE_USDT, CORE_ABSOLUTE_CAP, CORE_PERCENTAGE_CAP_BPS],
        [FLUX_SOURCE_USDT, FLUX_ABSOLUTE_CAP, FLUX_PERCENTAGE_CAP_BPS],
        [FRV_SOURCE_USDT, FRV_ABSOLUTE_CAP, FRV_PERCENTAGE_CAP_BPS],
      ];
      for (const [src, absoluteCap, pctBps] of expected) {
        const cfg = await hub.yieldGroupConfig(src);
        expect(cfg.registered).to.equal(true);
        expect(cfg.paused).to.equal(false);
        expect(cfg.absoluteCap.toString()).to.equal(absoluteCap.toString());
        expect(cfg.percentageCapBps).to.equal(pctBps);
      }
    });

    it("Hub outer queues route [Flux, Core] for deposits and withdrawals", async () => {
      const want = OUTER_QUEUE.map(addr);
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal(want);
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal(want);
    });

    it("Core and Flux each hold their resource behind the right adapter, with matching inner queues", async () => {
      const cases: [Contract, string, string][] = [
        [core, VUSDT_CORE, ADAPTER_CORE_V1],
        [flux, FUSDT_FLUX, ADAPTER_FLUX],
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
    });

    it("FRV is registered on the Hub but left unwired and off both outer queues", async () => {
      expect(await frv.resources()).to.deep.equal([]);
      expect((await frv.innerDepositQueue()).length).to.equal(0);
      expect((await frv.innerWithdrawQueue()).length).to.equal(0);
      expect((await hub.outerDepositQueue()).map(addr)).to.not.include(addr(FRV_SOURCE_USDT));
      expect((await hub.outerWithdrawQueue()).map(addr)).to.not.include(addr(FRV_SOURCE_USDT));
    });

    it("the empty FRV group reports zero assets, so the withdraw-queue coverage guard allows omitting it", async () => {
      // YieldGroupBase.totalAssets() iterates an empty resource list and returns 0 rather than
      // reverting. A reverting view would be treated as funded and would have made
      // setOuterWithdrawQueue([Flux, Core]) revert with WithdrawQueueOmitsFundedYieldGroup.
      expect((await frv.totalAssets()).toString()).to.equal("0");
    });

    it("the Hub advertises deposit capacity through the wired route", async () => {
      // maxDeposit walks the whole live path: Hub outer queue -> source inner queue -> adapter.
      expect(await hub.maxDeposit(NORMAL_TIMELOCK)).to.be.gt(0);
    });

    it("fees launch disabled and the Hub is unpaused", async () => {
      const fees = await hub.feeBps();
      expect(fees.managementBps).to.equal(0);
      expect(fees.performanceBps).to.equal(0);
      expect(await hub.redeemFeeBps()).to.equal(0);
      expect(await hub.hubPaused()).to.equal(false);
    });
  });
});
