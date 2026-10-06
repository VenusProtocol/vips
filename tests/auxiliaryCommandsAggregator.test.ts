import { SnapshotRestorer, setCode, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import hre, { ethers } from "hardhat";
import { ReadBatches, batch, buildAggregatorCommands } from "src/auxiliaryCommandsAggregator";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { AggregatorCall, BatchOptions, Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import AGGREGATOR_ABI from "src/vip-framework/abi/AuxiliaryCommandsAggregator.json";

import AGGREGATOR_FIXTURE from "./fixtures/AuxiliaryCommandsAggregator.json";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;
const GIVE = "giveCallPermission(address,string,address)";
const SET = "setValue(uint256)";
const REVOKE = "revokeCallPermission(address,string,address)";

const TARGET = "0x1111111111111111111111111111111111111111";
const ACCOUNT = "0x2222222222222222222222222222222222222222";

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

const unread: ReadBatches = async () => undefined;

const rejection = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("expected a rejection");
};

const aggregate = (commands: Command[], read = unread) => buildAggregatorCommands(commands, ProposalType.REGULAR, read);

describe("buildAggregatorCommands", () => {
  it("wraps a chain's batch in a DEFAULT_ADMIN_ROLE grant and revoke", async () => {
    const { commands, batches } = await aggregate(batch([setValue(1), acmGrant("a()")]));

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
    const [planned] = (await aggregate(batch([setValue(1), setValue(2), acmGrant("a()"), struct]))).batches;

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
    const { commands, batches } = await aggregate([
      plain,
      ...batch([setValue(2), setValue(3)]),
      accept,
      ...batch([setValue(4), accept]),
    ]);

    expect(commands.map(c => c.signature)).to.deep.equal([
      "grantRole(bytes32,address)",
      SET,
      "executeBatch(uint256)",
      "acceptOwnership()",
      "executeBatch(uint256)",
      "revokeRole(bytes32,address)",
    ]);
    expect([commands[1], commands[3]]).to.deep.equal([plain, accept]);
    expect(batches.map(b => b.calls.map(c => c.signature))).to.deep.equal([
      [GIVE, SET, SET, REVOKE],
      [GIVE, GIVE, SET, "acceptOwnership()", REVOKE, REVOKE],
    ]);
  });

  it("keeps the outer group when batch() calls nest", async () => {
    const { batches } = await aggregate(batch([setValue(1), ...batch([setValue(2)])]));

    expect(batches.map(b => b.calls.map(c => c.signature))).to.deep.equal([[GIVE, SET, SET, REVOKE]]);
  });

  it("rejects a batch() spanning chains, sending value, or split by other commands", async () => {
    expect(() => batch([setValue(1), setValue(2, { dstChainId: LzChainId.ethereum })])).to.throw(
      "batch: a batch() must hold one chain's commands",
    );
    expect(() => batch([setValue(1), setValue(2, { dstChainId: LzChainId.bscmainnet })])).to.not.throw();

    expect(await rejection(aggregate(batch([setValue(1, { value: "1" })])))).to.include(
      `batch: ${SET} on ${TARGET} sends value and can't be batched`,
    );
    const [first, second] = batch([setValue(1), setValue(2)]);
    expect(await rejection(aggregate([first, setValue(9), second]))).to.include(
      "other commands split a bscmainnet batch()",
    );
  });

  it("seeds signature and arguments by default, and full calldata with an empty signature when raw", async () => {
    const commands = [setValue(1), { target: TARGET, signature: "pause()", params: [] }, acmGrant("a()")];
    const [signed, raw] = (await aggregate([...batch(commands), ...batch(commands, { raw: true })])).batches;
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
    expect(await rejection(aggregate(batch([setValue(1, { signature: "setValue(uint)" })])))).to.include(
      'canonical form "setValue(uint256)"',
    );
  });

  it("rejects non-regular proposals", async () => {
    for (const type of [ProposalType.FAST_TRACK, ProposalType.CRITICAL, undefined]) {
      expect(await rejection(buildAggregatorCommands(batch([setValue(1)]), type, unread))).to.include(
        "only ProposalType.REGULAR",
      );
    }
  });

  it("rejects a batch() on a chain without an aggregator", async () => {
    expect(await rejection(aggregate(batch([setValue(1, { dstChainId: LzChainId.opmainnet })])))).to.include(
      "no AuxiliaryCommandsAggregator on opmainnet",
    );
  });

  it("puts local commands on BNB Chain testnet when the proposal is built for testnets", async () => {
    const forked = hre.FORKED_NETWORK;
    hre.FORKED_NETWORK = "sepolia";
    try {
      expect(await rejection(aggregate(batch([setValue(1)])))).to.include(
        "no AuxiliaryCommandsAggregator on bsctestnet",
      );
    } finally {
      hre.FORKED_NETWORK = forked;
    }
  });

  it("builds a remote chain in place of its first command and leaves other chains alone", async () => {
    const remote = setValue(5, { dstChainId: LzChainId.ethereum });
    const { commands, batches } = await aggregate([
      setValue(1),
      ...batch([remote, { ...remote, params: [6] }]),
      setValue(2),
    ]);

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
});

describe("aggregator batch indices", () => {
  const seededAt =
    (count: number, batches: Record<number, AggregatorCall[]> = {}, executed: number[] = []): ReadBatches =>
    async () => ({
      count: BigNumber.from(count),
      callsAt: async index => batches[index.toNumber()],
      executed: async index => executed.includes(index.toNumber()),
    });
  const seededCalls = async (commands: Command[], options: BatchOptions = {}) =>
    (await aggregate(batch(commands, options))).batches[0].calls.map(call => ({
      ...call,
      target: ethers.utils.getAddress(call.target),
    }));

  it("seeds every unpinned batch at a new index, even when identical calls are already seeded", async () => {
    const commands = [...batch([setValue(1)]), ...batch([setValue(2)], { expectedIndex: 4 }), ...batch([setValue(1)])];
    const read = seededAt(3, { 0: await seededCalls([setValue(1)]) });
    const { commands: aggregatorCommands, batches } = await aggregate(commands, read);

    expect(batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [3, false],
      [4, false],
      [5, false],
    ]);
    expect(
      aggregatorCommands.filter(c => c.signature === "executeBatch(uint256)").map(c => c.params[0].toNumber()),
    ).to.deep.equal([3, 4, 5]);
  });

  it("requires an expectedIndex to be the next free index unless its batch is already seeded there", async () => {
    const read = seededAt(3, { 1: await seededCalls([setValue(2)]) });
    const { batches } = await aggregate([...batch([setValue(2)], { expectedIndex: 1 }), ...batch([setValue(3)])], read);

    expect(batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [1, true],
      [3, false],
    ]);
    expect(await rejection(aggregate(batch([setValue(4)], { expectedIndex: 7 }), read))).to.include(
      "bscmainnet expectedIndex 7 is not the next free index 3",
    );
  });

  it("pins a seededIndex batch, checking its calls against the seeded ones", async () => {
    const pinned = batch([setValue(1)], { seededIndex: 1 });
    const read = seededAt(2, { 1: await seededCalls([setValue(1)]) });

    expect((await aggregate(pinned, read)).batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [1, true],
    ]);
    expect(await rejection(aggregate(batch([setValue(2)], { seededIndex: 1 }), read))).to.include(
      "bscmainnet batch 1 does not hold these calls",
    );
    expect(await rejection(aggregate(pinned, seededAt(1)))).to.include("bscmainnet batch 1 does not hold these calls");
  });

  it("matches a pin only against a batch seeded in the same mode", async () => {
    const read = seededAt(2, {
      0: await seededCalls([setValue(1)]),
      1: await seededCalls([setValue(1)], { raw: true }),
    });
    const resolved = await aggregate(
      [...batch([setValue(1)], { seededIndex: 0 }), ...batch([setValue(1)], { raw: true, seededIndex: 1 })],
      read,
    );

    expect(resolved.batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [0, true],
      [1, true],
    ]);
    expect(await rejection(aggregate(batch([setValue(1)], { seededIndex: 1 }), read))).to.include(
      "bscmainnet batch 1 does not hold these calls; check seededIndex, keep raw: true when pinning a raw batch",
    );
    expect(await rejection(aggregate(batch([setValue(1)], { raw: true, seededIndex: 0 }), read))).to.include(
      "bscmainnet batch 0 does not hold these calls",
    );
  });

  it("refuses a seeded batch that already ran, pinned either way", async () => {
    const read = seededAt(2, { 1: await seededCalls([setValue(1)]) }, [1]);

    for (const options of [{ seededIndex: 1 }, { expectedIndex: 1 }]) {
      expect(await rejection(aggregate(batch([setValue(1)], options), read))).to.include(
        "bscmainnet batch 1 already ran",
      );
    }
  });

  it("leaves every batch of an unread chain without an index, pinned or not", async () => {
    const { batches } = await aggregate([...batch([setValue(1)], { seededIndex: 1 }), ...batch([setValue(2)])]);

    expect(batches.map(b => [b.index, b.seeded])).to.deep.equal([
      [undefined, false],
      [undefined, false],
    ]);
  });

  it("rejects indices that can't name one seeded batch", async () => {
    expect(() => batch([setValue(1)], { expectedIndex: 1, seededIndex: 1 })).to.throw("not both");
    expect(() => batch([setValue(1)], { expectedIndex: -1 })).to.throw("batch: -1 is not an index");
    expect(() => batch([setValue(1)], { seededIndex: 1.5 })).to.throw("batch: 1.5 is not an index");

    const read = seededAt(2, { 1: await seededCalls([setValue(1)]) });
    const twice = [...batch([setValue(1)], { seededIndex: 1 }), ...batch([setValue(1)], { seededIndex: 1 })];
    expect(await rejection(aggregate(twice, read))).to.include("bscmainnet has two batches at one index");
  });
});

describe("makeProposal with batch()", () => {
  it("encodes the aggregator commands and attaches their batches", async () => {
    const proposal = await makeProposal(batch([setValue(1)]), undefined, ProposalType.REGULAR);

    expect(proposal.signatures).to.deep.equal([
      "grantRole(bytes32,address)",
      "executeBatch(uint256)",
      "revokeRole(bytes32,address)",
    ]);
    expect(proposal.aggregatorBatches).to.have.lengthOf(1);
  });

  it("refuses a read aggregator whose getBatchCount() call fails, keeping the node's error", async () => {
    const forked = hre.FORKED_NETWORK;
    hre.FORKED_NETWORK = "bscmainnet";
    try {
      expect(await rejection(makeProposal(batch([setValue(1)]), undefined, ProposalType.REGULAR))).to.include(
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

describe("seeding on a local aggregator", () => {
  const RAW_BATCHER = "0x3333333333333333333333333333333333333333";
  // Each batch makes the aggregator authorize one more batcher on itself, which shows the batch ran as seeded.
  const build = (signed: BatchOptions = {}, raw: BatchOptions = {}) =>
    makeProposal(
      [
        ...batch(
          [
            {
              target: bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
              signature: "addAuthorizedBatchers(address[])",
              params: [[ACCOUNT]],
            },
          ],
          signed,
        ),
        ...batch(
          [
            {
              target: bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
              signature: "addAuthorizedBatchers(address[])",
              params: [[RAW_BATCHER]],
            },
          ],
          { ...raw, raw: true },
        ),
      ],
      undefined,
      ProposalType.REGULAR,
    );
  let aggregator: Contract;
  let snapshot: SnapshotRestorer;
  let forked: typeof hre.FORKED_NETWORK;

  before(async () => {
    snapshot = await takeSnapshot();
    forked = hre.FORKED_NETWORK;
    hre.FORKED_NETWORK = "bscmainnet";
    // The aggregator's runtime code, and an ACM that answers every call with true.
    await setCode(bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR, AGGREGATOR_FIXTURE.deployedBytecode);
    await setCode(bscmainnet.ACCESS_CONTROL_MANAGER, "0x600160005260206000f3");
    aggregator = new ethers.Contract(
      bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
      AGGREGATOR_ABI,
      (await ethers.getSigners())[0],
    );
    await aggregator.initialize(bscmainnet.ACCESS_CONTROL_MANAGER);
    await aggregator.addAuthorizedBatchers([bscmainnet.NORMAL_TIMELOCK]);
  });

  after(async () => {
    hre.FORKED_NETWORK = forked;
    await snapshot.restore();
  });

  it("seeds a signature batch and a raw batch, resolves pins to them, and runs each once", async () => {
    const { aggregatorBatches = [] } = await build();

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

    const pinned = await build({ seededIndex: 0 }, { seededIndex: 1 });
    expect(pinned.aggregatorBatches?.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [0, true],
      [1, true],
    ]);
    expect(await aggregator.getBatchCount()).to.equal(2);

    for (const index of [0, 1]) await aggregator.executeBatch(index);
    expect(await aggregator.authorizedBatchers(ACCOUNT)).to.equal(true);
    expect(await aggregator.authorizedBatchers(RAW_BATCHER)).to.equal(true);
    for (const index of [0, 1]) {
      await expect(aggregator.executeBatch(index)).to.be.revertedWithCustomError(aggregator, "BatchAlreadyExecuted");
    }
    expect(await rejection(build({ seededIndex: 0 }, { seededIndex: 1 }))).to.include("bscmainnet batch 0 already ran");
  });
});

// delay: true in mocha config requires run() to be deferred until after mocha finishes loading
setTimeout(run, 100);
