/**
 * Seeds the VIP-642 batch onto a chain's CommandsAggregator.
 *
 * Run once per aggregator chain (bscmainnet, ethereum, arbitrumone), by an authorized batcher, BEFORE the VIP is
 * proposed. The printed index must match BATCH_INDEX[chain] in vips/vip-642/bscmainnet.ts.
 *
 *   npx hardhat run vips/vip-642/scripts/seed-aggregators.ts --network <chain>
 *   # for zksync add: --config hardhat.config.zksync.ts   (n/a here — no zksync batch)
 */
import { ethers, network } from "hardhat";

import { AGGREGATOR, AggregatorChain, SeedCommand, buildBatch } from "../aggregatorBatches";

const AGGREGATOR_ABI = [
  "function addBatch((address target, bytes data)[] calls) external returns (uint256 index)",
  "function batchCount() external view returns (uint256)",
];

const encode = (cmd: SeedCommand): { target: string; data: string } => ({
  target: cmd.target,
  data: new ethers.utils.Interface([`function ${cmd.signature}`]).encodeFunctionData(cmd.signature, cmd.params),
});

async function main() {
  const chain = network.name as AggregatorChain;
  if (!(chain in AGGREGATOR)) throw new Error(`No VIP-642 aggregator batch for network "${chain}"`);

  const { aggregator } = AGGREGATOR[chain];
  const batch = buildBatch(chain);
  const calls = batch.map(encode);

  const [signer] = await ethers.getSigners();
  const contract = new ethers.Contract(aggregator, AGGREGATOR_ABI, signer);

  const nextIndex: number = (await contract.batchCount()).toNumber();
  console.log(`Chain ${chain} — aggregator ${aggregator}`);
  console.log(`  Seeding ${calls.length} calls; batch will land at index ${nextIndex}.`);

  const tx = await contract.addBatch(calls);
  const receipt = await tx.wait();
  console.log(`  addBatch() confirmed in ${receipt.transactionHash}. Wire index ${nextIndex} into the VIP.`);
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  },
);
