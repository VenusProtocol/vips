import { BigNumber, Contract, Overrides, Signer, constants, providers, utils } from "ethers";
import { FORKED_NETWORK, ethers, network } from "hardhat";

import { NETWORK_ADDRESSES } from "./networkAddresses";
import {
  AggregatorBatch,
  AggregatorCall,
  BatchOptions,
  CallPermission,
  Command,
  LzChainId,
  ProposalType,
  REMOTE_TESTNET_NETWORKS,
  SUPPORTED_NETWORKS,
} from "./types";
import AGGREGATOR_ABI from "./vip-framework/abi/AuxiliaryCommandsAggregator.json";

// What an aggregator already holds on chain.
interface OnChainBatches {
  count: BigNumber;
  callsAt: (index: BigNumber) => Promise<AggregatorCall[]>;
  executed: (index: BigNumber) => Promise<boolean>;
}

// One batch() encoded for its aggregator, before the chain is read for its index.
interface EncodedBatch {
  options: BatchOptions;
  calls: AggregatorCall[];
  permissions: CallPermission[];
}

// A chain's commands in order: a plain command, or the commands of one batch() kept together.
type Segment = Command | Command[];
const isBatch = (segment: Segment): segment is Command[] => Array.isArray(segment);

// Marks the commands as one aggregator batch on their chain. Batched calls run as the aggregator, so calls that must
// come from the timelock stay out of batch(). A batch too large for one addBatch runs out of gas when it is seeded, so
// split its commands across batch() calls or seed it with { raw: true }.
export const batch = (commands: Command[], options: BatchOptions = {}): Command[] => {
  const { expectedIndex, seededIndex } = options;
  if (commands.length === 0) throw new Error("batch: a batch() needs at least one command");
  if (expectedIndex !== undefined && seededIndex !== undefined) {
    throw new Error("batch: set expectedIndex or seededIndex, not both");
  }
  const index = expectedIndex ?? seededIndex;
  if (index !== undefined && (!Number.isInteger(index) || index < 0)) {
    throw new Error(`batch: ${index} is not an index`);
  }
  // Each chain's aggregator holds its own batches.
  if (new Set(commands.map(chainIdOf)).size > 1) {
    throw new Error("batch: a batch() must hold one chain's commands");
  }
  // One object per batch() call: its identity tells the commands of this batch() apart from every other one. Nested
  // batch() calls keep the outer one, as the spread below overwrites the inner tag.
  const batchGroup = { ...options };
  return commands.map(cmd => ({ ...cmd, batchGroup }));
};

// Builds the commands that run the proposal through the aggregators. Each chain with a batch() comes out as
// grantRole(DEFAULT_ADMIN_ROLE), its commands with each batch() replaced by executeBatch(index), revokeRole, in place
// of its first command. Chains without a batch() are left alone.
export const buildAggregatorCommands = async (
  commands: Command[],
  type: ProposalType | undefined,
): Promise<{ commands: Command[]; batches: AggregatorBatch[] }> => {
  // Only the Normal Timelock holds the ACM DEFAULT_ADMIN_ROLE that each chain lends its aggregator.
  if (type !== ProposalType.REGULAR) throw new Error("batch: only ProposalType.REGULAR proposals are supported");

  const batchedChainIds = new Set(commands.filter(cmd => cmd.batchGroup).map(chainIdOf));
  const commandsByChain = new Map<LzChainId, Command[]>();
  const batches: AggregatorBatch[] = [];
  for (const chainId of batchedChainIds) {
    const chain = await buildChainAggregatorCommands(
      commands.filter(cmd => chainIdOf(cmd) === chainId),
      chainId,
    );
    commandsByChain.set(chainId, chain.commands);
    batches.push(...chain.batches);
  }

  // A chain's aggregator commands take the place of its first command; its other commands are already inside them.
  const placed = new Set<LzChainId>();
  const aggregatorCommands = commands.flatMap(cmd => {
    const chainId = chainIdOf(cmd);
    const chainCommands = commandsByChain.get(chainId);
    if (!chainCommands) return [cmd];
    if (placed.has(chainId)) return [];
    placed.add(chainId);
    return chainCommands;
  });
  return { commands: aggregatorCommands, batches };
};

// Builds one chain's commands, batched and plain, and returns the batches its executeBatch calls run.
const buildChainAggregatorCommands = async (commands: Command[], chainId: LzChainId) => {
  const chain = LzChainId[chainId] as SUPPORTED_NETWORKS;
  const { aggregator, acm } = aggregatorAddresses(chain);
  const segments = segmentCommands(commands, chain);
  const encoded = segments.filter(isBatch).map(batched => encodeBatch(batched, aggregator, acm));

  const onChain = await readOnChainBatches(chain, aggregator);
  // `batches` keeps segment order, so the nth batch segment runs batches[n].
  const batches = onChain
    ? await assignIndices(encoded, onChain, chain, aggregator)
    : encoded.map(encodedBatch => toAggregatorBatch(encodedBatch, chain, aggregator));

  // BNB Chain commands stay local; every other chain keeps its dstChainId.
  const dstChainId = chainId === bscChainId() ? undefined : chainId;
  const command = (target: string, signature: string, params: unknown[]): Command => ({
    target,
    signature,
    params,
    dstChainId,
  });
  let nextBatch = 0;
  return {
    batches,
    commands: [
      // bytes32(0) is DEFAULT_ADMIN_ROLE
      command(acm, "grantRole(bytes32,address)", [constants.HashZero, aggregator]),
      ...segments.map(segment =>
        isBatch(segment)
          ? command(aggregator, "executeBatch(uint256)", [
              // An unread chain has no index: MaxUint256 reverts BatchNotFound if this proposal ever runs.
              batches[nextBatch++].index ?? constants.MaxUint256,
            ])
          : segment,
      ),
      command(acm, "revokeRole(bytes32,address)", [constants.HashZero, aggregator]),
    ],
  };
};

const aggregatorAddresses = (chain: SUPPORTED_NETWORKS) => {
  const addresses = NETWORK_ADDRESSES[chain as keyof typeof NETWORK_ADDRESSES] as
    | Partial<Record<string, string>>
    | undefined;
  const aggregator = addresses?.AUXILIARY_COMMANDS_AGGREGATOR;
  const acm = addresses?.ACCESS_CONTROL_MANAGER;
  if (!aggregator || !acm) throw new Error(`batch: no AuxiliaryCommandsAggregator on ${chain}`);
  return { aggregator, acm };
};

// Cuts a chain's commands into plain commands and batch() groups, in their original order. The commands of one
// batch() share a batchGroup object, so a group that shows up in two segments was split by other commands.
const segmentCommands = (commands: Command[], chain: SUPPORTED_NETWORKS): Segment[] => {
  const segments: Segment[] = [];
  for (const cmd of commands) {
    const last = segments[segments.length - 1];
    if (!cmd.batchGroup) segments.push(cmd);
    else if (Array.isArray(last) && last[0].batchGroup === cmd.batchGroup) last.push(cmd);
    else segments.push([cmd]);
  }
  const groups = segments.filter(isBatch).map(batched => batched[0].batchGroup);
  if (new Set(groups).size < groups.length) {
    throw new Error(`batch: other commands split a ${chain} batch(); keep its commands together`);
  }
  return segments;
};

// Encodes one batch() as its aggregator stores it: a giveCallPermission for each distinct permission the calls need,
// the calls, then the matching revokeCallPermission calls. Calls on the ACM need no grant, since the aggregator holds
// DEFAULT_ADMIN_ROLE while its batches run.
const encodeBatch = (commands: Command[], aggregator: string, acm: string): EncodedBatch => {
  const options = commands[0].batchGroup ?? {};
  const commandCalls = commands.map(cmd => {
    // A seeded call carries no value, so the aggregator could not forward it.
    if (BigNumber.from(cmd.value ?? 0).gt(0)) {
      throw new Error(`batch: ${cmd.signature} on ${cmd.target} sends value and can't be batched`);
    }
    return encodeCall(cmd.target, cmd.signature, cmd.params);
  });
  const permissions = [
    ...new Map(
      commands
        .filter(cmd => cmd.target.toLowerCase() !== acm.toLowerCase())
        .map(cmd => ({ target: cmd.target, signature: cmd.aclSignature ?? cmd.signature }))
        .map(permission => [`${permission.target.toLowerCase()} ${permission.signature}`, permission] as const),
    ).values(),
  ];
  const acmCall = (signature: string, permission: CallPermission) =>
    encodeCall(acm, signature, [permission.target, permission.signature, aggregator]);
  const calls = [
    ...permissions.map(permission => acmCall("giveCallPermission(address,string,address)", permission)),
    ...commandCalls,
    ...permissions.map(permission => acmCall("revokeCallPermission(address,string,address)", permission)),
  ];
  return { options, permissions, calls: options.raw ? calls.map(toRawCall) : calls };
};

// A call as the aggregator stores it by default: the signature, and the ABI-encoded arguments as data.
const encodeCall = (target: string, signature: string, params: unknown[]): AggregatorCall => {
  const fragment = utils.FunctionFragment.from(signature);
  // A timelock derives the selector from the signature string as written; a batched call must get the same selector.
  if (fragment.format() !== signature) {
    throw new Error(`batch: signature "${signature}" should be in the canonical form "${fragment.format()}"`);
  }
  return { target, signature, data: utils.defaultAbiCoder.encode(fragment.inputs, params) };
};

// A raw call carries its selector in the data and an empty signature, as in the Timelock.
const toRawCall = ({ target, signature, data }: AggregatorCall): AggregatorCall => ({
  target,
  signature: "",
  data: utils.id(signature).slice(0, 10) + data.slice(2),
});

// Gives every encoded batch its index on the chain. A seededIndex batch must already be seeded with these calls. An
// expectedIndex batch is either seeded there or next in line. Any other batch takes the next free index, so no seeded
// batch is reused, since the aggregator runs each batch only once. No two batches may share an index.
const assignIndices = async (
  encoded: EncodedBatch[],
  onChain: OnChainBatches,
  chain: SUPPORTED_NETWORKS,
  aggregator: string,
): Promise<AggregatorBatch[]> => {
  let nextFree = onChain.count;
  const batches: AggregatorBatch[] = [];
  for (const encodedBatch of encoded) {
    const { expectedIndex, seededIndex } = encodedBatch.options;
    const index = BigNumber.from(seededIndex ?? expectedIndex ?? nextFree);
    const seeded = index.lt(onChain.count) && sameCalls(await onChain.callsAt(index), encodedBatch.calls);
    if (seeded) {
      if (await onChain.executed(index)) {
        throw new Error(
          `batch: ${chain} batch ${index} already ran, and a batch runs only once; if this VIP already executed, ` +
            "build it at a block before its execution, and only drop the index to seed the calls again for a new proposal",
        );
      }
    } else if (seededIndex !== undefined || index.lt(onChain.count)) {
      throw new Error(
        `batch: ${chain} batch ${index} does not hold these calls; check its index, keep raw: true when pinning a ` +
          "raw batch, or fork after it was seeded",
      );
    } else if (!index.eq(nextFree)) {
      // addBatch only appends at the current batch count.
      throw new Error(`batch: ${chain} expectedIndex ${index} is not the next free index ${nextFree}`);
    } else {
      nextFree = nextFree.add(1);
    }
    batches.push(toAggregatorBatch(encodedBatch, chain, aggregator, index, seeded));
  }
  const indices = batches.map(({ index }) => String(index));
  if (new Set(indices).size < indices.length) {
    throw new Error(`batch: ${chain} has two batches at one index; check their expectedIndex and seededIndex`);
  }
  return batches;
};

// Nodes return addresses and hex data in mixed case, so both sides are lowercased before comparing.
const sameCalls = (a: AggregatorCall[], b: AggregatorCall[]) => {
  const key = (calls: AggregatorCall[]) =>
    JSON.stringify(calls.map(call => [call.target.toLowerCase(), call.signature, call.data.toLowerCase()]));
  return key(a) === key(b);
};

const toAggregatorBatch = (
  { calls, permissions }: EncodedBatch,
  chain: SUPPORTED_NETWORKS,
  aggregator: string,
  index?: BigNumber,
  seeded = false,
): AggregatorBatch => ({ network: chain, aggregator, index, seeded, calls, permissions });

// Reads what the chain's aggregator holds, or returns undefined when the chain is not read in this context. Sims read
// only the forked chain: every other chain resolves its batches in its own simulation. Live builds read every chain
// over its archive node.
const readOnChainBatches = async (
  chain: SUPPORTED_NETWORKS,
  aggregator: string,
): Promise<OnChainBatches | undefined> => {
  const simulation = isSimulation();
  if (simulation && chain !== FORKED_NETWORK) return undefined;
  const url = process.env[`ARCHIVE_NODE_${chain}`];
  if (!simulation && !url) throw new Error(`batch: set ARCHIVE_NODE_${chain} to look up its batches`);
  const contract = new Contract(
    aggregator,
    AGGREGATOR_ABI,
    simulation ? ethers.provider : new providers.JsonRpcProvider(url),
  );
  return {
    // ethers reports any failed eth_call as CALL_EXCEPTION, node errors included, so the original message is kept.
    count: await contract.getBatchCount().catch((error: { code?: string; message?: string }) => {
      if (error.code !== "CALL_EXCEPTION") throw error;
      throw new Error(
        `batch: reading getBatchCount() from the ${chain} aggregator at ${aggregator} failed; batch() needs an ` +
          `aggregator with getBatchCount(), and a failing node gives the same error: ${error.message}`,
      );
    }),
    callsAt: index => contract.getBatch(index),
    executed: index => contract.batchExecuted(index),
  };
};

// `batches` must all be on the batcher's chain and have their index, which both callers guarantee.
export const seedBatches = async (batcher: Signer, batches: AggregatorBatch[], overrides: Overrides = {}) => {
  for (const { network: chain, aggregator, index, calls } of batches) {
    const contract = new Contract(aggregator, AGGREGATOR_ABI, batcher);
    const tx = await contract["addBatch((address,string,bytes)[],uint256)"](calls, index, overrides);
    const receipt = await tx.wait();
    console.log(
      `[batch] ${chain}: seeded batch ${index} (${calls.length} calls, ${receipt.gasUsed} gas) in ${receipt.transactionHash}`,
    );
  }
};

// Commands without a dstChainId run on BNB Chain, or on its testnet when the proposal is built for testnets.
const bscChainId = () =>
  FORKED_NETWORK === "bsctestnet" || REMOTE_TESTNET_NETWORKS.includes(FORKED_NETWORK as string)
    ? LzChainId.bsctestnet
    : LzChainId.bscmainnet;

const chainIdOf = (cmd: Command) => cmd.dstChainId ?? bscChainId();

export const isSimulation = () => ["hardhat", "zksynctestnode"].includes(network.name);
