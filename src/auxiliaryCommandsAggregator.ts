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

type StoredCall = Pick<AggregatorCall, "target" | "data">;

interface StoredBatches {
  count: BigNumber;
  get: (index: BigNumber) => Promise<StoredCall[]>;
}

// An aggregator's stored batches, or undefined when its chain is not read in this context.
export type ReadBatches = (chain: SUPPORTED_NETWORKS, aggregator: string) => Promise<StoredBatches | undefined>;

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
    throw new Error(`aggregate: signature "${signature}" should be in the canonical form "${fragment.format()}"`);
  }
  return { target, signature, data: new utils.Interface([fragment]).encodeFunctionData(fragment, params) };
};

// Turns the commands into one aggregator batch on their chain. Batched calls run as the aggregator, so calls that must
// come from the timelock stay out of batch(). A batch too large for one addBatch runs out of gas when it is stored, so
// split its commands across batch() calls.
export const batch = (commands: Command[], options: BatchOptions = {}): Command[] => {
  const { expectedIndex, actualIndex } = options;
  if (expectedIndex !== undefined && actualIndex !== undefined) {
    throw new Error("batch: set expectedIndex or actualIndex, not both");
  }
  const index = expectedIndex ?? actualIndex;
  if (index !== undefined && (!Number.isInteger(index) || index < 0)) {
    throw new Error(`batch: ${index} is not an index`);
  }
  // Each chain's aggregator holds its own batches.
  if (new Set(commands.map(cmd => cmd.dstChainId)).size > 1) {
    throw new Error("batch: a batch() must hold one chain's commands");
  }
  const batchGroup = { ...options };
  return commands.map(cmd => ({ ...cmd, batchGroup }));
};

const toBatch = (batched: BatchedCommand[]) => {
  const grants = [...new Map(batched.flatMap(({ grant }) => (grant ? [[grant.key, grant] as const] : []))).values()];
  return {
    calls: [...grants.map(g => g.give), ...batched.map(b => b.call), ...grants.map(g => g.revoke)],
    permissions: grants.map(g => g.permission),
  };
};

const planChain = (commands: Command[], chain: SUPPORTED_NETWORKS) => {
  const addresses = NETWORK_ADDRESSES[chain as keyof typeof NETWORK_ADDRESSES] as
    | Partial<Record<string, string>>
    | undefined;
  const aggregator = addresses?.AUXILIARY_COMMANDS_AGGREGATOR;
  const acm = addresses?.ACCESS_CONTROL_MANAGER;
  if (!aggregator || !acm) throw new Error(`aggregate: no AuxiliaryCommandsAggregator on ${chain}`);

  const toBatchedCommand = (cmd: Command, group: BatchOptions): BatchedCommand => {
    // A stored call carries no value, so the aggregator could not forward it.
    if (BigNumber.from(cmd.value ?? 0).gt(0)) {
      throw new Error(`aggregate: ${cmd.signature} on ${cmd.target} sends value and can't be batched`);
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

// Every batch gets its own index and no stored batch is reused, as the planned aggregator upgrade runs each batch only
// once.
const resolveIndices = async (
  chain: SUPPORTED_NETWORKS,
  aggregator: string,
  runs: BatchedCommand[][],
  stored: StoredBatches,
) => {
  let next = stored.count;
  const batches: AggregatorBatch[] = [];
  for (const run of runs) {
    const { expectedIndex, actualIndex } = run[0].group;
    const plan = toBatch(run);
    const pin = actualIndex ?? expectedIndex;
    if (pin === undefined) {
      batches.push({ network: chain, aggregator, index: next, seeded: false, ...plan });
      next = next.add(1);
      continue;
    }
    const index = BigNumber.from(pin);
    const seeded =
      index.lt(stored.count) &&
      (await stored.get(index)).map(c => (c.target + c.data).toLowerCase()).join() ===
        plan.calls.map(c => (c.target + c.data).toLowerCase()).join();
    if (!seeded && actualIndex !== undefined) {
      throw new Error(
        `aggregate: ${chain} batch ${index} does not hold these calls; check actualIndex, or fork after it was stored`,
      );
    }
    // addBatch stores only at the current batch count.
    if (!seeded && !index.eq(next)) {
      throw new Error(`aggregate: ${chain} expectedIndex ${index} is not the next free index ${next}`);
    }
    if (!seeded) next = next.add(1);
    batches.push({ network: chain, aggregator, index, seeded, ...plan });
  }
  return batches;
};

const storedBatches = async (aggregator: Contract): Promise<StoredBatches> => ({
  count: await aggregator.batchCount(),
  get: index => aggregator.getBatch(index),
});

// Sims read only the forked chain: every other chain resolves its batches in its own simulation.
const readStoredBatches: ReadBatches = async (chain, aggregator) => {
  if (isSimulation()) {
    return chain === FORKED_NETWORK
      ? storedBatches(new Contract(aggregator, AGGREGATOR_ABI, ethers.provider))
      : undefined;
  }
  const url = process.env[`ARCHIVE_NODE_${chain}`];
  if (!url) throw new Error(`aggregate: set ARCHIVE_NODE_${chain} to look up its batches`);
  return storedBatches(new Contract(aggregator, AGGREGATOR_ABI, new providers.JsonRpcProvider(url)));
};

// Commands without a dstChainId run on BNB Chain, or on its testnet when the proposal is built for testnets.
const homeChain = () =>
  FORKED_NETWORK === "bsctestnet" || REMOTE_TESTNET_NETWORKS.includes(FORKED_NETWORK as string)
    ? LzChainId.bsctestnet
    : LzChainId.bscmainnet;

const aggregateChain = async (commands: Command[], chainId: LzChainId, readBatches: ReadBatches) => {
  const chain = LzChainId[chainId] as SUPPORTED_NETWORKS;
  const { aggregator, acm, segments } = planChain(commands, chain);
  const runs = segments.filter((s): s is BatchedCommand[] => Array.isArray(s));
  const groups = runs.map(run => run[0].group);
  if (new Set(groups).size < groups.length) {
    throw new Error(`aggregate: other commands split a ${chain} batch(); keep its commands together`);
  }

  const stored = await readBatches(chain, aggregator);
  const batches = stored
    ? await resolveIndices(chain, aggregator, runs, stored)
    : runs.map(run => ({ network: chain, aggregator, index: undefined, seeded: false, ...toBatch(run) }));
  const indices = batches.flatMap(({ index }) => (index ? [index.toString()] : []));
  if (new Set(indices).size < indices.length) {
    throw new Error(`aggregate: ${chain} has two batches at one index; check their expectedIndex and actualIndex`);
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
      ...segments.map(s =>
        Array.isArray(s)
          ? chainCommand(aggregator, "executeBatch(uint256)", [batches[next++].index ?? constants.MaxUint256])
          : s,
      ),
      chainCommand(acm, "revokeRole(bytes32,address)", [constants.HashZero, aggregator]),
    ],
  };
};

// Aggregates every chain that has a batch().
export const aggregateCommands = async (
  commands: Command[],
  type: ProposalType | undefined,
  readBatches: ReadBatches = readStoredBatches,
): Promise<{ commands: Command[]; batches: AggregatorBatch[] }> => {
  // Only the Normal Timelock holds the ACM DEFAULT_ADMIN_ROLE that each chain lends its aggregator.
  if (type !== ProposalType.REGULAR) throw new Error("aggregate: only ProposalType.REGULAR proposals are supported");

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
    const tx = await aggregator["addBatch((address,bytes)[],uint256)"](
      calls.map(({ target, data }) => ({ target, data })),
      index,
      overrides,
    );
    const receipt = await tx.wait();
    console.log(
      `[aggregate] ${chain}: seeded batch ${index} (${calls.length} calls, ${receipt.gasUsed} gas) in ${receipt.transactionHash}`,
    );
  }
};
