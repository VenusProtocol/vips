import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ReadBatches, aggregateCommands, batch } from "src/auxiliaryCommandsAggregator";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;
const GIVE = "giveCallPermission(address,string,address)";
const SET = "setValue(uint256)";
const REVOKE = "revokeCallPermission(address,string,address)";

const TARGET = "0x1111111111111111111111111111111111111111";
const ACCOUNT = "0x2222222222222222222222222222222222222222";
const PERMISSIONS = new ethers.utils.Interface([`function ${GIVE}`, `function ${REVOKE}`]);

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

const aggregate = (commands: Command[], read = unread) => aggregateCommands(commands, ProposalType.REGULAR, read);

describe("aggregateCommands", () => {
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
    expect([...PERMISSIONS.decodeFunctionData("giveCallPermission", planned.calls[1].data)]).to.deep.equal([
      TARGET,
      "setConfig(Config)",
      bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
    ]);
    expect([...PERMISSIONS.decodeFunctionData("revokeCallPermission", planned.calls[6].data)]).to.deep.equal([
      TARGET,
      SET,
      bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
    ]);
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

    expect(await rejection(aggregate(batch([setValue(1, { value: "1" })])))).to.include(
      `aggregate: ${SET} on ${TARGET} sends value and can't be batched`,
    );
    const [first, second] = batch([setValue(1), setValue(2)]);
    expect(await rejection(aggregate([first, setValue(9), second]))).to.include(
      "other commands split a bscmainnet batch()",
    );
  });

  it("rejects non-canonical signatures", async () => {
    expect(await rejection(aggregate(batch([setValue(1, { signature: "setValue(uint)" })])))).to.include(
      'canonical form "setValue(uint256)"',
    );
  });

  it("rejects non-regular proposals", async () => {
    for (const type of [ProposalType.FAST_TRACK, ProposalType.CRITICAL, undefined]) {
      expect(await rejection(aggregateCommands(batch([setValue(1)]), type, unread))).to.include(
        "only ProposalType.REGULAR",
      );
    }
  });

  it("rejects a batch() on a chain without an aggregator", async () => {
    expect(await rejection(aggregate(batch([setValue(1, { dstChainId: LzChainId.opmainnet })])))).to.include(
      "no AuxiliaryCommandsAggregator on opmainnet",
    );
  });

  it("rewrites a remote chain in place of its first command and leaves other chains alone", async () => {
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
  const storedAt =
    (count: number, batches: Record<number, { target: string; data: string }[]> = {}): ReadBatches =>
    async () => ({ count: BigNumber.from(count), get: async index => batches[index.toNumber()] });
  const storedCalls = async (commands: Command[]) =>
    (await aggregate(batch(commands))).batches[0].calls.map(({ target, data }) => ({
      target: ethers.utils.getAddress(target),
      data,
    }));

  it("stores every unpinned batch at a new index, even when identical calls are already stored", async () => {
    const commands = [...batch([setValue(1)]), ...batch([setValue(2)], { expectedIndex: 4 }), ...batch([setValue(1)])];
    const read = storedAt(3, { 0: await storedCalls([setValue(1)]) });
    const { commands: rewritten, batches } = await aggregate(commands, read);

    expect(batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [3, false],
      [4, false],
      [5, false],
    ]);
    expect(
      rewritten.filter(c => c.signature === "executeBatch(uint256)").map(c => c.params[0].toNumber()),
    ).to.deep.equal([3, 4, 5]);
  });

  it("requires an expectedIndex to be the next free index unless its batch is already stored there", async () => {
    const read = storedAt(3, { 1: await storedCalls([setValue(2)]) });
    const { batches } = await aggregate([...batch([setValue(2)], { expectedIndex: 1 }), ...batch([setValue(3)])], read);

    expect(batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [1, true],
      [3, false],
    ]);
    expect(await rejection(aggregate(batch([setValue(4)], { expectedIndex: 7 }), read))).to.include(
      "bscmainnet expectedIndex 7 is not the next free index 3",
    );
  });

  it("pins an actualIndex batch, checking its calls against the stored ones", async () => {
    const pinned = batch([setValue(1)], { actualIndex: 1 });
    const read = storedAt(2, { 1: await storedCalls([setValue(1)]) });

    expect((await aggregate(pinned, read)).batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [1, true],
    ]);
    expect(await rejection(aggregate(batch([setValue(2)], { actualIndex: 1 }), read))).to.include(
      "bscmainnet batch 1 does not hold these calls",
    );
    expect(await rejection(aggregate(pinned, storedAt(1)))).to.include("bscmainnet batch 1 does not hold these calls");
  });

  it("leaves every batch of an unread chain without an index, pinned or not", async () => {
    const { batches } = await aggregate([...batch([setValue(1)], { actualIndex: 1 }), ...batch([setValue(2)])]);

    expect(batches.map(b => [b.index, b.seeded])).to.deep.equal([
      [undefined, false],
      [undefined, false],
    ]);
  });

  it("rejects indices that can't name one stored batch", async () => {
    expect(() => batch([setValue(1)], { expectedIndex: 1, actualIndex: 1 })).to.throw("not both");
    expect(() => batch([setValue(1)], { expectedIndex: -1 })).to.throw("batch: -1 is not an index");
    expect(() => batch([setValue(1)], { actualIndex: 1.5 })).to.throw("batch: 1.5 is not an index");

    const read = storedAt(2, { 1: await storedCalls([setValue(1)]) });
    const twice = [...batch([setValue(1)], { actualIndex: 1 }), ...batch([setValue(1)], { actualIndex: 1 })];
    expect(await rejection(aggregate(twice, read))).to.include("bscmainnet has two batches at one index");
  });
});

describe("makeProposal with batch()", () => {
  it("encodes the rewritten commands and attaches their batches", async () => {
    const proposal = await makeProposal(batch([setValue(1)]), undefined, ProposalType.REGULAR);

    expect(proposal.signatures).to.deep.equal([
      "grantRole(bytes32,address)",
      "executeBatch(uint256)",
      "revokeRole(bytes32,address)",
    ]);
    expect(proposal.aggregatorBatches).to.have.lengthOf(1);
  });

  it("leaves proposals without batch() unchanged", async () => {
    const proposal = await makeProposal([setValue(1)], undefined, ProposalType.REGULAR);

    expect(proposal.signatures).to.deep.equal([SET]);
    expect(proposal).to.not.have.property("aggregatorBatches");
  });
});
