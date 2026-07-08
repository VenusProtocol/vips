/**
 * Verifies the seeded VIP-642 aggregator batches BEFORE the VIP is proposed.
 *
 * For each aggregator chain it checks that (1) the batch exists at the index hard-wired into the
 * VIP (BATCH_INDEX), and (2) the on-chain calls match the CURRENT buildBatch() output byte-for-byte.
 * A batch seeded from an older commit executes silently with the stale contents, so run this once
 * after seeding (batches are append-only — no update/remove — so a verified batch cannot change).
 *
 *   npx hardhat run vips/vip-642/scripts/verify-seeded-batches.ts
 *
 * Requires ARCHIVE_NODE_{bscmainnet,ethereum,arbitrumone} in the environment / .env.
 */
import * as dotenv from "dotenv";
import { ethers } from "ethers";

import { AGGREGATOR, AggregatorChain, buildBatch } from "../aggregatorBatches";

dotenv.config();

// Must mirror BATCH_INDEX in vips/vip-642/bscmainnet.ts.
const BATCH_INDEX: Record<AggregatorChain, number> = { bscmainnet: 1, ethereum: 0, arbitrumone: 0 };

const ABI = [
  "function batchCount() view returns (uint256)",
  "function getBatch(uint256) view returns (tuple(address target, bytes data)[])",
];

async function main() {
  let failed = false;
  for (const chain of Object.keys(AGGREGATOR) as AggregatorChain[]) {
    const rpc = process.env[`ARCHIVE_NODE_${chain}`];
    if (!rpc) throw new Error(`ARCHIVE_NODE_${chain} is not set`);
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const aggregator = new ethers.Contract(AGGREGATOR[chain].aggregator, ABI, provider);

    const count = (await aggregator.batchCount()).toNumber();
    const index = BATCH_INDEX[chain];
    console.log(`== ${chain} aggregator ${AGGREGATOR[chain].aggregator}: batchCount=${count}, VIP index=${index}`);

    if (count <= index) {
      console.log(`   ❌ not seeded yet — executeBatch(${index}) would revert`);
      failed = true;
      continue;
    }
    if (count !== index + 1) {
      console.log(`   ⚠️ batches exist beyond the VIP's index (batchCount=${count})`);
    }

    const onchain = await aggregator.getBatch(index);
    const expected = buildBatch(chain).map(cmd => ({
      target: cmd.target,
      data: new ethers.utils.Interface([`function ${cmd.signature}`]).encodeFunctionData(cmd.signature, cmd.params),
    }));

    let mismatches = 0;
    const n = Math.max(onchain.length, expected.length);
    for (let i = 0; i < n; i++) {
      const oc = onchain[i];
      const ex = expected[i];
      if (!oc || !ex) {
        console.log(`   ❌ [${i}] ${!oc ? "missing on-chain" : "extra on-chain call"}`);
        mismatches += 1;
      } else if (
        oc.target.toLowerCase() !== ex.target.toLowerCase() ||
        oc.data.toLowerCase() !== ex.data.toLowerCase()
      ) {
        console.log(
          `   ❌ [${i}] mismatch:\n      on-chain: ${oc.target} ${oc.data}\n      expected: ${ex.target} ${ex.data}`,
        );
        mismatches += 1;
      }
    }
    if (mismatches === 0 && onchain.length === expected.length) {
      console.log(`   ✅ all ${expected.length} calls match buildBatch() byte-for-byte`);
    } else {
      failed = true;
    }
  }
  if (failed) process.exit(1);
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  },
);
