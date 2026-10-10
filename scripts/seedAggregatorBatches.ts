import { Contract, Wallet, providers } from "ethers";
import { seedBatches } from "src/auxiliaryCommandsAggregator";
import { AggregatorBatch, Proposal, SUPPORTED_NETWORKS } from "src/types";
import AGGREGATOR_ABI from "src/vip-framework/abi/AuxiliaryCommandsAggregator.json";

// The batcher wallet on one chain, over that chain's archive node.
const batcherOn = (network: SUPPORTED_NETWORKS) => {
  const key = process.env.AGGREGATOR_BATCHER_PRIVATE_KEY;
  if (!key) throw new Error("seedAggregatorBatches: set AGGREGATOR_BATCHER_PRIVATE_KEY");
  const provider = new providers.JsonRpcProvider(process.env[`ARCHIVE_NODE_${network}`]);
  return new Wallet(key.startsWith("0x") ? key : `0x${key}`, provider);
};

// Seeds chain by chain, after checking the batcher is authorized on every chain's aggregator.
const seedOnLiveChains = async (pending: AggregatorBatch[]) => {
  const chains = [...new Map(pending.map(batch => [batch.network, batch.aggregator]))].map(([network, aggregator]) => ({
    network,
    aggregator,
    batcher: batcherOn(network),
  }));
  for (const { network, aggregator, batcher } of chains) {
    const aggregatorContract = new Contract(aggregator, AGGREGATOR_ABI, batcher);
    if (!(await aggregatorContract.authorizedBatchers(batcher.address))) {
      throw new Error(`seedAggregatorBatches: ${batcher.address} is not an authorized batcher on ${network}`);
    }
  }
  for (const { network, batcher } of chains) {
    await seedBatches(
      batcher,
      pending.filter(batch => batch.network === network),
    );
  }
};

// Returns each chain's batch indices in the VIP's order, ready to pin as seededIndex.
const seedAggregatorBatches = async (vipPath: string) => {
  const { aggregatorBatches = [] }: Proposal = await (await import(`../vips/${vipPath}`)).default();
  if (aggregatorBatches.some(batch => batch.index === undefined)) {
    throw new Error("seedAggregatorBatches: run it against a live network, e.g. --network bscmainnet");
  }
  const indices: Partial<Record<SUPPORTED_NETWORKS, number[]>> = {};
  for (const { network, index, calls, seeded } of aggregatorBatches) {
    const chainIndices = (indices[network] ??= []);
    chainIndices.push(Number(index));
    console.log(
      `${network} batch ${chainIndices.length} (${calls.length} calls) ${
        seeded ? "already seeded" : "will be seeded"
      } at index ${index}`,
    );
  }
  await seedOnLiveChains(aggregatorBatches.filter(batch => !batch.seeded));
  console.log(
    `Pin each batch() in order with { seededIndex }, keeping raw: true on raw batches: ${JSON.stringify(indices)}`,
  );
  return indices;
};

export default seedAggregatorBatches;
