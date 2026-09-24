import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";

import {
  ACM,
  ADAPTER_CORE_V1,
  ADAPTER_FLUX,
  AUX_COMMANDS_AGGREGATOR,
  BOOTSTRAP_RECEIVER,
  BOOTSTRAP_SEED,
  CORE_ABSOLUTE_CAP,
  CORE_BEACON,
  CORE_PERCENTAGE_CAP_BPS,
  CRITICAL_TIMELOCK,
  DEFAULT_ADMIN_ROLE,
  DEFAULT_PROXY_ADMIN,
  FAST_TRACK_TIMELOCK,
  FLUX_ABSOLUTE_CAP,
  FLUX_BEACON,
  FLUX_PERCENTAGE_CAP_BPS,
  FRV_ABSOLUTE_CAP,
  FRV_BEACON,
  FRV_PERCENTAGE_CAP_BPS,
  GUARDIAN,
  HUB_BEACON,
  HUB_REGISTRY,
  type HubStack,
  NORMAL_TIMELOCK,
  OPERATOR,
  VTREASURY,
} from "../../vips/vip-650/addresses/bscmainnet";
import { AcmCommand } from "../../vips/vip-650/commands";
import {
  CORE_FLUX_GOVERNANCE,
  CORE_FLUX_GUARDIAN,
  FRV_GOVERNANCE,
  FRV_GUARDIAN,
  HUB_GOVERNANCE,
  HUB_GUARDIAN,
  HUB_REGISTRY_GOVERNANCE,
  REALLOCATE,
} from "../../vips/vip-650/permissions";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import AUX_AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import HUB_ABI from "./abi/Hub.json";
import HUB_REGISTRY_ABI from "./abi/HubRegistry.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";
import YIELD_GROUP_FRV_ABI from "./abi/YieldGroupFRV.json";

// ===================================================================================================
// Shared harness for the two-part Liquidity Hub onboarding simulations.
//
// The two proposals are the same proposal over a different stack list, so every assertion here is
// parameterized by stacks and batches and reused by both. Grants and commands come from the builders
// the proposals themselves use, so a passing simulation cannot be asserting something else.
// ===================================================================================================

export const ZERO = ethers.constants.AddressZero;

// The exact role id giveCallPermission grants. Asserting hasRole on it is immune to the
// isAllowedToCall wildcard fallback (keccak256(address(0), sig)), so a "not granted" check cannot be
// masked by a pre-existing wildcard. That matters for strings declared on more than one contract in
// the stack, such as sweep(address,address) and pauseResource(address).
export const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

export const addr = (a: string) => ethers.utils.getAddress(a);

// Minimal fragments for the two contracts the bootstrap deposit touches that have no ABI file here.
export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address,address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
];
export const VTREASURY_ABI = ["function owner() view returns (address)"];
export const OWNABLE_ABI = ["function owner() view returns (address)"];

// Fixed at initialize(), not set by this proposal, but its safety rests on them — so pinned rather
// than assumed.
const EXPECTED_MAX_WITHDRAWAL_SIZE = ethers.utils.parseUnits("10000000", 18); // 10,000,000 per tx
const EXPECTED_DECIMALS = 24; // 18 asset decimals + decimalsOffset 6

// Voter override. The live REGULAR config needs 1,000,000 XVS to propose and 1,500,000 to reach
// quorum. The framework's auto-resolver picks the only account over the threshold as proposer and
// drops the default proposer from the pool, leaving ~1.41M for-votes — Defeated. These four together
// reach ~1.88M. Voting power read on-chain at block 112783064.
export const PROPOSER = "0x34221485302f6F2029660a000908B5FCABB9BC6e"; // 1,127,978 XVS (>= 1M threshold)
export const SUPPORTERS = [
  "0x5176671de05380379399b669ed276feec99d59cb", // 464,316 XVS (framework's default proposer)
  "0xc444949e0054a23c44fc45789738bdf64aed2391", // 131,934 XVS
  "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E", // 154,142 XVS
];

export interface Grant {
  contract: string;
  sig: string;
  account: string;
}

export const flattenGrants = (batches: AcmCommand[][]): Grant[] =>
  batches.flat().map(c => ({ contract: c.params[0], sig: c.params[1], account: c.params[2] }));

export const grantsFor = (grants: Grant[], account: string) => grants.filter(g => addr(g.account) === addr(account));

// Encode one batch exactly as provisionAcmBatches.ts does, so the fork seeding and the on-chain deep-compare
// both exercise the same bytes.
export const encodeBatch = (batches: AcmCommand[][], b: number) =>
  batches[b].map(c => ({
    target: c.target,
    data: new ethers.utils.Interface([`function ${c.signature}`]).encodeFunctionData(
      c.signature.slice(0, c.signature.indexOf("(")),
      c.params,
    ),
  }));

export interface Bound {
  s: HubStack;
  hub: Contract;
  core: Contract;
  flux: Contract;
  frv: Contract;
}

// Populated by initSimState() inside the caller's before() hook. The describe helpers below read it
// from inside it() bodies, which mocha runs after before(), so the lazy access is safe.
export interface SimState {
  acm: Contract;
  registry: Contract;
  aggregator: Contract;
  bound: Bound[];
}

export const newSimState = (): SimState => ({} as SimState);

export const bindStacks = async (stacks: HubStack[]): Promise<Bound[]> =>
  Promise.all(
    stacks.map(async s => ({
      s,
      hub: await ethers.getContractAt(HUB_ABI, s.hub),
      core: await ethers.getContractAt(YIELD_GROUP_ABI, s.core),
      flux: await ethers.getContractAt(YIELD_GROUP_ABI, s.flux),
      // FRV is a different contract: it adds forceRemoveResource and has neither the cap setters nor
      // setBlocksPerYear, so YieldGroup's ABI would advertise functions it does not implement.
      frv: await ethers.getContractAt(YIELD_GROUP_FRV_ABI, s.frv),
    })),
  );

// Look up one bound stack. Throws with a usable message rather than returning undefined, so a stack
// that was never passed to initSimState fails loudly instead of as a null-dereference deep in a test.
export const boundFor = (state: SimState, s: HubStack): Bound => {
  const b = state.bound.find(x => addr(x.s.hub) === addr(s.hub));
  if (!b) throw new Error(`${s.key} stack is not bound — pass it to initSimState()`);
  return b;
};

// Maps through the throwing lookup above rather than filtering state.bound: a filter matching nothing
// would turn every loop below into a test that passes without checking anything.
export const boundSubset = (state: SimState, stacks: HubStack[]): Bound[] => stacks.map(s => boundFor(state, s));

export const initSimState = async (state: SimState, stacks: HubStack[]): Promise<void> => {
  state.acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
  state.registry = await ethers.getContractAt(HUB_REGISTRY_ABI, HUB_REGISTRY);
  state.aggregator = await ethers.getContractAt(AUX_AGGREGATOR_ABI, AUX_COMMANDS_AGGREGATOR);
  state.bound = await bindStacks(stacks);
};

// The batches this proposal replays were stored on mainnet by provisionAcmBatches.ts, so the suite
// reads them rather than writing them. Nothing here impersonates a batcher: a simulation that seeds
// its own batches and then deep-compares them is comparing the builder against itself, and a green
// run of that proves only that the encoder is deterministic.
//
// Fails in before() rather than as an assertion so the cause is stated once, instead of surfacing as
// dozens of downstream failures when executeBatch reverts BatchNotFound.
export const requireBatchesOnChain = async (
  aggregator: Contract,
  batches: AcmCommand[][],
  batchIndexBase: number,
): Promise<void> => {
  const batchCount: number = (await aggregator.batchCount()).toNumber();
  const needed = batchIndexBase + batches.length;
  if (batchCount < needed) {
    throw new Error(
      `[vip-650] aggregator holds ${batchCount} batches at this fork block, but the proposal replays ` +
        `indices ${batchIndexBase}..${needed - 1}. Either provisionAcmBatches.ts has not run for this ` +
        "part, or BLOCK_NUMBER is pinned before its seeding transaction.",
    );
  }
};

// ---------------------------------------------------------------------------------------------------
// Upgrade authority. Nothing here is written by the proposal, which is why it is worth asserting: the
// Hubs and sources are BeaconProxy instances, so a beacon owner can replace the implementation behind
// every asset at once. If any were still deployer-owned, the permissions granted below would be worth
// nothing, because the code they gate could be swapped underneath.
// ---------------------------------------------------------------------------------------------------
// keccak256("eip1967.proxy.admin") - 1. The admin slot is only writable by the admin itself, so this
// is the authoritative read.
const EIP1967_ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

export const describeUpgradeAuthority = () => {
  describe("Upgrade authority (pre-existing, not set by this proposal)", () => {
    it("every beacon and the registry's ProxyAdmin is owned by the Normal Timelock", async () => {
      const targets: [string, string][] = [
        ["Hub beacon", HUB_BEACON],
        ["Core beacon", CORE_BEACON],
        ["Flux beacon", FLUX_BEACON],
        ["FRV beacon", FRV_BEACON],
        ["DefaultProxyAdmin", DEFAULT_PROXY_ADMIN],
      ];
      for (const [label, target] of targets) {
        const ownable = await ethers.getContractAt(OWNABLE_ABI, target);
        expect(addr(await ownable.owner())).to.equal(addr(NORMAL_TIMELOCK), `${label} is not Timelock-owned`);
      }
    });

    // Without this the check above is vacuous: it would prove some ProxyAdmin is Timelock-owned, not
    // that the one admining THIS proxy is. The admin slot is the only on-chain authority on that.
    it("the HubRegistry proxy is admined by that ProxyAdmin", async () => {
      const slot = await ethers.provider.getStorageAt(HUB_REGISTRY, EIP1967_ADMIN_SLOT);
      expect(addr(ethers.utils.getAddress(`0x${slot.slice(-40)}`))).to.equal(addr(DEFAULT_PROXY_ADMIN));
    });
  });
};

// ---------------------------------------------------------------------------------------------------
// Batch integrity
// ---------------------------------------------------------------------------------------------------
export const describeAggregatorBatches = (state: SimState, batches: AcmCommand[][], batchIndexBase: number) => {
  describe("Aggregator batches", () => {
    // Everything below reads the chain, so this is what makes the rest mean anything: it fixes that
    // indices batchIndexBase..+len were written by provisionAcmBatches.ts before this fork block, not
    // by the suite itself.
    it(`indices ${batchIndexBase}..${batchIndexBase + batches.length - 1} are already stored on mainnet`, async () => {
      const batchCount: number = (await state.aggregator.batchCount()).toNumber();
      expect(batchCount).to.be.at.least(
        batchIndexBase + batches.length,
        `aggregator holds ${batchCount} batches at this fork block`,
      );
    });

    it("each stored batch is exactly the builder output, call for call", async () => {
      for (let b = 0; b < batches.length; b++) {
        const expected = encodeBatch(batches, b);
        const stored: { target: string; data: string }[] = await state.aggregator.getBatch(batchIndexBase + b);
        expect(stored.length).to.equal(expected.length, `batch ${b} length`);
        for (let i = 0; i < expected.length; i++) {
          expect(addr(stored[i].target)).to.equal(addr(expected[i].target), `batch ${b} call ${i} target`);
          expect(stored[i].data).to.equal(expected[i].data, `batch ${b} call ${i} calldata`);
        }
      }
    });

    it("every batch call targets the ACM, so the aggregator needs no Hub permission", () => {
      for (const c of batches.flat()) {
        expect(addr(c.target)).to.equal(addr(ACM));
        expect(c.signature).to.equal("giveCallPermission(address,string,address)");
      }
    });

    it("the Normal Timelock can call executeBatch", async () => {
      expect(
        await state.acm.hasRole(roleId(AUX_COMMANDS_AGGREGATOR, "executeBatch(uint256)"), NORMAL_TIMELOCK),
      ).to.equal(true);
    });
  });
};

// ---------------------------------------------------------------------------------------------------
// Permission matrix shape — pure assertions on the builder output, no chain access.
// ---------------------------------------------------------------------------------------------------
export const describePermissionMatrix = (
  batches: AcmCommand[][],
  opts: { stacks: HubStack[]; registrySigCount: number },
) => {
  const grants = flattenGrants(batches);
  const { stacks, registrySigCount } = opts;
  const stackCount = stacks.length;

  describe("Permission matrix shape", () => {
    // Set equality in both directions, so it catches a grant aimed somewhere outside this stack (a
    // hard-coded address, a leftover adapter, the other part's stack) and a target that is missing.
    // It does NOT validate the address book — both sides dereference the same HubStack objects. The
    // book is checked against the chain in describeStacksUntouched.
    it("grants touch only this proposal's own contracts, and only the three intended holders", () => {
      const expectedTargets = stacks.flatMap(s => [s.hub, s.core, s.flux, s.frv]);
      if (registrySigCount > 0) expectedTargets.push(HUB_REGISTRY);

      const actualTargets = [...new Set(grants.map(g => addr(g.contract)))].sort();
      expect(actualTargets).to.deep.equal([...new Set(expectedTargets.map(addr))].sort());

      const actualHolders = [...new Set(grants.map(g => addr(g.account)))].sort();
      expect(actualHolders).to.deep.equal([NORMAL_TIMELOCK, GUARDIAN, OPERATOR].map(addr).sort());
    });

    it(`grants 77 roles per stack plus ${registrySigCount} on the registry`, () => {
      expect(grants.length).to.equal(77 * stackCount + registrySigCount);
      expect(grantsFor(grants, NORMAL_TIMELOCK).length).to.equal(49 * stackCount + registrySigCount);
      expect(grantsFor(grants, GUARDIAN).length).to.equal(7 * stackCount);
      expect(grantsFor(grants, OPERATOR).length).to.equal(21 * stackCount);
    });

    it("splits into one batch per asset, registry grants riding in the first", () => {
      expect(batches.length).to.equal(stackCount);
      expect(batches[0].length).to.equal(77 + registrySigCount);
      for (let b = 1; b < stackCount; b++) expect(batches[b].length).to.equal(77);
    });

    it("contains no duplicate (contract, sig, account) entry", () => {
      const keys = grants.map(g => `${addr(g.contract)}|${g.sig}|${addr(g.account)}`);
      expect(new Set(keys).size).to.equal(grants.length);
    });

    it("grants nothing to the Critical or Fast-Track Timelocks", () => {
      expect(grantsFor(grants, CRITICAL_TIMELOCK).length).to.equal(0);
      expect(grantsFor(grants, FAST_TRACK_TIMELOCK).length).to.equal(0);
    });

    it("grants the operator-only reallocate role to the Operator alone", () => {
      const reallocateGrantees = [...new Set(grants.filter(g => g.sig === REALLOCATE).map(g => addr(g.account)))];
      expect(reallocateGrantees).to.deep.equal([addr(OPERATOR)]);
    });
  });
};

// ---------------------------------------------------------------------------------------------------
// Pre-VIP state for stacks this proposal has not touched yet. `grantsExpectedAbsent` is explicit
// rather than derived from the batches, because part 2 re-grants `addHub`, which part 1 has already
// granted by the time part 2 runs.
// ---------------------------------------------------------------------------------------------------
export const describeStacksUntouched = (
  state: SimState,
  opts: { title: string; stacks: HubStack[]; grantsExpectedAbsent: Grant[]; registryAccepted: boolean },
) => {
  const { title, stacks, grantsExpectedAbsent, registryAccepted } = opts;
  const underTest = () => boundSubset(state, stacks);

  describe(title, () => {
    it(`every Hub is pending-owned by the Normal Timelock, and the HubRegistry is ${
      registryAccepted ? "already owned by it" : "pending-owned by it (not yet accepted)"
    }`, async () => {
      if (registryAccepted) {
        expect(addr(await state.registry.owner())).to.equal(addr(NORMAL_TIMELOCK));
        expect(addr(await state.registry.pendingOwner())).to.equal(addr(ZERO));
      } else {
        expect(addr(await state.registry.pendingOwner())).to.equal(addr(NORMAL_TIMELOCK));
        expect(addr(await state.registry.owner())).to.not.equal(addr(NORMAL_TIMELOCK));
      }
      for (const { hub } of underTest()) {
        expect(addr(await hub.pendingOwner())).to.equal(addr(NORMAL_TIMELOCK));
        expect(addr(await hub.owner())).to.not.equal(addr(NORMAL_TIMELOCK));
      }
    });

    it("every contract is already bound to the canonical ACM", async () => {
      // The sources are the load-bearing half: YieldGroupBase is not Ownable and has no ACM setter,
      // so a wrong value there is unreachable by governance and must block the proposal. The Hub and
      // registry inherit AccessControlledV8 and are repairable once ownership is accepted, but are
      // asserted too, to catch a mis-bound stack before launch.
      const contracts: Contract[] = [state.registry];
      for (const { hub, core, flux, frv } of underTest()) contracts.push(hub, core, flux, frv);
      for (const c of contracts) {
        expect(addr(await c.accessControlManager())).to.equal(addr(ACM));
      }
    });

    it("every Hub carries the deploy-time parameters this proposal relies on", async () => {
      // Set at initialize() and not by this proposal, but its safety rests on them:
      //   - decimals 24 = 18 asset decimals + offset 6. The offset is the on-chain defence against a
      //     first-deposit inflation attack; the bootstrap seed alone would not cover a wrong one.
      //   - maxWithdrawalSize bounds every redemption. Operator-lowerable, governance-raisable.
      //   - feeRecipient is inert at 0/0/0 fees and goes live the moment governance enables them, so
      //     a wrong value here silently misdirects future revenue.
      for (const { s, hub } of underTest()) {
        expect(await hub.decimals()).to.equal(EXPECTED_DECIMALS, `${s.key}: decimals`);
        expect((await hub.maxWithdrawalSize()).toString()).to.equal(
          EXPECTED_MAX_WITHDRAWAL_SIZE.toString(),
          `${s.key}: maxWithdrawalSize`,
        );
        expect(addr(await hub.feeRecipient())).to.equal(addr(VTREASURY), `${s.key}: feeRecipient`);
        expect(await hub.name()).to.equal(`Venus Hub ${s.key}`, `${s.key}: name`);
        expect(await hub.symbol()).to.equal(`vh${s.key}`, `${s.key}: symbol`);
      }
    });

    it("every source is bound to its own Hub and asset", async () => {
      for (const { s, hub, core, flux, frv } of underTest()) {
        for (const src of [core, flux, frv]) {
          expect(addr(await src.hub())).to.equal(addr(s.hub));
          expect(addr(await src.asset())).to.equal(addr(s.asset));
        }
        expect(addr(await hub.asset())).to.equal(addr(s.asset));
      }
    });

    it("nobody holds any of the roles this proposal is expected to introduce", async () => {
      for (const g of grantsExpectedAbsent) {
        expect(await state.acm.hasRole(roleId(g.contract, g.sig), g.account)).to.equal(
          false,
          `pre ${g.contract} ${g.sig} ${g.account}`,
        );
      }
    });

    it("the aggregator does not hold DEFAULT_ADMIN_ROLE", async () => {
      expect(await state.acm.hasRole(DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR)).to.equal(false);
    });

    it("every Hub is unregistered, unwired and holds no yield groups", async () => {
      for (const { s, hub, core, flux, frv } of underTest()) {
        expect(await state.registry.isHub(s.hub)).to.equal(false);
        expect(addr(await state.registry.hubForAsset(s.asset))).to.equal(addr(ZERO));
        expect(await hub.registeredYieldGroups()).to.deep.equal([]);
        for (const src of [core, flux, frv]) {
          expect(await src.resources()).to.deep.equal([]);
        }
      }
    });

    it("every Hub is empty, so the bootstrap deposit really is the first one", async () => {
      for (const { hub } of underTest()) {
        expect((await hub.totalSupply()).toString()).to.equal("0");
        expect((await hub.balanceOf(BOOTSTRAP_RECEIVER)).toString()).to.equal("0");
      }
    });

    it("the Timelock can withdraw from the Treasury: withdrawTreasuryBEP20 is onlyOwner, owner is the Timelock", async () => {
      // Not ACM-gated, so no giveCallPermission is needed for it anywhere in this proposal. If the
      // Treasury owner were ever moved, the bootstrap commands would revert at execute.
      const treasury = await ethers.getContractAt(VTREASURY_ABI, VTREASURY);
      expect(addr(await treasury.owner())).to.equal(addr(NORMAL_TIMELOCK));
    });

    it("the Treasury holds at least the seed of every asset", async () => {
      // withdrawTreasuryBEP20 clamps to the treasury balance instead of reverting, and the Timelock
      // already holds some of these assets — so a short Treasury could still let the deposit succeed
      // out of the Timelock's own funds. Assert the source.
      for (const { s } of underTest()) {
        const token = await ethers.getContractAt(ERC20_ABI, s.asset);
        expect(await token.balanceOf(VTREASURY)).to.be.gte(
          BOOTSTRAP_SEED,
          `treasury short of ${s.key}: has ${(await token.balanceOf(VTREASURY)).toString()}, needs ${BOOTSTRAP_SEED}`,
        );
        // All three assets are 18-dec, which is what makes one shared BOOTSTRAP_SEED constant correct.
        expect(await token.decimals()).to.equal(18);
      }
    });
  });
};

// ---------------------------------------------------------------------------------------------------
// Event counts this proposal must produce. `expectedRoleGrants` is explicit rather than grants.length
// because a re-granted role emits nothing (OZ's _grantRole is guarded by `if (!hasRole(...))`). Part
// 2's count is therefore one below its batch length, which turns the no-op into a proof.
// ---------------------------------------------------------------------------------------------------
export const makeExecutionCallback =
  (opts: { stacks: HubStack[]; expectedRoleGrants: number; acceptsRegistry: boolean }) =>
  async (txResponse: TransactionResponse) => {
    const { stacks, expectedRoleGrants, acceptsRegistry } = opts;
    const stackCount = stacks.length;

    // One RoleGranted per landed grant, plus one for the aggregator's DEFAULT_ADMIN_ROLE, which is
    // taken back in the same transaction. The deployed ACM emits no PermissionGranted, so RoleGranted
    // is the only count available; the hasRole checks below verify each permission individually.
    await expectEvents(
      txResponse,
      [ACCESS_CONTROL_MANAGER_ABI],
      ["RoleGranted", "RoleRevoked"],
      [expectedRoleGrants + 1, 1],
    );

    // One Ownable2Step transfer per Hub, plus the registry in the part that accepts it. expectEvents
    // counts by name without filtering the emitter, so one ABI covers both.
    await expectEvents(
      txResponse,
      [HUB_ABI],
      ["OwnershipTransferred", "YieldGroupAdded"],
      [stackCount + (acceptsRegistry ? 1 : 0), 3 * stackCount],
    );
    await expectEvents(txResponse, [HUB_REGISTRY_ABI], ["HubAdded"], [stackCount]);
    // Core and Flux only — FRV gets no resource in this proposal.
    await expectEvents(txResponse, [YIELD_GROUP_ABI], ["ResourceAdded"], [2 * stackCount]);
    // One bootstrap deposit per Hub.
    await expectEvents(txResponse, [HUB_ABI], ["Deposit"], [stackCount]);

    const receipt = await txResponse.wait();

    // Where each seed went. `DepositRouted` is declared by both IHub and IYieldGroupBase with the
    // same signature, so the two layers share a topic0 and a plain count cannot separate them. Count
    // by emitter instead.
    const topicDepositRouted = new ethers.utils.Interface(HUB_ABI).getEventTopic("DepositRouted");
    const routedBy = (a: string) =>
      receipt.logs.filter(l => l.topics[0] === topicDepositRouted && addr(l.address) === addr(a)).length;
    for (const s of stacks) {
      // Core is first in the deposit queue with its percentage cap disabled, so its 2e9 absolute cap
      // leaves room for the whole seed. A second Hub-level event would mean the seed split.
      expect(routedBy(s.hub)).to.equal(1, `${s.key}: hub routed the seed to more than one yield group`);
      expect(routedBy(s.core)).to.equal(1, `${s.key}: core did not take the seed into exactly one resource`);
      // The cascade never reaches Flux, and FRV is off the deposit queue. Note Flux's effective cap
      // here is 2 tokens, not 0: _routeDeposit snapshots totalAssets() after the seed is transferred
      // in. Core taking the whole amount first is what keeps Flux empty.
      expect(routedBy(s.flux)).to.equal(0, `${s.key}: flux received part of the seed`);
      expect(routedBy(s.frv)).to.equal(0, `${s.key}: frv received part of the seed`);
    }

    // Every addHub is emitted before any addYieldGroup. IHubRegistry is explicit that this is a VIP
    // convention and "a latency optimization only, NOT a correctness requirement" — indexers MUST
    // seed from state on HubAdded. Asserted because a silent reshuffle is worth knowing about.
    const topicHubAdded = new ethers.utils.Interface(HUB_REGISTRY_ABI).getEventTopic("HubAdded");
    const topicYieldGroupAdded = new ethers.utils.Interface(HUB_ABI).getEventTopic("YieldGroupAdded");
    const hubAddedIdx = receipt.logs.filter(l => l.topics[0] === topicHubAdded).map(l => l.logIndex);
    const yieldGroupAddedIdx = receipt.logs.filter(l => l.topics[0] === topicYieldGroupAdded).map(l => l.logIndex);
    expect(hubAddedIdx.length).to.equal(stackCount);
    expect(yieldGroupAddedIdx.length).to.equal(3 * stackCount);
    expect(Math.max(...hubAddedIdx)).to.be.lessThan(Math.min(...yieldGroupAddedIdx));
  };

// ---------------------------------------------------------------------------------------------------
// Post-VIP assertions
// ---------------------------------------------------------------------------------------------------
export const describePostVipPermissions = (state: SimState, batches: AcmCommand[][], stacks: HubStack[]) => {
  const grants = flattenGrants(batches);

  // Everything the Normal Timelock gets that the Guardian deliberately does not. A set difference, so
  // it stays correct if permissions.ts changes.
  const withheldFromGuardian: [string, string][] = stacks
    .flatMap((s): [string, string][] => [
      ...HUB_GOVERNANCE.filter(x => !HUB_GUARDIAN.includes(x)).map((x): [string, string] => [s.hub, x]),
      ...CORE_FLUX_GOVERNANCE.filter(x => !CORE_FLUX_GUARDIAN.includes(x)).map((x): [string, string] => [s.core, x]),
      ...CORE_FLUX_GOVERNANCE.filter(x => !CORE_FLUX_GUARDIAN.includes(x)).map((x): [string, string] => [s.flux, x]),
      ...FRV_GOVERNANCE.filter(x => !FRV_GUARDIAN.includes(x)).map((x): [string, string] => [s.frv, x]),
    ])
    .concat(HUB_REGISTRY_GOVERNANCE.map((x): [string, string] => [HUB_REGISTRY, x]));

  describe("Post-VIP permissions", () => {
    it("every grant landed", async () => {
      for (const g of grants) {
        expect(await state.acm.hasRole(roleId(g.contract, g.sig), g.account)).to.equal(
          true,
          `post ${g.contract} ${g.sig} ${g.account}`,
        );
      }
    });

    it("the aggregator no longer holds DEFAULT_ADMIN_ROLE", async () => {
      expect(await state.acm.hasRole(DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR)).to.equal(false);
    });

    it("the Guardian holds none of the roles reserved to the Normal Timelock", async () => {
      for (const [c, s] of withheldFromGuardian) {
        expect(await state.acm.hasRole(roleId(c, s), GUARDIAN)).to.equal(false, `guardian ${c} ${s}`);
      }
    });

    it("no timelock holds the operator-only reallocate role on any Hub", async () => {
      for (const s of stacks) {
        expect(await state.acm.hasRole(roleId(s.hub, REALLOCATE), NORMAL_TIMELOCK)).to.equal(false);
        expect(await state.acm.hasRole(roleId(s.hub, REALLOCATE), GUARDIAN)).to.equal(false);
        expect(await state.acm.hasRole(roleId(s.hub, REALLOCATE), CRITICAL_TIMELOCK)).to.equal(false);
      }
    });

    it("the Operator holds nothing outside its own set", async () => {
      const held = new Set(grantsFor(grants, OPERATOR).map(g => `${addr(g.contract)}|${g.sig}`));
      const everythingElse = grants.filter(g => !held.has(`${addr(g.contract)}|${g.sig}`));
      for (const g of everythingElse) {
        expect(await state.acm.hasRole(roleId(g.contract, g.sig), OPERATOR)).to.equal(
          false,
          `operator ${g.contract} ${g.sig}`,
        );
      }
    });

    it("neither the Critical nor the Fast-Track Timelock holds anything at all", async () => {
      // Both are deliberately empty-handed on the Hub stack. Fast-Track matters as much as Critical
      // here: it can execute with only a 6-hour delay, so a stray grant would materially shorten the
      // notice period on anything it could reach.
      for (const g of grants) {
        expect(await state.acm.hasRole(roleId(g.contract, g.sig), CRITICAL_TIMELOCK)).to.equal(
          false,
          `critical ${g.contract} ${g.sig}`,
        );
        expect(await state.acm.hasRole(roleId(g.contract, g.sig), FAST_TRACK_TIMELOCK)).to.equal(
          false,
          `fast-track ${g.contract} ${g.sig}`,
        );
      }
    });
  });
};

// `registeredStacks` is every stack expected in the registry at this point, which after part 2 is the
// full launch set — not just the stacks this proposal onboarded.
export const describePostVipOwnershipAndRegistration = (
  state: SimState,
  opts: { stacks: HubStack[]; registeredStacks: HubStack[] },
) => {
  const { stacks, registeredStacks } = opts;
  const underTest = () => boundSubset(state, stacks);

  describe("Post-VIP ownership and registration", () => {
    it("every Hub and the HubRegistry are now owned by the Normal Timelock, no pending transfer", async () => {
      expect(addr(await state.registry.owner())).to.equal(addr(NORMAL_TIMELOCK));
      expect(addr(await state.registry.pendingOwner())).to.equal(addr(ZERO));
      for (const { hub } of underTest()) {
        expect(addr(await hub.owner())).to.equal(addr(NORMAL_TIMELOCK));
        expect(addr(await hub.pendingOwner())).to.equal(addr(ZERO));
      }
    });

    it(`the registry holds ${registeredStacks.length} Hub(s), both directions`, async () => {
      expect((await state.registry.getHubsCount()).toNumber()).to.equal(registeredStacks.length);
      for (const s of registeredStacks) {
        expect(await state.registry.isHub(s.hub)).to.equal(true);
        expect(addr(await state.registry.hubForAsset(s.asset))).to.equal(addr(s.hub));
        expect(addr(await state.registry.assetForHub(s.hub))).to.equal(addr(s.asset));
      }
    });
  });
};

export const describePostVipWiring = (state: SimState, stacks: HubStack[]) => {
  const underTest = () => boundSubset(state, stacks);

  describe("Post-VIP wiring", () => {
    it("each Hub has all three yield groups registered, unpaused, at their configured caps", async () => {
      for (const { s, hub } of underTest()) {
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

    it("each Hub routes deposits [Core, Flux] and withdrawals [Flux, Core, FRV]", async () => {
      for (const { s, hub } of underTest()) {
        expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal([s.core, s.flux].map(addr));
        // FRV is last: it holds nothing withdrawable, so the loop's `remaining > 0` guard normally
        // breaks before reaching it. It is present so the queue can never be griefed into a state the
        // Operator cannot reorder — see describeWithdrawQueueGriefing below.
        expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal([s.flux, s.core, s.frv].map(addr));
      }
    });

    it("Core and Flux each hold their resource behind the right adapter, with matching inner queues", async () => {
      for (const { s, core, flux } of underTest()) {
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

    it("every FRV group is registered but unwired, out of the deposit queue and last in the withdraw queue", async () => {
      for (const { s, hub, frv } of underTest()) {
        expect(await frv.resources()).to.deep.equal([]);
        expect((await frv.innerDepositQueue()).length).to.equal(0);
        expect((await frv.innerWithdrawQueue()).length).to.equal(0);
        // Out of the deposit queue: with no resource there is nothing to route into.
        expect((await hub.outerDepositQueue()).map(addr)).to.not.include(addr(s.frv));
        // In the withdraw queue, and specifically LAST.
        const withdrawQueue = (await hub.outerWithdrawQueue()).map(addr);
        expect(withdrawQueue[withdrawQueue.length - 1]).to.equal(addr(s.frv));
        expect((await frv.totalAssets()).toString()).to.equal("0");
      }
    });

    it("every Hub advertises deposit capacity and launches unpaused with fees at 0/0/0", async () => {
      for (const { hub } of underTest()) {
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
};

export const describePostVipBootstrap = (state: SimState, stacks: HubStack[]) => {
  const underTest = () => boundSubset(state, stacks);

  describe("Post-VIP bootstrap deposit", () => {
    it("every Hub is seeded and can never fall back to a zero supply", async () => {
      for (const { hub } of underTest()) {
        // Shares went to the burn address, so totalSupply has no redeemable path back to 0 and the
        // `_deposit` refill-from-empty branch can never re-run for a later depositor.
        const deadShares = await hub.balanceOf(BOOTSTRAP_RECEIVER);
        expect(deadShares).to.be.gt(0);
        expect((await hub.totalSupply()).toString()).to.equal(deadShares.toString());
      }
    });

    it("each seed landed in Core, priced at the launch PPS", async () => {
      for (const { hub, core, flux, frv } of underTest()) {
        // The seed routes to the first unpaused queue member with room, which is Core. See the note
        // in makeExecutionCallback on why Flux's effective cap here is 2 tokens, not 0.
        expect(await core.totalAssets()).to.be.gt(0);
        expect((await flux.totalAssets()).toString()).to.equal("0");
        expect((await frv.totalAssets()).toString()).to.equal("0");

        // Core's adapter may round the deposit down by dust on the way into the vToken, so assert the
        // Hub's NAV is within 1 unit below the seed rather than exactly equal.
        const ta = await hub.totalAssets();
        expect(ta).to.be.lte(BOOTSTRAP_SEED);
        expect(ta).to.be.gt(ethers.BigNumber.from(BOOTSTRAP_SEED).sub(ethers.utils.parseUnits("1", 18)));

        // decimalsOffset 6: the first deposit mints assets x 10^6 shares, i.e. launch PPS =
        // 1e18 / 1e6. This is the inflation defence the Hub's initializer enforces (offset 0 is
        // rejected on-chain); the bootstrap deposit is the belt to that pair of braces.
        expect(await hub.decimals()).to.equal(24);
        expect((await hub.totalSupply()).toString()).to.equal(
          ethers.BigNumber.from(BOOTSTRAP_SEED).mul(1_000_000).toString(),
        );
      }
    });

    it("the Timelock keeps no leftover balance or allowance from the seeding", async () => {
      for (const { s, hub } of underTest()) {
        const token = await ethers.getContractAt(ERC20_ABI, s.asset);
        // The approval was for exactly the seed and the deposit consumed all of it. A residual
        // allowance would leave the Hub standing permission to pull the Timelock's other holdings.
        expect((await token.allowance(NORMAL_TIMELOCK, s.hub)).toString()).to.equal("0");
        // The Hub holds no idle asset: the seed was routed straight out to Core, not parked.
        expect((await token.balanceOf(hub.address)).toString()).to.equal("0");
      }
    });
  });
};

// ---------------------------------------------------------------------------------------------------
// End-to-end behaviour. Everything above asserts configuration — that the VIP wrote what it claimed.
// This asserts that a user can put money in and get it back, that the Operator can rebalance, and that
// the permission split bites at the contract level and not only in the ACM's bookkeeping.
//
// The `it`s are ORDERED and share one position per stack: deposit -> reallocate -> partial withdraw ->
// full exit -> admin levers. They mutate state, so call this near the end of a simulation file.
// ---------------------------------------------------------------------------------------------------

// A fresh EOA with no history on any of these Hubs, so balances start at exactly 0.
const E2E_USER = ethers.utils.getAddress("0x00000000000000000000000000000000000e2e01");

const E2E_DEPOSIT = ethers.utils.parseUnits("10000", 18);
// Comfortably inside Flux's effective cap, which is min(7,000,000, 20% x TVL) — about 2,002 at a TVL
// of ~10,010 — so the push leg is bound by policy we control, not by an incidental cap.
const E2E_REALLOCATE = ethers.utils.parseUnits("1000", 18);
// Deliberately larger than the amount parked in Flux, so the withdraw walks [Flux, Core, FRV] and has
// to draw from two YieldGroups rather than being served entirely by the first.
const E2E_PARTIAL_WITHDRAW = ethers.utils.parseUnits("2500", 18);
// Adapter conversions round down on the way in and out. One whole token is far above any real
// rounding delta and far below anything that would indicate a routing bug.
const E2E_DUST = ethers.utils.parseUnits("1", 18);

// A preview is read one block before the call that consumes it, and the vTokens accrue every block,
// so exact equality is not achievable on a live fork. Residual drift after freshening is ~1e-9; one
// basis point sits far above that and far below any real mispricing (wrong decimals offset, a fee
// applied when fees are off, an inverted conversion).
const previewToleranceBps = 1;
const expectNearPreview = (actual: BigNumber, preview: BigNumber, label: string) => {
  const tolerance = preview.mul(previewToleranceBps).div(10_000).add(1);
  expect(actual).to.be.gte(preview.sub(tolerance), `${label} (below preview by more than 1 bps)`);
  expect(actual).to.be.lte(preview.add(tolerance), `${label} (above preview by more than 1 bps)`);
};

export const describeEndToEnd = (state: SimState, stacks: HubStack[]) => {
  const underTest = () => boundSubset(state, stacks);
  const token = (asset: string) => ethers.getContractAt(ERC20_ABI, asset);

  describe("Post-VIP end-to-end", () => {
    it("a user can deposit: shares match previewDeposit and the assets leave the Hub for a yield source", async () => {
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));
      const funder = await initMainnetUser(VTREASURY, ethers.utils.parseEther("1"));

      for (const { s, hub, core } of underTest()) {
        const asset = await token(s.asset);
        await asset.connect(funder).transfer(E2E_USER, E2E_DEPOSIT);
        await asset.connect(user).approve(s.hub, E2E_DEPOSIT);

        // Freshen before quoting. deposit/withdraw/redeem all accrue the underlying vToken before
        // pricing, so a preview read against a stale exchange rate is systematically high — over a
        // simulated governance cycle, by basis points. accrueFees() is a permissionless poke that
        // does the same freshening, so the quote compares like with like.
        await hub.connect(user).accrueFees();

        const navBefore = await hub.totalAssets();
        const coreBefore = await core.totalAssets();
        const quoted = await hub.previewDeposit(E2E_DEPOSIT);

        await hub.connect(user).deposit(E2E_DEPOSIT, E2E_USER);

        // ERC-4626's core promise: the quote is what you get.
        expectNearPreview(await hub.balanceOf(E2E_USER), quoted, `${s.key}: shares vs previewDeposit`);

        // NAV rose by the deposit, bar adapter rounding down and a block of accrual up.
        const navDelta = (await hub.totalAssets()).sub(navBefore);
        expect(navDelta).to.be.lte(E2E_DEPOSIT.add(E2E_DUST), `${s.key}: NAV rose by more than deposited`);
        expect(navDelta).to.be.gt(E2E_DEPOSIT.sub(E2E_DUST), `${s.key}: NAV rose by less than deposited`);

        // "Increased" rather than "took all of it": Core's maxDeposit is bounded by the underlying
        // market's supply cap, which is fork state. Exact all-to-Core routing is proven on the seed.
        expect(await core.totalAssets()).to.be.gt(coreBefore, `${s.key}: nothing reached Core`);

        // The Hub is a router, not a custodian: it parks nothing.
        expect((await asset.balanceOf(s.hub)).toString()).to.equal("0", `${s.key}: Hub holds idle asset`);
      }
    });

    it("the Operator can reallocate Core -> Flux without changing NAV", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));

      for (const { s, hub, core, flux } of underTest()) {
        const navBefore = await hub.totalAssets();
        const coreBefore = await core.totalAssets();
        const fluxBefore = await flux.totalAssets();

        await hub
          .connect(operator)
          .reallocate(
            [{ yieldGroup: s.core, resource: s.vToken, amount: E2E_REALLOCATE }],
            [{ yieldGroup: s.flux, resource: s.fToken, amount: E2E_REALLOCATE }],
          );

        expect(await core.totalAssets()).to.be.lt(coreBefore, `${s.key}: Core did not give up funds`);
        expect(await flux.totalAssets()).to.be.gt(fluxBefore, `${s.key}: Flux did not receive funds`);

        // reallocate enforces `sum(withdraws) == sum(deposits)`, so NAV must be flat bar rounding.
        // This is the assertion that would catch a leg silently under- or over-filling.
        const nav = await hub.totalAssets();
        expect(nav).to.be.lte(navBefore.add(E2E_DUST), `${s.key}: reallocate created value`);
        expect(nav).to.be.gte(navBefore.sub(E2E_DUST), `${s.key}: reallocate destroyed value`);
      }
    });

    it("a user can withdraw across two yield sources in one call", async () => {
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));

      for (const { s, hub, core, flux } of underTest()) {
        const asset = await token(s.asset);
        await hub.connect(user).accrueFees(); // freshen before quoting — see the deposit test
        const sharesBefore = await hub.balanceOf(E2E_USER);
        const walletBefore = await asset.balanceOf(E2E_USER);
        const coreBefore = await core.totalAssets();
        const fluxBefore = await flux.totalAssets();

        // Both preconditions are required. These `it`s share state, so Flux only holds anything
        // because the reallocate above put it there; without the gt(0) guard this passes vacuously.
        expect(fluxBefore).to.be.gt(0, `${s.key}: Flux holds nothing, the cascade is untested`);
        expect(fluxBefore).to.be.lt(E2E_PARTIAL_WITHDRAW, `${s.key}: Flux alone could cover this`);

        const quoted = await hub.previewWithdraw(E2E_PARTIAL_WITHDRAW);

        await hub.connect(user).withdraw(E2E_PARTIAL_WITHDRAW, E2E_USER, E2E_USER);

        // Withdraw is asset-exact: the caller receives precisely what they asked for.
        expect((await asset.balanceOf(E2E_USER)).sub(walletBefore)).to.equal(
          E2E_PARTIAL_WITHDRAW,
          `${s.key}: did not receive the requested assets`,
        );

        // The claim in this test's name, asserted rather than implied. _tryWithdrawOneYieldGroup
        // returns 0 with no revert and no event when a group's maxWithdraw() is 0, and Flux sits on
        // an external liquidity layer that can legitimately return 0 — so without these two the test
        // passes with Core silently serving the whole amount.
        //
        // Flux must be EXHAUSTED, not merely reduced: it is first in the queue and holds less than
        // was asked for, so the ordering guarantees it is drained before Core is touched.
        expect(await flux.totalAssets()).to.be.lte(E2E_DUST, `${s.key}: Flux was skipped, not drained`);
        expect(await core.totalAssets()).to.be.lt(coreBefore, `${s.key}: Core did not cover the remainder`);
        expectNearPreview(
          sharesBefore.sub(await hub.balanceOf(E2E_USER)),
          quoted,
          `${s.key}: burned shares vs previewWithdraw`,
        );
      }
    });

    it("a user can exit completely and gets their principal back", async () => {
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));

      for (const { s, hub } of underTest()) {
        const asset = await token(s.asset);
        await hub.connect(user).accrueFees(); // freshen before quoting — see the deposit test
        const shares = await hub.maxRedeem(E2E_USER);
        // Nothing is clamping the exit: not liquidity, not the 10,000,000 per-transaction cap. Hub.sol
        // documents redeem(maxRedeem(owner)) as the safe full-exit call (maxWithdraw can shrink on fee
        // accrual, maxRedeem cannot), which is why the exit is share-denominated here.
        expect(shares).to.equal(await hub.balanceOf(E2E_USER), `${s.key}: full exit is clamped`);

        const quoted = await hub.previewRedeem(shares);
        const walletBefore = await asset.balanceOf(E2E_USER);

        await hub.connect(user).redeem(shares, E2E_USER, E2E_USER);

        expectNearPreview(
          (await asset.balanceOf(E2E_USER)).sub(walletBefore),
          quoted,
          `${s.key}: payout vs previewRedeem`,
        );
        expect((await hub.balanceOf(E2E_USER)).toString()).to.equal("0", `${s.key}: shares left over`);

        // Round trip: deposited E2E_DEPOSIT, took it all back out across a withdraw and a redeem.
        // Fees launch at 0/0/0, so the only deltas are adapter rounding (down) and the few blocks of
        // yield these transactions span (up). Bounded on both sides rather than asserting equality.
        const net = await asset.balanceOf(E2E_USER);
        expect(net).to.be.gte(E2E_DEPOSIT.sub(E2E_DUST), `${s.key}: user lost value on a round trip`);
        expect(net).to.be.lte(E2E_DEPOSIT.add(E2E_DUST), `${s.key}: user gained unexplained value`);

        // The Hub is back to exactly the burned bootstrap seed — it never returns to a zero supply.
        expect((await hub.totalSupply()).toString()).to.equal(
          (await hub.balanceOf(BOOTSTRAP_RECEIVER)).toString(),
          `${s.key}: supply is not just the seed`,
        );
      }
    });

    it("the Guardian can pause, but only the Timelock can unpause", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));

      for (const { s, hub } of underTest()) {
        await hub.connect(guardian).pauseHub();
        expect(await hub.hubPaused()).to.equal(true, `${s.key}: Guardian could not pause`);

        // A pause is real containment, not a flag: the quantity gate closes and the entry point
        // reverts.
        expect((await hub.maxDeposit(E2E_USER)).toString()).to.equal("0", `${s.key}: still advertising capacity`);
        await expect(hub.connect(user).deposit(1, E2E_USER)).to.be.revertedWithCustomError(hub, "HubPaused");

        // The asymmetry that makes the Guardian safe to hand to a fast multisig: it can contain, but
        // it can never undo a governance-ordered pause. Same for the Operator.
        await expect(hub.connect(guardian).unpauseHub()).to.be.revertedWithCustomError(hub, "Unauthorized");
        await expect(hub.connect(operator).unpauseHub()).to.be.revertedWithCustomError(hub, "Unauthorized");

        await hub.connect(timelock).unpauseHub();
        expect(await hub.hubPaused()).to.equal(false, `${s.key}: Timelock could not unpause`);
        expect(await hub.maxDeposit(E2E_USER)).to.be.gt(0, `${s.key}: capacity did not come back`);
      }
    });

    it("the Operator can retune caps but cannot touch fees, and the Guardian cannot touch queues", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      const lowered = ethers.BigNumber.from(FLUX_ABSOLUTE_CAP).sub(ethers.utils.parseUnits("1000000", 18));

      for (const { s, hub } of underTest()) {
        // Lower then restore. Both directions are monotonic and reject a no-op, so this exercises the
        // real setter rather than a value that happens to already be stored.
        await hub.connect(operator).lowerYieldGroupCap(s.flux, lowered, FLUX_PERCENTAGE_CAP_BPS);
        expect((await hub.yieldGroupConfig(s.flux)).absoluteCap.toString()).to.equal(lowered.toString());

        await hub.connect(operator).raiseYieldGroupCap(s.flux, FLUX_ABSOLUTE_CAP, FLUX_PERCENTAGE_CAP_BPS);
        expect((await hub.yieldGroupConfig(s.flux)).absoluteCap.toString()).to.equal(FLUX_ABSOLUTE_CAP.toString());

        // Loosening economics is governance-only: the keeper cannot start charging users.
        await expect(hub.connect(operator).setManagementFeeBps(1)).to.be.revertedWithCustomError(hub, "Unauthorized");
        // And the emergency multisig cannot quietly re-route the vault.
        await expect(
          hub.connect(guardian).setOuterWithdrawQueue([s.flux, s.core, s.frv]),
        ).to.be.revertedWithCustomError(hub, "Unauthorized");
      }
    });
  });
};

// ---------------------------------------------------------------------------------------------------
// Regression test for why FRV is in the withdraw queue at all. `setOuterWithdrawQueue` rejects a queue
// omitting a registered group with totalAssets() > 0, and totalAssets() counts idle balance — so had
// the VIP left FRV out, a 1 wei transfer would permanently block the Operator from reordering.
//
// Mutates state (a donation, then queue rewrites), so call it LAST. Restores the queue it found.
// ---------------------------------------------------------------------------------------------------
export const describeWithdrawQueueGriefing = (state: SimState, stacks: HubStack[]) => {
  const underTest = () => boundSubset(state, stacks);

  describe("Post-VIP withdraw-queue griefing resistance", () => {
    it("a 1 wei donation to FRV cannot block the Operator from reordering the queue", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      const donor = await initMainnetUser(VTREASURY, ethers.utils.parseEther("1"));

      for (const { s, hub, frv } of underTest()) {
        const before = (await hub.outerWithdrawQueue()).map(addr);

        // The attack: make the FRV group look funded for 1 wei. No permission needed, no adapter
        // involved — a bare ERC-20 transfer is enough, because totalAssets() counts idle balance.
        const token = await ethers.getContractAt(ERC20_ABI, s.asset);
        await token.connect(donor).transfer(s.frv, 1);
        expect((await frv.totalAssets()).toString()).to.equal("1", `${s.key}: donation did not register`);

        // With FRV in the queue there is no omission for the coverage guard to reject, so the Operator
        // can still reorder freely.
        await hub.connect(operator).setOuterWithdrawQueue([s.core, s.flux, s.frv]);
        expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal([s.core, s.flux, s.frv].map(addr));

        // And this is what the VIP would have been stuck with had it omitted FRV: the same reorder
        // minus FRV is now permanently rejected, naming the FRV group. This assertion is the proof
        // that the inclusion is load-bearing rather than cosmetic.
        await expect(hub.connect(operator).setOuterWithdrawQueue([s.flux, s.core]))
          .to.be.revertedWithCustomError(hub, "WithdrawQueueOmitsFundedYieldGroup")
          .withArgs(s.frv);

        // The dust is recoverable, not stranded: maxWithdraw() includes idle balance, and withdraw()
        // spends idle before touching the inner queue, so a redemption reaching FRV sweeps it out.
        expect((await frv.maxWithdraw()).toString()).to.equal("1", `${s.key}: donated wei is stranded`);

        await hub.connect(operator).setOuterWithdrawQueue(before);
        expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal(before);
      }
    });
  });
};
