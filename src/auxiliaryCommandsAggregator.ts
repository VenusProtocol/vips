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

interface SeededBatches {
  count: BigNumber;
  get: (index: BigNumber) => Promise<AggregatorCall[]>;
  executed: (index: BigNumber) => Promise<boolean>;
}

// An aggregator's seeded batches, or undefined when its chain is not read in this context.
export type ReadBatches = (chain: SUPPORTED_NETWORKS, aggregator: string) => Promise<SeededBatches | undefined>;

interface BatchedCommand {
  call: AggregatorCall;
  // undefined for ACM calls: the aggregator holds DEFAULT_ADMIN_ROLE while its batches run
  grant?: { key: string; permission: CallPermission; give: AggregatorCall; revoke: AggregatorCall };
  group: BatchOptions;
}

export const isSimulation = () => ["hardhat", "zksynctestnode"].includes(network.name);

const toCall = (target: string, signature: string, params: unknown[]): AggregatorCall => {
  const fragment = utils.FunctionFragment.from(signature);
  // A timelock derives the selector from the signature string as written; a batched call must get the same selector.
  if (fragment.format() !== signature) {
    throw new Error(`batch: signature "${signature}" should be in the canonical form "${fragment.format()}"`);
  }
  return { target, signature, data: utils.defaultAbiCoder.encode(fragment.inputs, params) };
};

// Turns the commands into one aggregator batch on their chain. Batched calls run as the aggregator, so calls that must
// come from the timelock stay out of batch(). A batch too large for one addBatch runs out of gas when it is seeded, so
// split its commands across batch() calls or seed it with { raw: true }.
export const batch = (commands: Command[], options: BatchOptions = {}): Command[] => {
  const { expectedIndex, storedIndex } = options;
  if (expectedIndex !== undefined && storedIndex !== undefined) {
    throw new Error("batch: set expectedIndex or storedIndex, not both");
  }
  const index = expectedIndex ?? storedIndex;
  if (index !== undefined && (!Number.isInteger(index) || index < 0)) {
    throw new Error(`batch: ${index} is not an index`);
  }
  // Each chain's aggregator holds its own batches.
  if (new Set(commands.map(cmd => cmd.dstChainId ?? homeChain())).size > 1) {
    throw new Error("batch: a batch() must hold one chain's commands");
  }
  const batchGroup = { ...options };
  return commands.map(cmd => ({ ...cmd, batchGroup }));
};

const toBatch = (batched: BatchedCommand[]) => {
  const grants = [...new Map(batched.flatMap(({ grant }) => (grant ? [[grant.key, grant] as const] : []))).values()];
  const calls = [
    ...grants.map(grant => grant.give),
    ...batched.map(({ call }) => call),
    ...grants.map(grant => grant.revoke),
  ];
  return {
    // A raw call carries its selector in the data and an empty signature, as in the Timelock.
    calls: batched[0].group.raw
      ? calls.map(({ target, signature, data }) => ({
          target,
          signature: "",
          data: utils.id(signature).slice(0, 10) + data.slice(2),
        }))
      : calls,
    permissions: grants.map(grant => grant.permission),
  };
};

const planChain = (commands: Command[], chain: SUPPORTED_NETWORKS) => {
  const addresses = NETWORK_ADDRESSES[chain as keyof typeof NETWORK_ADDRESSES] as
    | Partial<Record<string, string>>
    | undefined;
  const aggregator = addresses?.AUXILIARY_COMMANDS_AGGREGATOR;
  const acm = addresses?.ACCESS_CONTROL_MANAGER;
  if (!aggregator || !acm) throw new Error(`batch: no AuxiliaryCommandsAggregator on ${chain}`);

  const toBatchedCommand = (cmd: Command, group: BatchOptions): BatchedCommand => {
    // A seeded call carries no value, so the aggregator could not forward it.
    if (BigNumber.from(cmd.value ?? 0).gt(0)) {
      throw new Error(`batch: ${cmd.signature} on ${cmd.target} sends value and can't be batched`);
    }
    const call = toCall(cmd.target, cmd.signature, cmd.params);
    if (cmd.target.toLowerCase() === acm.toLowerCase()) return { call, group };
    const permission = { target: cmd.target, signature: cmd.aclSignature ?? cmd.signature };
    const permissionArgs = [cmd.target, permission.signature, aggregator];
    return {
      call,
      group,
      grant: {
        key: `${cmd.target.toLowerCase()} ${permission.signature}`,
        permission,
        give: toCall(acm, "giveCallPermission(address,string,address)", permissionArgs),
        revoke: toCall(acm, "revokeCallPermission(address,string,address)", permissionArgs),
      },
    };
  };

  const segments: (Command | BatchedCommand[])[] = [];
  for (const cmd of commands) {
    const last = segments[segments.length - 1];
    const group = cmd.batchGroup;
    if (!group) segments.push(cmd);
    else if (Array.isArray(last) && last[0].group === group) last.push(toBatchedCommand(cmd, group));
    else segments.push([toBatchedCommand(cmd, group)]);
  }
  return { aggregator, acm, segments };
};

// Every batch gets its own index and no seeded batch is reused, since the aggregator runs each batch only once.
const resolveIndices = async (
  chain: SUPPORTED_NETWORKS,
  aggregator: string,
  runs: BatchedCommand[][],
  onChain: SeededBatches,
) => {
  let next = onChain.count;
  const batches: AggregatorBatch[] = [];
  for (const run of runs) {
    const { expectedIndex, storedIndex } = run[0].group;
    const plan = toBatch(run);
    // An unpinned batch takes the next free index, past every seeded batch.
    const index = BigNumber.from(storedIndex ?? expectedIndex ?? next);
    const seededCalls = index.lt(onChain.count) ? await onChain.get(index) : [];
    const seeded =
      JSON.stringify(seededCalls.map(call => [call.target.toLowerCase(), call.signature, call.data.toLowerCase()])) ===
      JSON.stringify(plan.calls.map(call => [call.target.toLowerCase(), call.signature, call.data.toLowerCase()]));
    if (seeded && (await onChain.executed(index))) {
      throw new Error(
        `batch: ${chain} batch ${index} already ran, and a batch runs only once; if this VIP already executed, build ` +
          "it at a block before its execution, and only drop the index to seed the calls again for a new proposal",
      );
    }
    if (!seeded && storedIndex !== undefined) {
      throw new Error(
        `batch: ${chain} batch ${index} does not hold these calls; check storedIndex, keep raw: true when pinning a ` +
          "raw batch, or fork after it was seeded",
      );
    }
    // addBatch only appends at the current batch count.
    if (!seeded && !index.eq(next)) {
      throw new Error(`batch: ${chain} expectedIndex ${index} is not the next free index ${next}`);
    }
    if (!seeded) next = next.add(1);
    batches.push({ network: chain, aggregator, index, seeded, ...plan });
  }
  return batches;
};

// Sims read only the forked chain: every other chain resolves its batches in its own simulation.
const readSeededBatches: ReadBatches = async (chain, aggregator) => {
  if (isSimulation() && chain !== FORKED_NETWORK) return undefined;
  const url = process.env[`ARCHIVE_NODE_${chain}`];
  if (!isSimulation() && !url) throw new Error(`batch: set ARCHIVE_NODE_${chain} to look up its batches`);
  const contract = new Contract(
    aggregator,
    AGGREGATOR_ABI,
    isSimulation() ? ethers.provider : new providers.JsonRpcProvider(url),
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
    get: index => contract.getBatch(index),
    executed: index => contract.batchExecuted(index),
  };
};

// Commands without a dstChainId run on BNB Chain, or on its testnet when the proposal is built for testnets.
const homeChain = () =>
  FORKED_NETWORK === "bsctestnet" || REMOTE_TESTNET_NETWORKS.includes(FORKED_NETWORK as string)
    ? LzChainId.bsctestnet
    : LzChainId.bscmainnet;

const aggregateChain = async (commands: Command[], chainId: LzChainId, readBatches: ReadBatches) => {
  const chain = LzChainId[chainId] as SUPPORTED_NETWORKS;
  const { aggregator, acm, segments } = planChain(commands, chain);
  const runs = segments.filter((segment): segment is BatchedCommand[] => Array.isArray(segment));
  const groups = runs.map(run => run[0].group);
  if (new Set(groups).size < groups.length) {
    throw new Error(`batch: other commands split a ${chain} batch(); keep its commands together`);
  }

  const onChain = await readBatches(chain, aggregator);
  const batches = onChain
    ? await resolveIndices(chain, aggregator, runs, onChain)
    : runs.map(run => ({ network: chain, aggregator, index: undefined, seeded: false, ...toBatch(run) }));
  const indices = batches.flatMap(({ index }) => (index ? [index.toString()] : []));
  if (new Set(indices).size < indices.length) {
    throw new Error(`batch: ${chain} has two batches at one index; check their expectedIndex and storedIndex`);
  }

  const dstChainId = chainId === homeChain() ? undefined : chainId;
  const chainCommand = (target: string, signature: string, params: unknown[]): Command => ({
    target,
    signature,
    params,
    dstChainId,
  });
  let next = 0;
  return {
    batches,
    commands: [
      // bytes32(0) is DEFAULT_ADMIN_ROLE
      chainCommand(acm, "grantRole(bytes32,address)", [constants.HashZero, aggregator]),
      // MaxUint256 reverts BatchNotFound if a proposal built without reading the chain ever runs
      ...segments.map(segment =>
        Array.isArray(segment)
          ? chainCommand(aggregator, "executeBatch(uint256)", [batches[next++].index ?? constants.MaxUint256])
          : segment,
      ),
      chainCommand(acm, "revokeRole(bytes32,address)", [constants.HashZero, aggregator]),
    ],
  };
};

// Aggregates every chain that has a batch().
export const aggregateCommands = async (
  commands: Command[],
  type: ProposalType | undefined,
  readBatches: ReadBatches = readSeededBatches,
): Promise<{ commands: Command[]; batches: AggregatorBatch[] }> => {
  // Only the Normal Timelock holds the ACM DEFAULT_ADMIN_ROLE that each chain lends its aggregator.
  if (type !== ProposalType.REGULAR) throw new Error("batch: only ProposalType.REGULAR proposals are supported");

  const home = homeChain();
  const chainOf = (cmd: Command) => cmd.dstChainId ?? home;
  const chainIds = new Set(commands.flatMap(cmd => (cmd.batchGroup ? [chainOf(cmd)] : [])));
  const rewritten = new Map<LzChainId, Command[]>();
  const batches: AggregatorBatch[] = [];
  for (const chainId of chainIds) {
    const aggregated = await aggregateChain(
      commands.filter(cmd => chainOf(cmd) === chainId),
      chainId,
      readBatches,
    );
    rewritten.set(chainId, aggregated.commands);
    batches.push(...aggregated.batches);
  }

  // Each aggregated chain's rewritten commands take the place of its first command.
  const emitted = new Set<LzChainId>();
  return {
    commands: commands.flatMap(cmd => {
      const chainId = chainOf(cmd);
      const chainCommands = rewritten.get(chainId);
      if (!chainCommands) return [cmd];
      if (emitted.has(chainId)) return [];
      emitted.add(chainId);
      return chainCommands;
    }),
    batches,
  };
};

// `batches` must all be on the batcher's chain.
export const seedBatches = async (batcher: Signer, batches: AggregatorBatch[], overrides: Overrides = {}) => {
  for (const { network: chain, aggregator: address, index, calls } of batches) {
    const aggregator = new Contract(address, AGGREGATOR_ABI, batcher);
    const tx = await aggregator["addBatch((address,string,bytes)[],uint256)"](calls, index, overrides);
    const receipt = await tx.wait();
    console.log(
      `[batch] ${chain}: seeded batch ${index} (${calls.length} calls, ${receipt.gasUsed} gas) in ${receipt.transactionHash}`,
    );
  }
};
