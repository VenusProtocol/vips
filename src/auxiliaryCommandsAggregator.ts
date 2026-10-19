import { BigNumber, Contract, Overrides, Signer, constants, providers, utils } from "ethers";
import { FORKED_NETWORK, ethers, network } from "hardhat";

import { NETWORK_ADDRESSES } from "./networkAddresses";
import {
  AggregatorBatch,
  AggregatorCall,
  Batch,
  BatchOptions,
  CallPermission,
  Command,
  LzChainId,
  ProposalType,
  REMOTE_TESTNET_NETWORKS,
  SUPPORTED_NETWORKS,
} from "./types";
import AGGREGATOR_ABI from "./vip-framework/abi/AuxiliaryCommandsAggregator.json";

export const isBatch = (entry: Command | Batch): entry is Batch => "kind" in entry && entry.kind === "batch";

// Groups commands into one proposal entry. Batched calls run as the aggregator, so calls that must
// come from the timelock stay out of batch(). A batch too large for one addBatch runs out of gas when it is seeded, so
// seed it with { raw: true } or move commands out. One batch() per chain: a second repeats the grantRole and
// revokeRole commands, and the Timelock refuses an identical command queued at the same eta.
export const batch = (commands: Command[], options: BatchOptions = {}): Batch => {
  const { expectedIndex, seededIndex } = options;
  if (commands.length === 0) throw new Error("batch: a batch() needs at least one command");
  if (commands.some(isBatch)) throw new Error("batch: nested batches are not supported");
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
  return { kind: "batch", commands, options };
};

// Builds every command of the proposal, plain and batched. Each batch() comes out in place as
// grantRole(DEFAULT_ADMIN_ROLE), executeBatch(index), revokeRole; every other command stays as written.
export const buildCommandsWithBatches = async (
  entries: (Command | Batch)[],
  type: ProposalType | undefined,
): Promise<{ commands: Command[]; batches: AggregatorBatch[] }> => {
  // Only the Normal Timelock holds the ACM DEFAULT_ADMIN_ROLE that each chain lends its aggregator.
  if (type !== ProposalType.REGULAR) throw new Error("batch: only ProposalType.REGULAR proposals are supported");

  // `batches` keeps VIP order, so the nth batch() runs batches[n]. Each chain's aggregator is read once to give its
  // batches their indices.
  const batched = entries.filter(isBatch);
  const batches = batched.map(entry => encodeBatch(entry, chainIdOf(entry)));
  for (const chain of new Set(batches.map(batch => batch.network))) {
    const onChain = await readOnChainBatches(chain);
    if (onChain) await assignIndices(batches, batched, onChain, chain);
  }

  let next = 0;
  const commands = entries.flatMap(entry =>
    isBatch(entry) ? executeBatchCommands(batches[next++], chainIdOf(entry)) : [entry],
  );
  // The proposal keeps batches as aggregatorBatches, for seeding (sims, seedAggregatorBatches) and propose checks.
  return { commands, batches };
};

// The three commands that run one batch. bytes32(0) is DEFAULT_ADMIN_ROLE; the aggregator holds it only while its
// batch runs. BNB Chain commands stay local; every other chain keeps its dstChainId.
const executeBatchCommands = ({ network, aggregator, index }: AggregatorBatch, chainId: LzChainId): Command[] => {
  const { acm } = aggregatorAddresses(network);
  const dstChainId = chainId === bscChainId() ? undefined : chainId;
  const command = (target: string, signature: string, params: unknown[]): Command => ({
    target,
    signature,
    params,
    dstChainId,
  });
  return [
    command(acm, "grantRole(bytes32,address)", [constants.HashZero, aggregator]),
    // Unread chain: MaxUint256 is never a seeded index, so it reverts BatchNotFound, not a wrong batch.
    command(aggregator, "executeBatch(uint256)", [index ?? constants.MaxUint256]),
    command(acm, "revokeRole(bytes32,address)", [constants.HashZero, aggregator]),
  ];
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

// Encodes one batch() as its aggregator stores it: a giveCallPermission for each distinct permission the calls need,
// the calls, then the matching revokeCallPermission calls. Calls on the ACM need no grant, since the aggregator holds
// DEFAULT_ADMIN_ROLE while its batches run. The index and seeded flag are set once the chain is read.
const encodeBatch = ({ commands, options }: Batch, chainId: LzChainId): AggregatorBatch => {
  const network = LzChainId[chainId] as SUPPORTED_NETWORKS;
  const { aggregator, acm } = aggregatorAddresses(network);
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
  return {
    network,
    aggregator,
    index: undefined,
    seeded: false,
    permissions,
    calls: options.raw ? calls.map(toRawCall) : calls,
  };
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
export const toRawCall = ({ target, signature, data }: AggregatorCall): AggregatorCall => ({
  target,
  signature: "",
  data: utils.id(signature).slice(0, 10) + data.slice(2),
});

// Gives every batch its index on the chain. A seededIndex batch must already be seeded with these calls. An
// expectedIndex batch is either seeded there or next in line. Any other batch takes the next free index, so no seeded
// batch is reused, since the aggregator runs each batch only once. No two batches may share an index.
const assignIndices = async (
  batches: AggregatorBatch[],
  batched: Batch[],
  { contract, count }: { contract: Contract; count: BigNumber },
  chain: SUPPORTED_NETWORKS,
) => {
  let nextFree = count;
  for (const [i, batch] of batches.entries()) {
    if (batch.network !== chain) continue;
    const { expectedIndex, seededIndex } = batched[i].options;
    const index = BigNumber.from(seededIndex ?? expectedIndex ?? nextFree);
    const seeded = index.lt(count) && sameCalls(await contract.getBatch(index), batch.calls);
    if (seeded) {
      if (await contract.batchExecuted(index)) {
        throw new Error(
          `batch: ${chain} batch ${index} already ran, and a batch runs only once; if this VIP already executed, ` +
            "build it at a block before its execution, and only drop the index to seed the calls again for a new proposal",
        );
      }
    } else if (seededIndex !== undefined || index.lt(count)) {
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
    Object.assign(batch, { index, seeded });
  }
  const indices = batches.filter(batch => batch.network === chain).map(({ index }) => String(index));
  if (new Set(indices).size < indices.length) {
    throw new Error(`batch: ${chain} has two batches at one index; check their expectedIndex and seededIndex`);
  }
};

// Nodes return addresses and hex data in mixed case, so both sides are lowercased before comparing.
const sameCalls = (a: AggregatorCall[], b: AggregatorCall[]) => {
  const key = (calls: AggregatorCall[]) =>
    JSON.stringify(calls.map(call => [call.target.toLowerCase(), call.signature, call.data.toLowerCase()]));
  return key(a) === key(b);
};

// Reads the chain's aggregator and its batch count, or returns undefined when the chain is not read in this context.
// Sims read only the forked chain: every other chain resolves its batches in its own simulation. Live builds read every
// chain over its archive node.
const readOnChainBatches = async (chain: SUPPORTED_NETWORKS) => {
  const simulation = isSimulation();
  if (simulation && chain !== FORKED_NETWORK) return undefined;
  const { aggregator } = aggregatorAddresses(chain);
  const url = process.env[`ARCHIVE_NODE_${chain}`];
  if (!simulation && !url) throw new Error(`batch: set ARCHIVE_NODE_${chain} to look up its batches`);
  const contract = new Contract(
    aggregator,
    AGGREGATOR_ABI,
    simulation ? ethers.provider : new providers.JsonRpcProvider(url),
  );
  // ethers reports any failed eth_call as CALL_EXCEPTION, node errors included, so the original message is kept.
  const count: BigNumber = await contract.getBatchCount().catch((error: { code?: string; message?: string }) => {
    if (error.code !== "CALL_EXCEPTION") throw error;
    throw new Error(
      `batch: reading getBatchCount() from the ${chain} aggregator at ${aggregator} failed; batch() needs an ` +
        `aggregator with getBatchCount(), and a failing node gives the same error: ${error.message}`,
    );
  });
  return { contract, count };
};

// `batches` must all be on the batcher's chain and have their index, which both callers guarantee. Each batch is
// marked seeded once its transaction lands, so a failure partway leaves the earlier ones marked.
export const seedBatches = async (batcher: Signer, batches: AggregatorBatch[], overrides: Overrides = {}) => {
  for (const batch of batches) {
    const { network: chain, aggregator, index, calls } = batch;
    const contract = new Contract(aggregator, AGGREGATOR_ABI, batcher);
    const tx = await contract["addBatch((address,string,bytes)[],uint256)"](calls, index, overrides);
    const receipt = await tx.wait();
    batch.seeded = true;
    console.log(
      `[batch] ${chain}: seeded batch ${index} (${calls.length} calls, ${receipt.gasUsed} gas) in ${receipt.transactionHash}`,
    );
  }
};

// Commands without a dstChainId run on BNB Chain, or on its testnet when the proposal is built for testnets.
export const bscChainId = () =>
  FORKED_NETWORK === "bsctestnet" || REMOTE_TESTNET_NETWORKS.includes(FORKED_NETWORK as string)
    ? LzChainId.bsctestnet
    : LzChainId.bscmainnet;

const chainIdOf = (entry: Command | Batch) => {
  const command = isBatch(entry) ? entry.commands[0] : entry;
  return command.dstChainId ?? bscChainId();
};

export const isSimulation = () => ["hardhat", "zksynctestnode"].includes(network.name);
