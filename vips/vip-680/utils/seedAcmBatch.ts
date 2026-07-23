import hre, { ethers } from "hardhat";

import { ACM_BATCH_INDEX, AUX_COMMANDS_AGGREGATOR, OPERATOR } from "../addresses/bscmainnet";
import { buildAcmBatch } from "../bscmainnet";

// ---------------------------------------------------------------------------------------------------
// Seeds VIP-680's 96 ACM grants as one batch on the bscmainnet AuxiliaryCommandsAggregator.
//
//   npx hardhat run vips/vip-680/utils/seedAcmBatch.ts --network bscmainnet
//
// Run this ONCE, by a human, from a wallet in the aggregator's `authorizedBatchers` allowlist, and
// only AFTER the VIP is final. Batches are append-only: seeding early means the batch becomes dead
// weight and every later batch shifts the index the proposal encodes.
//
// The batch contents come from buildAcmBatch() in ../bscmainnet.ts — the single source of truth the
// proposal, this script and the simulation all read, so they cannot drift apart.
// ---------------------------------------------------------------------------------------------------

const AGGREGATOR_ABI = [
  "function authorizedBatchers(address) view returns (bool)",
  "function batchCount() view returns (uint256)",
  "function addBatch((address target, bytes data)[] calls, uint256 expectedIndex) returns (uint256)",
  "function getBatch(uint256 index) view returns ((address target, bytes data)[])",
  "event BatchAdded(uint256 index)",
];

const ZERO = ethers.constants.AddressZero;

async function main() {
  if (hre.network.name !== "bscmainnet") {
    throw new Error(`seedAcmBatch: expected --network bscmainnet, got "${hre.network.name}"`);
  }

  const commands = buildAcmBatch();

  // Refuse to burn a batch slot on placeholders. Every Hub-stack address and the Operator account
  // must be filled in addresses/bscmainnet.ts first.
  if (OPERATOR === ZERO) {
    throw new Error("seedAcmBatch: OPERATOR is still the zero address — decide it and fill it in");
  }
  const unresolved = commands.filter(c => c.params[0] === ZERO || c.params[2] === ZERO);
  if (unresolved.length > 0) {
    throw new Error(
      `seedAcmBatch: ${unresolved.length} of ${commands.length} entries still point at the zero ` +
        "address. Fill the TODO(deploy) placeholders in addresses/bscmainnet.ts from the " +
        "deployments registry first.",
    );
  }

  // Encode {target, signature, params} into the aggregator's {target, data} Call struct.
  const calls = commands.map(c => ({
    target: c.target,
    data: new ethers.utils.Interface([`function ${c.signature}`]).encodeFunctionData(
      c.signature.slice(0, c.signature.indexOf("(")),
      c.params,
    ),
  }));

  const [signer] = await ethers.getSigners();
  const aggregator = new ethers.Contract(AUX_COMMANDS_AGGREGATOR, AGGREGATOR_ABI, signer);

  if (!(await aggregator.authorizedBatchers(signer.address))) {
    throw new Error(
      `seedAcmBatch: ${signer.address} is not in the aggregator's authorizedBatchers allowlist. ` +
        "Seed from a whitelisted batcher wallet.",
    );
  }

  const batchCount: number = (await aggregator.batchCount()).toNumber();
  if (batchCount !== ACM_BATCH_INDEX) {
    throw new Error(
      `seedAcmBatch: index drift — batchCount() is ${batchCount} but ACM_BATCH_INDEX is ` +
        `${ACM_BATCH_INDEX}. Set ACM_BATCH_INDEX = ${batchCount} in addresses/bscmainnet.ts, make ` +
        "sure the VIP re-encodes executeBatch with it, then re-run.",
    );
  }

  const byAccount = commands.reduce<Record<string, number>>((acc, c) => {
    acc[c.params[2]] = (acc[c.params[2]] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Aggregator:   ${AUX_COMMANDS_AGGREGATOR}`);
  console.log(`Batcher:      ${signer.address}`);
  console.log(`Target index: ${ACM_BATCH_INDEX}`);
  console.log(`Calls:        ${calls.length}`);
  console.table(byAccount);

  // Indexed overload — reverts InvalidBatchIndex if another batch landed between the check above and
  // this transaction, instead of silently occupying a slot the proposal does not reference.
  const tx = await aggregator.addBatch(calls, ACM_BATCH_INDEX);
  console.log(`\nTransaction hash: ${tx.hash}`);
  const receipt = await tx.wait();

  const event = receipt.events?.find((e: { event: string }) => e.event === "BatchAdded");
  if (!event) {
    throw new Error("seedAcmBatch: BatchAdded event not found in receipt");
  }
  const index: number = event.args?.index.toNumber();
  if (index !== ACM_BATCH_INDEX) {
    throw new Error(`seedAcmBatch: batch landed at ${index}, expected ${ACM_BATCH_INDEX}`);
  }

  // Read the stored batch back and deep-compare, so the index the VIP encodes is proven to hold
  // exactly these calls.
  console.log(`Verifying stored batch at index ${index}...`);
  const stored: { target: string; data: string }[] = await aggregator.getBatch(index);
  if (stored.length !== calls.length) {
    throw new Error(`seedAcmBatch: stored ${stored.length} calls, expected ${calls.length}`);
  }
  for (let i = 0; i < calls.length; i++) {
    const sameTarget = ethers.utils.getAddress(stored[i].target) === ethers.utils.getAddress(calls[i].target);
    if (!sameTarget || stored[i].data !== calls[i].data) {
      throw new Error(
        `seedAcmBatch: mismatch at call ${i}\n  stored:   ${stored[i].target} ${stored[i].data}\n  expected: ${calls[i].target} ${calls[i].data}`,
      );
    }
  }

  console.log(`All ${calls.length} calls match.`);
  console.log(`\nACM_BATCH_INDEX = ${index} is confirmed. The VIP can be proposed.`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
