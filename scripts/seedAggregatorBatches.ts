import { Contract, Wallet, providers } from "ethers";
import { seedBatches } from "src/auxiliaryCommandsAggregator";
import { AggregatorBatch, Proposal, SUPPORTED_NETWORKS } from "src/types";
import AGGREGATOR_ABI from "src/vip-framework/abi/AuxiliaryCommandsAggregator.json";

const seed = async (pending: AggregatorBatch[]) => {
  if (pending.length === 0) return;
  const key = process.env.AGGREGATOR_BATCHER_PRIVATE_KEY;
  if (!key) throw new Error("seedAggregatorBatches: set AGGREGATOR_BATCHER_PRIVATE_KEY");
  const chains = [...new Map(pending.map(batch => [batch.network, batch.aggregator]))].map(([network, aggregator]) => ({
    network,
    aggregator,
    batcher: new Wallet(
      key.startsWith("0x") ? key : `0x${key}`,
      new providers.JsonRpcProvider(process.env[`ARCHIVE_NODE_${network}`]),
    ),
  }));

  // Every batcher is checked before any chain is seeded.
  for (const { network, aggregator, batcher } of chains) {
    if (!(await new Contract(aggregator, AGGREGATOR_ABI, batcher).authorizedBatchers(batcher.address))) {
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

// Returns each chain's batch indices in the VIP's order, ready to pin as actualIndex.
const seedAggregatorBatches = async (vipPath: string) => {
  const { aggregatorBatches = [] }: Proposal = await (await import(`../vips/${vipPath}`)).default();
  if (aggregatorBatches.some(batch => !batch.index)) {
    throw new Error("seedAggregatorBatches: run it against a live network, e.g. --network bscmainnet");
  }
  const indices: Partial<Record<SUPPORTED_NETWORKS, number[]>> = {};
  for (const { network, index, calls, seeded } of aggregatorBatches) {
    indices[network] = [...(indices[network] ?? []), Number(index)];
    console.log(
      `${network} batch ${indices[network]?.length} (${calls.length} calls) ${
        seeded ? "already seeded" : "will be seeded"
      } at index ${index}`,
    );
  }
  await seed(aggregatorBatches.filter(batch => !batch.seeded));
  console.log(`Pin each batch() in order with { actualIndex }: ${JSON.stringify(indices)}`);
  return indices;
};

export default seedAggregatorBatches;
