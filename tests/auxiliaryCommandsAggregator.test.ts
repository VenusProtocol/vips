import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ReadBatches, aggregateCommands, batch } from "src/auxiliaryCommandsAggregator";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;
const TARGET = "0x1111111111111111111111111111111111111111";
const ACCOUNT = "0x2222222222222222222222222222222222222222";
const PERMISSIONS = new ethers.utils.Interface([
  "function giveCallPermission(address,string,address)",
  "function revokeCallPermission(address,string,address)",
]);

const setValue = (value: number, overrides: Partial<Command> = {}): Command => ({
  target: TARGET,
  signature: "setValue(uint256)",
  params: [value],
  ...overrides,
});

const acmGrant = (signature: string): Command => ({
  target: bscmainnet.ACCESS_CONTROL_MANAGER,
  signature: "giveCallPermission(address,string,address)",
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

const aggregate = (commands: Command[], chains = [LzChainId.bscmainnet], read = unread) =>
  aggregateCommands(commands, chains, ProposalType.REGULAR, read);

describe("aggregateCommands", () => {
  it("wraps a chain's batch in a DEFAULT_ADMIN_ROLE grant and revoke", async () => {
    const { commands, batches } = await aggregate([setValue(1), acmGrant("a()")]);

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
    const [planned] = (await aggregate([setValue(1), setValue(2), acmGrant("a()"), struct])).batches;

    expect(planned.permissions).to.deep.equal([
      { target: TARGET, signature: "setValue(uint256)" },
      { target: TARGET, signature: "setConfig(Config)" },
    ]);
    expect(planned.calls.map(c => c.signature)).to.deep.equal([
      "giveCallPermission(address,string,address)",
      "giveCallPermission(address,string,address)",
      "setValue(uint256)",
      "setValue(uint256)",
      "giveCallPermission(address,string,address)",
      "setConfig((uint256,address))",
      "revokeCallPermission(address,string,address)",
      "revokeCallPermission(address,string,address)",
    ]);
    expect([...PERMISSIONS.decodeFunctionData("giveCallPermission", planned.calls[1].data)]).to.deep.equal([
      TARGET,
      "setConfig(Config)",
      bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
    ]);
    expect([...PERMISSIONS.decodeFunctionData("revokeCallPermission", planned.calls[6].data)]).to.deep.equal([
      TARGET,
      "setValue(uint256)",
      bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR,
    ]);
    expect(planned.calls.every(c => c.target === bscmainnet.ACCESS_CONTROL_MANAGER || c.target === TARGET)).to.equal(
      true,
    );
  });

  it("keeps inline, acceptOwnership and value-carrying commands out of batches, in order", async () => {
    const inline = setValue(2, { inline: true });
    const accept: Command = { target: TARGET, signature: "acceptOwnership()", params: [] };
    const paid = setValue(4, { value: "1" });
    const { commands, batches } = await aggregate([setValue(1), inline, accept, setValue(3), paid]);

    expect(commands.map(c => c.signature)).to.deep.equal([
      "grantRole(bytes32,address)",
      "executeBatch(uint256)",
      "setValue(uint256)",
      "acceptOwnership()",
      "executeBatch(uint256)",
      "setValue(uint256)",
      "revokeRole(bytes32,address)",
    ]);
    expect([commands[2], commands[3], commands[5]]).to.deep.equal([inline, accept, paid]);
    expect(batches).to.have.lengthOf(2);
  });

  it("gives each batch() group a batch of its own, apart from the untagged commands around it", async () => {
    const grants = Array.from({ length: 6 }, (_, i) => acmGrant(`permission${i}(uint256)`));
    const groups = [grants.slice(0, 1), grants.slice(1, 3), grants.slice(3, 5), grants.slice(5)];
    const { commands, batches } = await aggregate([
      ...groups[0],
      ...batch(groups[1]),
      ...batch(groups[2]),
      ...groups[3],
    ]);

    expect(commands.filter(c => c.signature === "executeBatch(uint256)")).to.have.lengthOf(4);
    expect(batches.map(b => b.calls.map(c => c.data))).to.deep.equal(
      groups.map(group => group.map(g => PERMISSIONS.encodeFunctionData("giveCallPermission", g.params))),
    );
  });

  it("keeps an inline command inside a batch() group inline, ending the batch there", async () => {
    const { commands, batches } = await aggregate(batch([setValue(1), setValue(2, { inline: true }), setValue(3)]));

    expect(commands.map(c => [c.signature, c.params])).to.deep.equal([
      ["grantRole(bytes32,address)", [ethers.constants.HashZero, bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR]],
      ["executeBatch(uint256)", [ethers.constants.MaxUint256]],
      ["setValue(uint256)", [2]],
      ["executeBatch(uint256)", [ethers.constants.MaxUint256]],
      ["revokeRole(bytes32,address)", [ethers.constants.HashZero, bscmainnet.AUXILIARY_COMMANDS_AGGREGATOR]],
    ]);
    expect(batches.map(b => b.calls.map(c => c.signature))).to.deep.equal([
      [
        "giveCallPermission(address,string,address)",
        "setValue(uint256)",
        "revokeCallPermission(address,string,address)",
      ],
      [
        "giveCallPermission(address,string,address)",
        "setValue(uint256)",
        "revokeCallPermission(address,string,address)",
      ],
    ]);
  });

  it("splits a batch() group by chain, and the outer call wins when batch() calls nest", async () => {
    const remote = setValue(5, { dstChainId: LzChainId.ethereum });
    const { batches } = await aggregate(
      batch([setValue(1), remote, ...batch([setValue(2), { ...remote, params: [6] }])]),
      [LzChainId.bscmainnet, LzChainId.ethereum],
    );

    expect(batches.map(b => [b.network, b.calls.map(c => c.signature)])).to.deep.equal(
      ["bscmainnet", "ethereum"].map(network => [
        network,
        [
          "giveCallPermission(address,string,address)",
          "setValue(uint256)",
          "setValue(uint256)",
          "revokeCallPermission(address,string,address)",
        ],
      ]),
    );
  });

  it("rejects non-canonical signatures", async () => {
    expect(await rejection(aggregate([setValue(1, { signature: "setValue(uint)" })]))).to.include(
      'canonical form "setValue(uint256)"',
    );
  });

  it("rejects non-regular proposals", async () => {
    for (const type of [ProposalType.FAST_TRACK, ProposalType.CRITICAL, undefined]) {
      expect(await rejection(aggregateCommands([setValue(1)], [LzChainId.bscmainnet], type, unread))).to.include(
        "only ProposalType.REGULAR",
      );
    }
  });

  it("rejects chains without an aggregator or without batchable commands", async () => {
    const op = setValue(1, { dstChainId: LzChainId.opmainnet });
    expect(await rejection(aggregate([op], [LzChainId.opmainnet]))).to.include(
      "no AuxiliaryCommandsAggregator on opmainnet",
    );
    expect(await rejection(aggregate([setValue(1, { inline: true })]))).to.include(
      "bscmainnet has no commands to batch",
    );
    expect(await rejection(aggregate([setValue(1)], [LzChainId.ethereum]))).to.include(
      "ethereum has no commands to batch",
    );
  });

  it("rewrites a remote chain in place of its first command and leaves other chains alone", async () => {
    const remote = setValue(5, { dstChainId: LzChainId.ethereum });
    const { commands, batches } = await aggregate(
      [setValue(1), remote, setValue(2), { ...remote, params: [6] }],
      [LzChainId.ethereum, LzChainId.ethereum],
    );

    expect(commands.map(c => [c.target, c.signature, c.dstChainId])).to.deep.equal([
      [TARGET, "setValue(uint256)", undefined],
      [ethereum.ACCESS_CONTROL_MANAGER, "grantRole(bytes32,address)", LzChainId.ethereum],
      [ethereum.AUXILIARY_COMMANDS_AGGREGATOR, "executeBatch(uint256)", LzChainId.ethereum],
      [ethereum.ACCESS_CONTROL_MANAGER, "revokeRole(bytes32,address)", LzChainId.ethereum],
      [TARGET, "setValue(uint256)", undefined],
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
    (await aggregate(commands)).batches[0].calls.map(({ target, data }) => ({
      target: ethers.utils.getAddress(target),
      data,
    }));

  it("stores every unpinned batch at a new index, even when identical calls are already stored", async () => {
    const commands = [
      setValue(1),
      setValue(9, { inline: true }),
      ...batch([setValue(2)], { expectedIndex: 4 }),
      setValue(1),
    ];
    const read = storedAt(3, { 0: await storedCalls([setValue(1)]) });
    const { commands: rewritten, batches } = await aggregate(commands, undefined, read);

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
    const { batches } = await aggregate([...batch([setValue(2)], { expectedIndex: 1 }), setValue(3)], undefined, read);

    expect(batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [1, true],
      [3, false],
    ]);
    expect(await rejection(aggregate(batch([setValue(4)], { expectedIndex: 7 }), undefined, read))).to.include(
      "bscmainnet expectedIndex 7 is not the next free index 3",
    );
  });

  it("pins an actualIndex batch, checking its calls against the stored ones", async () => {
    const pinned = batch([setValue(1)], { actualIndex: 1 });
    const read = storedAt(2, { 1: await storedCalls([setValue(1)]) });

    expect((await aggregate(pinned, undefined, read)).batches.map(b => [b.index?.toNumber(), b.seeded])).to.deep.equal([
      [1, true],
    ]);
    expect(await rejection(aggregate(batch([setValue(2)], { actualIndex: 1 }), undefined, read))).to.include(
      "bscmainnet batch 1 does not hold these calls",
    );
    expect(await rejection(aggregate(pinned, undefined, storedAt(1)))).to.include(
      "bscmainnet batch 1 does not hold these calls",
    );
  });

  it("leaves every batch of an unread chain without an index, pinned or not", async () => {
    const { batches } = await aggregate([...batch([setValue(1)], { actualIndex: 1 }), setValue(2)]);

    expect(batches.map(b => [b.index, b.seeded])).to.deep.equal([
      [undefined, false],
      [undefined, false],
    ]);
  });

  it("rejects indices that can't name one stored batch", async () => {
    expect(() => batch([setValue(1)], { expectedIndex: 1, actualIndex: 1 })).to.throw("not both");
    expect(() => batch([setValue(1)], { expectedIndex: -1 })).to.throw("batch: -1 is not an index");
    expect(() => batch([setValue(1)], { actualIndex: 1.5 })).to.throw("batch: 1.5 is not an index");
    expect(() => batch([setValue(1), setValue(2, { dstChainId: LzChainId.ethereum })], { actualIndex: 1 })).to.throw(
      "must hold one chain's commands",
    );

    const split = batch([setValue(1), setValue(9, { inline: true }), setValue(2)], { expectedIndex: 3 });
    expect(await rejection(aggregate(split, undefined, storedAt(3)))).to.include(
      "a bscmainnet batch() that sets an index splits into several batches",
    );

    const read = storedAt(2, { 1: await storedCalls([setValue(1)]) });
    const twice = [
      ...batch([setValue(1)], { actualIndex: 1 }),
      setValue(9, { inline: true }),
      ...batch([setValue(1)], { actualIndex: 1 }),
    ];
    expect(await rejection(aggregate(twice, undefined, read))).to.include("bscmainnet has two batches at one index");
  });
});

describe("makeProposal with aggregate", () => {
  it("encodes the rewritten commands and attaches their batches", async () => {
    const proposal = await makeProposal([setValue(1)], undefined, ProposalType.REGULAR, {
      aggregate: [LzChainId.bscmainnet],
    });

    expect(proposal.signatures).to.deep.equal([
      "grantRole(bytes32,address)",
      "executeBatch(uint256)",
      "revokeRole(bytes32,address)",
    ]);
    expect(proposal.aggregatorBatches).to.have.lengthOf(1);
  });

  it("leaves proposals without the option unchanged", async () => {
    const proposal = await makeProposal([setValue(1)], undefined, ProposalType.REGULAR);

    expect(proposal.signatures).to.deep.equal(["setValue(uint256)"]);
    expect(proposal).to.not.have.property("aggregatorBatches");
  });
});
