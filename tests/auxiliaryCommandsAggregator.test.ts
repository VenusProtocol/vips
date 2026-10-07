import { SnapshotRestorer, setCode, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import hre, { ethers } from "hardhat";
import sinon from "sinon";
import { batch, buildCommandsWithBatches } from "src/auxiliaryCommandsAggregator";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { AggregatorCall, Batch, BatchOptions, Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import AGGREGATOR_ABI from "src/vip-framework/abi/AuxiliaryCommandsAggregator.json";
import { seedProposalBatchesOnFork } from "src/vip-framework/aggregatorBatches";

import AGGREGATOR_FIXTURE from "./fixtures/AuxiliaryCommandsAggregator.json";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;
const GIVE = "giveCallPermission(address,string,address)";
const SET = "setValue(uint256)";
const REVOKE = "revokeCallPermission(address,string,address)";

const TARGET = "0x1111111111111111111111111111111111111111";
const ACCOUNT = "0x2222222222222222222222222222222222222222";
// Runtime code that returns true to every call: stands in for the ACM and for TARGET.
const ALWAYS_TRUE = "0x600160005260206000f3";

const setValue = (value: number, overrides: Partial<Command> = {}): Command => ({
  target: TARGET,
  signature: SET,
  params: [value],
  ...overrides,
});

const acmGrant = (signature: string): Command => ({
  target: bscmainnet.ACCESS_CONTROL_MANAGER,
  signature: GIVE,
  params: [TARGET, signature, ACCOUNT],
});

const rejection = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("expected a rejection");
};

const build = (entries: (Command | Batch)[]) => buildCommandsWithBatches(entries, ProposalType.REGULAR);

// Capture a test runner's setup hooks so we can exercise its fixture on the local aggregator without running
// the governor lifecycle, which requires a fork.
const captureSetupHooks = (register: () => void): (() => Promise<void>)[] => {
  const sandbox = sinon.createSandbox();
  try {
    sandbox.stub(global, "describe").callsArg(1);
    sandbox.stub(global, "it");
    const setup = sandbox.stub(global, "before");
    register();
    return setup.getCalls().map(call => call.args[0] as unknown as () => Promise<void>);
  } finally {
    sandbox.restore();
  }
};

// Without a fork no chain is read, so every batch comes out without an index.
describe("buildCommandsWithBatches", () => {
  it("wraps a chain's batch in a DEFAULT_ADMIN_ROLE grant and revoke", async () => {
    const { commands, batches } = await build([batch([setValue(1), acmGrant("a()")])]);

    expect(commands.map(c => [c.target, c.signature, c.params])).to.deep.equal([
      [
        bscmainnet.ACCESS_CONTROL_MANAGER,
        "grantRole(bytes32,address)",
        [ethers.constants.HashZero, bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR],
      ],
      [bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR, "executeBatch(uint256)", [ethers.constants.MaxUint256]],
      [
        bscmainnet.ACCESS_CONTROL_MANAGER,
        "revokeRole(bytes32,address)",
        [ethers.constants.HashZero, bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR],
      ],
    ]);
    expect(commands.every(c => c.dstChainId === undefined)).to.equal(true);
    expect(batches).to.have.lengthOf(1);
    expect(batches[0]).to.include({
      network: "bscmainnet",
      aggregator: bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
      index: undefined,
      seeded: false,
    });
  });

  it("grants each distinct permission once, around the batched calls, skipping ACM calls", async () => {
    const struct: Command = {
      target: TARGET,
      signature: "setConfig((uint256,address))",
      params: [[1, ACCOUNT]],
      aclSignature: "setConfig(Config)",
    };
    const [planned] = (await build([batch([setValue(1), setValue(2), acmGrant("a()"), struct])])).batches;

    expect(planned.permissions).to.deep.equal([
      { target: TARGET, signature: SET },
      { target: TARGET, signature: "setConfig(Config)" },
    ]);
    expect(planned.calls.map(c => c.signature)).to.deep.equal([
      GIVE,
      GIVE,
      SET,
      SET,
      GIVE,
      "setConfig((uint256,address))",
      REVOKE,
      REVOKE,
    ]);
    expect([
      ...ethers.utils.defaultAbiCoder.decode(["address", "string", "address"], planned.calls[1].data),
    ]).to.deep.equal([TARGET, "setConfig(Config)", bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR]);
    expect([
      ...ethers.utils.defaultAbiCoder.decode(["address", "string", "address"], planned.calls[6].data),
    ]).to.deep.equal([TARGET, SET, bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR]);
    expect(planned.calls.every(c => c.target === bscmainnet.ACCESS_CONTROL_MANAGER || c.target === TARGET)).to.equal(
      true,
    );
  });

  it("turns each batch() into one batch and leaves every other command in place", async () => {
    const plain = setValue(1);
    const accept: Command = { target: TARGET, signature: "acceptOwnership()", params: [] };
    const { commands, batches } = await build([
      plain,
      batch([setValue(2), setValue(3)]),
      accept,
      batch([setValue(4), accept]),
      plain,
    ]);

    expect(commands.map(c => c.signature)).to.deep.equal([
      "grantRole(bytes32,address)",
      SET,
      "executeBatch(uint256)",
      "acceptOwnership()",
      "executeBatch(uint256)",
      SET,
      "revokeRole(bytes32,address)",
    ]);
    expect([commands[1], commands[3], commands[5]]).to.deep.equal([plain, accept, plain]);
    expect(batches.map(b => b.calls.map(c => c.signature))).to.deep.equal([
      [GIVE, SET, SET, REVOKE],
      [GIVE, GIVE, SET, "acceptOwnership()", REVOKE, REVOKE],
    ]);
  });

  it("rejects nested batches instead of overwriting their options", () => {
    const inner = batch([setValue(2)], { seededIndex: 5, raw: true });
    expect(() =>
      // @ts-expect-error A batch can contain commands only; check the runtime error too.
      batch([setValue(1), inner]),
    ).to.throw("batch: nested batches are not supported");
  });

  it("rejects a batch() spanning chains or sending value", async () => {
    expect(() => batch([setValue(1), setValue(2, { dstChainId: LzChainId.ethereum })])).to.throw(
      "batch: a batch() must hold one chain's commands",
    );
    expect(await rejection(build([batch([setValue(1, { value: "1" })])]))).to.include(
      `batch: ${SET} on ${TARGET} sends value and can't be batched`,
    );
  });

  it("keeps commands written with the home chain's dstChainId local", async () => {
    const home = { dstChainId: LzChainId.bscmainnet };
    const entries = [batch([setValue(1, home), setValue(2)]), setValue(3, home)];
    const proposal = await makeProposal(entries, undefined, ProposalType.REGULAR);
    expect(proposal.signatures).to.include(SET).and.not.include("execute(uint16,bytes,bytes,address)");
  });

  it("seeds signature and arguments by default, and full calldata with an empty signature when raw", async () => {
    const commands = [setValue(1), { target: TARGET, signature: "pause()", params: [] }, acmGrant("a()")];
    const [signed, raw] = (await build([batch(commands), batch(commands, { raw: true })])).batches;
    const args = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
    const selector = (signature: string) => ethers.utils.id(signature).slice(0, 10);

    // calls 0-1 grant setValue and pause; 2-4 are the commands
    expect(signed.calls.slice(2, 4)).to.deep.equal([
      { target: TARGET, signature: SET, data: args },
      { target: TARGET, signature: "pause()", data: "0x" },
    ]);
    expect(raw.calls.slice(2, 4)).to.deep.equal([
      { target: TARGET, signature: "", data: selector(SET) + args.slice(2) },
      { target: TARGET, signature: "", data: selector("pause()") },
    ]);
    expect(raw.calls.map(c => c.data)).to.deep.equal(
      signed.calls.map(c => selector(c.signature) + c.data.slice(2)),
      "raw calls, grants and revokes included, are the signed calls' full calldata",
    );
    expect(raw.calls.every(c => c.signature === "")).to.equal(true);
    expect(raw.permissions).to.deep.equal(signed.permissions);
  });

  it("rejects non-canonical signatures", async () => {
    expect(await rejection(build([batch([setValue(1, { signature: "setValue(uint)" })])]))).to.include(
      'canonical form "setValue(uint256)"',
    );
  });

  it("rejects non-regular proposals", async () => {
    for (const type of [ProposalType.FAST_TRACK, ProposalType.CRITICAL, undefined]) {
      expect(await rejection(buildCommandsWithBatches([batch([setValue(1)])], type))).to.include(
        "only ProposalType.REGULAR",
      );
    }
  });

  it("rejects a batch() on a chain without an aggregator", async () => {
    expect(await rejection(build([batch([setValue(1, { dstChainId: LzChainId.opmainnet })])]))).to.include(
      "no AuxiliaryCommandsAggregator on opmainnet",
    );
  });

  it("puts local commands on BNB Chain testnet when the proposal is built for testnets", async () => {
    const forked = hre.FORKED_NETWORK;
    hre.FORKED_NETWORK = "sepolia";
    try {
      expect(await rejection(build([batch([setValue(1)])]))).to.include("no AuxiliaryCommandsAggregator on bsctestnet");
    } finally {
      hre.FORKED_NETWORK = forked;
    }
  });

  it("builds a remote chain in place of its first command and leaves other chains alone", async () => {
    const remote = setValue(5, { dstChainId: LzChainId.ethereum });
    const { commands, batches } = await build([setValue(1), batch([remote, { ...remote, params: [6] }]), setValue(2)]);

    expect(commands.map(c => [c.target, c.signature, c.dstChainId])).to.deep.equal([
      [TARGET, SET, undefined],
      [ethereum.ACCESS_CONTROL_MANAGER, "grantRole(bytes32,address)", LzChainId.ethereum],
      [ethereum.AUXILIARY_COMMANDS_AGGREGATOR, "executeBatch(uint256)", LzChainId.ethereum],
      [ethereum.ACCESS_CONTROL_MANAGER, "revokeRole(bytes32,address)", LzChainId.ethereum],
      [TARGET, SET, undefined],
    ]);
    expect(batches).to.have.lengthOf(1);
    expect(batches[0].network).to.equal("ethereum");
  });

  it("builds local commands and a remote payload in order from mixed commands and batches", async () => {
    const remote = (value: number) => setValue(value, { dstChainId: LzChainId.ethereum });
    const proposal = await makeProposal(
      [remote(10), setValue(1), batch([setValue(2)]), batch([remote(20)]), setValue(3), remote(30)],
      undefined,
      ProposalType.REGULAR,
    );

    expect(proposal.targets.slice(0, 5)).to.deep.equal([
      bscmainnet.ACCESS_CONTROL_MANAGER,
      TARGET,
      bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
      TARGET,
      bscmainnet.ACCESS_CONTROL_MANAGER,
    ]);
    expect(proposal.signatures).to.deep.equal([
      "grantRole(bytes32,address)",
      SET,
      "executeBatch(uint256)",
      SET,
      "revokeRole(bytes32,address)",
      "execute(uint16,bytes,bytes,address)",
    ]);
    expect(proposal.params[1]).to.deep.equal([1]);
    expect(proposal.params[3]).to.deep.equal([3]);
    expect(proposal.params[5][0]).to.equal(LzChainId.ethereum);

    const [targets, values, signatures, calldatas, type] = ethers.utils.defaultAbiCoder.decode(
      ["address[]", "uint256[]", "string[]", "bytes[]", "uint8"],
      proposal.params[5][1],
    );
    expect(targets).to.deep.equal([
      ethereum.ACCESS_CONTROL_MANAGER,
      TARGET,
      ethereum.AUXILIARY_COMMANDS_AGGREGATOR,
      TARGET,
      ethereum.ACCESS_CONTROL_MANAGER,
    ]);
    expect(signatures).to.deep.equal(proposal.signatures.slice(0, 5));
    expect(values.map(String)).to.deep.equal(["0", "0", "0", "0", "0"]);
    expect(calldatas[1]).to.equal(ethers.utils.defaultAbiCoder.encode(["uint256"], [10]));
    expect(calldatas[2]).to.equal(ethers.utils.defaultAbiCoder.encode(["uint256"], [ethers.constants.MaxUint256]));
    expect(calldatas[3]).to.equal(ethers.utils.defaultAbiCoder.encode(["uint256"], [30]));
    expect(type).to.equal(ProposalType.REGULAR);
    expect(proposal.aggregatorBatches?.map(b => b.network)).to.deep.equal(["bscmainnet", "ethereum"]);
  });

  it("leaves every batch of an unread chain without an index, pinned or not", async () => {
    const { batches } = await build([batch([setValue(1)], { seededIndex: 1 }), batch([setValue(2)])]);

    expect(batches.map(b => [b.index, b.seeded])).to.deep.equal([
      [undefined, false],
      [undefined, false],
    ]);
  });

  it("rejects an empty batch(), an index that is not a non-negative integer, or both indices at once", () => {
    expect(() => batch([])).to.throw("batch: a batch() needs at least one command");
    expect(() => batch([setValue(1)], { expectedIndex: 1, seededIndex: 1 })).to.throw("not both");
    expect(() => batch([setValue(1)], { expectedIndex: -1 })).to.throw("batch: -1 is not an index");
    expect(() => batch([setValue(1)], { seededIndex: 1.5 })).to.throw("batch: 1.5 is not an index");
  });

  it("refuses a read aggregator whose getBatchCount() call fails, keeping the node's error", async () => {
    const forked = hre.FORKED_NETWORK;
    hre.FORKED_NETWORK = "bscmainnet";
    try {
      expect(await rejection(makeProposal([batch([setValue(1)])], undefined, ProposalType.REGULAR))).to.include(
        "reading getBatchCount() from the bscmainnet aggregator at 0x528A428748dfE73DFcc844176B401475D1831057 failed",
      );
    } finally {
      hre.FORKED_NETWORK = forked;
    }
  });

  it("leaves proposals without batch() unchanged", async () => {
    const proposal = await makeProposal([setValue(1)], undefined, ProposalType.REGULAR);

    expect(proposal.signatures).to.deep.equal([SET]);
    expect(proposal).to.not.have.property("aggregatorBatches");
  });
});

// The aggregator's runtime code sits at its BNB Chain address and the fork is bscmainnet, so builds read it for real.
describe("on a local aggregator", () => {
  let aggregator: Contract;
  let outer: SnapshotRestorer;
  let empty: SnapshotRestorer;
  let forked: typeof hre.FORKED_NETWORK;

  const indices = ({ batches }: { batches: { index?: { toNumber: () => number }; seeded: boolean }[] }) =>
    batches.map(b => [b.index?.toNumber(), b.seeded]);
  // The calls a batch() stores, to seed them by hand.
  const callsOf = async (commands: Command[], options: BatchOptions = {}) =>
    (await build([batch(commands, options)])).batches[0].calls;
  const seed = async (...batches: AggregatorCall[][]) => {
    for (const calls of batches) await aggregator["addBatch((address,string,bytes)[])"](calls);
  };

  before(async () => {
    outer = await takeSnapshot();
    forked = hre.FORKED_NETWORK;
    hre.FORKED_NETWORK = "bscmainnet";
    const [signer] = await ethers.getSigners();
    await setCode(bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR, AGGREGATOR_FIXTURE.deployedBytecode);
    await setCode(bscmainnet.ACCESS_CONTROL_MANAGER, ALWAYS_TRUE);
    // addBatch refuses a target without code.
    await setCode(TARGET, ALWAYS_TRUE);
    aggregator = new ethers.Contract(bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR, AGGREGATOR_ABI, signer);
    await aggregator.initialize(bscmainnet.ACCESS_CONTROL_MANAGER);
    await aggregator.addAuthorizedBatchers([signer.address, bscmainnet.NORMAL_TIMELOCK]);
    empty = await takeSnapshot();
  });

  beforeEach(async () => {
    await empty.restore();
  });

  after(async () => {
    hre.FORKED_NETWORK = forked;
    await outer.restore();
  });

  it("seeds every unpinned batch at a new index, even when identical calls are already seeded", async () => {
    await seed(await callsOf([setValue(1)]), await callsOf([setValue(7)]), await callsOf([setValue(8)]));
    const result = await build([
      batch([setValue(1)]),
      batch([setValue(2)], { expectedIndex: 4 }),
      batch([setValue(1)]),
    ]);

    expect(indices(result)).to.deep.equal([
      [3, false],
      [4, false],
      [5, false],
    ]);
    expect(
      result.commands.filter(c => c.signature === "executeBatch(uint256)").map(c => c.params[0].toNumber()),
    ).to.deep.equal([3, 4, 5]);
  });

  it("assigns separate indices to each occurrence of the same batch object", async () => {
    const entry = batch([setValue(1), setValue(2)]);
    const result = await build([entry, entry]);

    expect(indices(result)).to.deep.equal([
      [0, false],
      [1, false],
    ]);
    expect(result.batches.map(b => b.calls.map(c => c.signature))).to.deep.equal([
      [GIVE, SET, SET, REVOKE],
      [GIVE, SET, SET, REVOKE],
    ]);
    expect(
      result.commands.filter(c => c.signature === "executeBatch(uint256)").map(c => c.params[0].toNumber()),
    ).to.deep.equal([0, 1]);
  });

  it("requires an expectedIndex to be the next free index unless its batch is already seeded there", async () => {
    await seed(await callsOf([setValue(7)]), await callsOf([setValue(2)]), await callsOf([setValue(8)]));

    expect(indices(await build([batch([setValue(2)], { expectedIndex: 1 }), batch([setValue(3)])]))).to.deep.equal([
      [1, true],
      [3, false],
    ]);
    expect(await rejection(build([batch([setValue(4)], { expectedIndex: 7 })]))).to.include(
      "bscmainnet expectedIndex 7 is not the next free index 3",
    );
    expect(await rejection(build([batch([setValue(4)], { expectedIndex: 1 })]))).to.include(
      "bscmainnet batch 1 does not hold these calls",
    );
  });

  it("pins a seededIndex batch, checking its calls against the seeded ones", async () => {
    const pinned = batch([setValue(1)], { seededIndex: 1 });
    await seed(await callsOf([setValue(7)]));
    expect(await rejection(build([pinned]))).to.include("bscmainnet batch 1 does not hold these calls");

    await seed(await callsOf([setValue(1)]));
    expect(indices(await build([pinned]))).to.deep.equal([[1, true]]);
    expect(await rejection(build([batch([setValue(2)], { seededIndex: 1 })]))).to.include(
      "bscmainnet batch 1 does not hold these calls",
    );
  });

  it("matches a pin only against a batch seeded in the same mode", async () => {
    await seed(await callsOf([setValue(1)]), await callsOf([setValue(1)], { raw: true }));

    expect(
      indices(
        await build([batch([setValue(1)], { seededIndex: 0 }), batch([setValue(1)], { raw: true, seededIndex: 1 })]),
      ),
    ).to.deep.equal([
      [0, true],
      [1, true],
    ]);
    expect(await rejection(build([batch([setValue(1)], { seededIndex: 1 })]))).to.include(
      "bscmainnet batch 1 does not hold these calls; check its index, keep raw: true when pinning a raw batch",
    );
    expect(await rejection(build([batch([setValue(1)], { raw: true, seededIndex: 0 })]))).to.include(
      "bscmainnet batch 0 does not hold these calls",
    );
  });

  it("refuses a seeded batch that already ran, pinned either way", async () => {
    await seed(await callsOf([setValue(7)]), await callsOf([setValue(1)]));
    await aggregator.executeBatch(1);

    for (const options of [{ seededIndex: 1 }, { expectedIndex: 1 }]) {
      expect(await rejection(build([batch([setValue(1)], options)]))).to.include("bscmainnet batch 1 already ran");
    }
  });

  it("rejects two batches pinned to one index", async () => {
    await seed(await callsOf([setValue(7)]), await callsOf([setValue(1)]));
    const twice = [batch([setValue(1)], { seededIndex: 1 }), batch([setValue(1)], { seededIndex: 1 })];

    expect(await rejection(build(twice))).to.include("bscmainnet has two batches at one index");
  });

  it("seeds only the current fork's batches, leaving unread chains alone", async () => {
    const { batches } = await build([batch([setValue(1)]), batch([setValue(2, { dstChainId: LzChainId.ethereum })])]);
    const proposal = { ...(await makeProposal([])), aggregatorBatches: batches };

    await seedProposalBatchesOnFork(proposal);

    expect(await aggregator.getBatchCount()).to.equal(1);
    expect(batches.map(b => [b.network, b.seeded])).to.deep.equal([
      ["bscmainnet", true],
      ["ethereum", false],
    ]);
  });

  it("keeps the batches seeded before a failure marked and restores the timelock balance", async () => {
    const balanceBefore = await ethers.provider.getBalance(bscmainnet.NORMAL_TIMELOCK);
    const proposal = await makeProposal(
      // ACCOUNT has no code, so addBatch rejects the second batch.
      [batch([setValue(1)]), batch([setValue(1, { target: ACCOUNT })])],
      undefined,
      ProposalType.REGULAR,
    );

    expect(await rejection(seedProposalBatchesOnFork(proposal))).to.not.equal("");
    expect(await ethers.provider.getBalance(bscmainnet.NORMAL_TIMELOCK)).to.equal(balanceBefore);
    expect(await aggregator.getBatchCount()).to.equal(1);
    expect(proposal.aggregatorBatches?.map(b => b.seeded)).to.deep.equal([true, false]);
  });

  it("allows testVip automatic seeding to be disabled", async () => {
    // Import after selecting the fork; the framework reads network addresses at module load.
    const { testVip } = await import("src/vip-framework");
    const proposal = await makeProposal([batch([setValue(1)])], undefined, ProposalType.REGULAR);
    const [setup] = captureSetupHooks(() =>
      testVip("batch", proposal, { proposer: ACCOUNT, supporters: [], seedProposalBatches: false }),
    );

    await setup();

    expect(await aggregator.getBatchCount()).to.equal(0);
    expect(proposal.aggregatorBatches?.[0].seeded).to.equal(false);
  });

  it("automatically seeds from proposal metadata so both execution paths can run the same batch once", async () => {
    const { testVip } = await import("src/vip-framework");
    const proposal = await makeProposal([batch([setValue(1)])], undefined, ProposalType.REGULAR);
    const [commandSetup, executionSetup] = captureSetupHooks(() =>
      testVip("batch", proposal, { proposer: ACCOUNT, supporters: [] }),
    );
    expect(await aggregator.getBatchCount()).to.equal(0);

    await commandSetup();
    expect(await aggregator.getBatchCount()).to.equal(1);
    expect(proposal.aggregatorBatches?.[0].seeded).to.equal(true);
    await aggregator.executeBatch(0);
    expect(await aggregator.batchExecuted(0)).to.equal(true);

    await executionSetup();
    expect(await aggregator.getBatchCount()).to.equal(1);
    expect(await aggregator.batchExecuted(0)).to.equal(false);
    await aggregator.executeBatch(0);
    expect(await aggregator.batchExecuted(0)).to.equal(true);
  });

  it("does not seed again when manual preparation happens before testVip setup", async () => {
    const { testVip } = await import("src/vip-framework");
    const proposal = await makeProposal([batch([setValue(1)])], undefined, ProposalType.REGULAR);
    const [setup] = captureSetupHooks(() => testVip("batch", proposal, { proposer: ACCOUNT, supporters: [] }));

    await seedProposalBatchesOnFork(proposal);
    const blockAfterSeeding = await ethers.provider.getBlockNumber();
    await setup();

    expect(await aggregator.getBatchCount()).to.equal(1);
    expect(await ethers.provider.getBlockNumber()).to.equal(blockAfterSeeding);
  });

  it("builds without seeding, seeds explicitly, resolves pins, and runs signature and raw batches once", async () => {
    const RAW_BATCHER = "0x3333333333333333333333333333333333333333";
    // Each batch makes the aggregator authorize one more batcher on itself, which shows the batch ran as seeded.
    const authorize = (batcher: string, options: BatchOptions) =>
      batch(
        [
          {
            target: bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
            signature: "addAuthorizedBatchers(address[])",
            params: [[batcher]],
          },
        ],
        options,
      );
    const propose = (signed: BatchOptions = {}, raw: BatchOptions = {}) =>
      makeProposal(
        [authorize(ACCOUNT, signed), authorize(RAW_BATCHER, { ...raw, raw: true })],
        undefined,
        ProposalType.REGULAR,
      );

    const balanceBefore = await ethers.provider.getBalance(bscmainnet.NORMAL_TIMELOCK);
    const blockBefore = await ethers.provider.getBlockNumber();
    const proposal = await propose();
    const { aggregatorBatches = [] } = proposal;
    expect(aggregatorBatches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [0, false],
      [1, false],
    ]);
    expect((await propose()).params).to.deep.equal(proposal.params);
    expect(await aggregator.getBatchCount()).to.equal(0);
    expect(await ethers.provider.getBlockNumber()).to.equal(blockBefore);

    await seedProposalBatchesOnFork(proposal);
    expect(aggregatorBatches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [0, true],
      [1, true],
    ]);
    expect(aggregatorBatches[1].calls.every(c => c.signature === "")).to.equal(true);
    for (const [index, { calls }] of aggregatorBatches.entries()) {
      expect(
        (await aggregator.getBatch(index)).map(({ target, signature, data }: AggregatorCall) => ({
          target,
          signature,
          data,
        })),
      ).to.deep.equal(calls);
    }

    const pinned = await propose({ seededIndex: 0 }, { seededIndex: 1 });
    expect(pinned.aggregatorBatches?.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [0, true],
      [1, true],
    ]);
    await seedProposalBatchesOnFork(proposal);
    await seedProposalBatchesOnFork(pinned);
    expect(await aggregator.getBatchCount()).to.equal(2);
    expect(await ethers.provider.getBalance(bscmainnet.NORMAL_TIMELOCK)).to.equal(balanceBefore);

    for (const index of [0, 1]) await aggregator.executeBatch(index);
    expect(await aggregator.authorizedBatchers(ACCOUNT)).to.equal(true);
    expect(await aggregator.authorizedBatchers(RAW_BATCHER)).to.equal(true);
    for (const index of [0, 1]) {
      await expect(aggregator.executeBatch(index)).to.be.revertedWithCustomError(aggregator, "BatchAlreadyExecuted");
    }
    expect(await rejection(propose({ seededIndex: 0 }, { seededIndex: 1 }))).to.include(
      "bscmainnet batch 0 already ran",
    );
  });
});

// delay: true in mocha config requires run() to be deferred until after mocha finishes loading
setTimeout(run, 100);
