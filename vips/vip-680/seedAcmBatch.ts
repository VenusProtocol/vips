import hre, { ethers } from "hardhat";

import { ACM_BATCH_INDEX_BASE, AUX_COMMANDS_AGGREGATOR, OPERATOR } from "./addresses/bscmainnet";
import { type AcmCommand, buildAcmBatches } from "./bscmainnet";

// ---------------------------------------------------------------------------------------------------
// Seeds VIP-680's ACM grants onto the bscmainnet AuxiliaryCommandsAggregator as THREE batches — one
// per asset stack (USDT, USDC, U) — in consecutive slots starting at ACM_BATCH_INDEX_BASE.
//
//   npx hardhat run vips/vip-680/seedAcmBatch.ts --network bscmainnet
//
// Run this ONCE, by a human, from a wallet in the aggregator's `authorizedBatchers` allowlist, and
// only AFTER the VIP is final. Batches are append-only: seeding early means they become dead weight
// and every later batch shifts the indices the proposal encodes.
//
// The batch contents come from buildAcmBatches() in ./bscmainnet.ts — the single source of truth the
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

// Encode each {target, signature, params} into the aggregator's {target, data} Call struct.
const encodeCalls = (commands: AcmCommand[]) =>
  commands.map(c => ({
    target: c.target,
    data: new ethers.utils.Interface([`function ${c.signature}`]).encodeFunctionData(
      c.signature.slice(0, c.signature.indexOf("(")),
      c.params,
    ),
  }));

async function main() {
  if (hre.network.name !== "bscmainnet") {
    throw new Error(`seedAcmBatch: expected --network bscmainnet, got "${hre.network.name}"`);
  }

  const batches = buildAcmBatches();
  const flat = batches.flat();

  // Refuse to burn batch slots on placeholders. Every Hub-stack address and the Operator account must
  // be filled in addresses/bscmainnet.ts first.
  if (OPERATOR === ZERO) {
    throw new Error("seedAcmBatch: OPERATOR is still the zero address — decide it and fill it in");
  }
  const unresolved = flat.filter(c => c.params[0] === ZERO || c.params[2] === ZERO);
  if (unresolved.length > 0) {
    throw new Error(
      `seedAcmBatch: ${unresolved.length} of ${flat.length} entries still point at the zero address. ` +
        "Fill the TODO(deploy) placeholders in addresses/bscmainnet.ts from the deployments registry first.",
    );
  }

  const [signer] = await ethers.getSigners();
  const aggregator = new ethers.Contract(AUX_COMMANDS_AGGREGATOR, AGGREGATOR_ABI, signer);

  if (!(await aggregator.authorizedBatchers(signer.address))) {
    throw new Error(
      `seedAcmBatch: ${signer.address} is not in the aggregator's authorizedBatchers allowlist. ` +
        "Seed from a whitelisted batcher wallet.",
    );
  }

  // Must start exactly at the base index: the first batch lands at ACM_BATCH_INDEX_BASE, and each
  // subsequent one is appended in order. A drift here means the VIP's executeBatch indices are stale.
  const batchCount: number = (await aggregator.batchCount()).toNumber();
  if (batchCount !== ACM_BATCH_INDEX_BASE) {
    throw new Error(
      `seedAcmBatch: index drift — batchCount() is ${batchCount} but ACM_BATCH_INDEX_BASE is ` +
        `${ACM_BATCH_INDEX_BASE}. Set ACM_BATCH_INDEX_BASE = ${batchCount} in addresses/bscmainnet.ts, ` +
        "confirm the VIP re-encodes the three executeBatch commands from it, then re-run.",
    );
  }

  const byAccount = flat.reduce<Record<string, number>>((acc, c) => {
    acc[c.params[2]] = (acc[c.params[2]] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Aggregator:   ${AUX_COMMANDS_AGGREGATOR}`);
  console.log(`Batcher:      ${signer.address}`);
  console.log(`Base index:   ${ACM_BATCH_INDEX_BASE}`);
  console.log(`Batches:      ${batches.length} (${batches.map(b => b.length).join(" / ")} calls)`);
  console.log(`Total grants: ${flat.length}`);
  console.table(byAccount);

  for (let b = 0; b < batches.length; b++) {
    const expectedIndex = ACM_BATCH_INDEX_BASE + b;
    const calls = encodeCalls(batches[b]);

    console.log(`\nSeeding batch ${b + 1}/${batches.length} -> index ${expectedIndex} (${calls.length} calls)...`);

    // Indexed overload — reverts InvalidBatchIndex if another batch landed between the check above and
    // this transaction, instead of silently occupying a slot the proposal does not reference.
    const tx = await aggregator.addBatch(calls, expectedIndex);
    console.log(`  tx: ${tx.hash}`);
    const receipt = await tx.wait();

    const event = receipt.events?.find((e: { event: string }) => e.event === "BatchAdded");
    if (!event) {
      throw new Error(`seedAcmBatch: BatchAdded event not found in receipt for batch ${b}`);
    }
    const index: number = event.args?.index.toNumber();
    if (index !== expectedIndex) {
      throw new Error(`seedAcmBatch: batch ${b} landed at ${index}, expected ${expectedIndex}`);
    }

    // Read the stored batch back and deep-compare, so the index the VIP encodes is proven to hold
    // exactly these calls.
    const stored: { target: string; data: string }[] = await aggregator.getBatch(index);
    if (stored.length !== calls.length) {
      throw new Error(`seedAcmBatch: index ${index} stored ${stored.length} calls, expected ${calls.length}`);
    }
    for (let i = 0; i < calls.length; i++) {
      const sameTarget = ethers.utils.getAddress(stored[i].target) === ethers.utils.getAddress(calls[i].target);
      if (!sameTarget || stored[i].data !== calls[i].data) {
        throw new Error(
          `seedAcmBatch: mismatch at index ${index} call ${i}\n  stored:   ${stored[i].target} ${stored[i].data}` +
            `\n  expected: ${calls[i].target} ${calls[i].data}`,
        );
      }
    }
    console.log(`  index ${index} verified: all ${calls.length} calls match.`);
  }

  const first = ACM_BATCH_INDEX_BASE;
  const last = ACM_BATCH_INDEX_BASE + batches.length - 1;
  console.log(`\nAll ${batches.length} batches seeded and verified across indices ${first}..${last}.`);
  console.log("The VIP can be proposed (its three executeBatch commands reference exactly these slots).");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
