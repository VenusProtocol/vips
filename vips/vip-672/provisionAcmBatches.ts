import hre, { ethers } from "hardhat";

import { AUX_COMMANDS_AGGREGATOR, SPOKE_SOURCE_GRANTS_BATCH_INDEX } from "./addresses/bscmainnet";
import { buildSpokeSourceGrantsBatch, encodeAcmBatch } from "./bscmainnet";

// ---------------------------------------------------------------------------------------------------
// Stores VIP-672's 60 Spoke source grants (./bscmainnet.ts) on the bscmainnet AuxiliaryCommandsAggregator,
// as one batch at SPOKE_SOURCE_GRANTS_BATCH_INDEX:
//
//   npx hardhat run vips/vip-672/provisionAcmBatches.ts --network bscmainnet
//
// Run once, by hand, from a wallet in the aggregator's `authorizedBatchers` allowlist, and only once VIP-672 is final.
// Batches are append-only, so anything stored early is dead weight and shifts every index that follows.
//
// Contents come from `buildSpokeSourceGrantsBatch`, which the simulation also reads.
// ---------------------------------------------------------------------------------------------------

const AGGREGATOR_ABI = [
  "function authorizedBatchers(address) view returns (bool)",
  "function batchCount() view returns (uint256)",
  "function addBatch((address target, bytes data)[] calls, uint256 expectedIndex) returns (uint256)",
  "function getBatch(uint256 index) view returns ((address target, bytes data)[])",
  "event BatchAdded(uint256 index)",
];

async function main() {
  if (hre.network.name !== "bscmainnet") {
    throw new Error(`provisionAcmBatches: expected --network bscmainnet, got "${hre.network.name}"`);
  }

  const batch = buildSpokeSourceGrantsBatch();

  const [signer] = await ethers.getSigners();
  const aggregator = new ethers.Contract(AUX_COMMANDS_AGGREGATOR, AGGREGATOR_ABI, signer);

  if (!(await aggregator.authorizedBatchers(signer.address))) {
    throw new Error(
      `provisionAcmBatches: ${signer.address} is not in the aggregator's authorizedBatchers allowlist. ` +
        "Run from a whitelisted batcher wallet.",
    );
  }

  // A drift here means the proposal's executeBatch index is stale.
  const batchCount: number = (await aggregator.batchCount()).toNumber();
  if (batchCount !== SPOKE_SOURCE_GRANTS_BATCH_INDEX) {
    throw new Error(
      `provisionAcmBatches: index drift, batchCount() is ${batchCount} but SPOKE_SOURCE_GRANTS_BATCH_INDEX is ` +
        `${SPOKE_SOURCE_GRANTS_BATCH_INDEX}. Set it to ${batchCount} in addresses/bscmainnet.ts, then re-run.`,
    );
  }

  const byAccount = batch.reduce<Record<string, number>>((acc, c) => {
    acc[c.params[2]] = (acc[c.params[2]] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Aggregator:   ${AUX_COMMANDS_AGGREGATOR}`);
  console.log(`Batcher:      ${signer.address}`);
  console.log(`Index:        ${SPOKE_SOURCE_GRANTS_BATCH_INDEX}`);
  console.log(`Total grants: ${batch.length}`);
  console.table(byAccount);

  const calls = encodeAcmBatch(batch);

  // Indexed overload: reverts InvalidBatchIndex if another batch landed since the check above, rather than
  // silently occupying a slot the proposal does not reference.
  const tx = await aggregator.addBatch(calls, SPOKE_SOURCE_GRANTS_BATCH_INDEX);
  console.log(`tx: ${tx.hash}`);
  const receipt = await tx.wait();

  const event = receipt.events?.find((e: { event: string }) => e.event === "BatchAdded");
  const index: number | undefined = event?.args?.index.toNumber();
  if (index !== SPOKE_SOURCE_GRANTS_BATCH_INDEX) {
    throw new Error(`provisionAcmBatches: batch landed at ${index}, expected ${SPOKE_SOURCE_GRANTS_BATCH_INDEX}`);
  }

  // Read back, so the index the proposal encodes is proven to hold exactly these calls.
  const stored: { target: string; data: string }[] = await aggregator.getBatch(index);
  if (stored.length !== calls.length) {
    throw new Error(`provisionAcmBatches: index ${index} stored ${stored.length} calls, expected ${calls.length}`);
  }
  for (let i = 0; i < calls.length; i++) {
    const sameTarget = ethers.utils.getAddress(stored[i].target) === ethers.utils.getAddress(calls[i].target);
    if (!sameTarget || stored[i].data !== calls[i].data) {
      throw new Error(`provisionAcmBatches: mismatch at index ${index} call ${i}`);
    }
  }

  console.log(`
Stored and verified: all ${calls.length} calls at index ${index}, block ${receipt.blockNumber}.

Next: set FORK_BLOCK in simulations/vip-672/bscmainnet.ts to a block after ${receipt.blockNumber}, so
the simulation deep-compares the batch actually stored on chain instead of storing its own on the fork.
If any role string or address changes after this, the stored batch is stale: set
SPOKE_SOURCE_GRANTS_BATCH_INDEX to the new batchCount() and re-run this script.
`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
