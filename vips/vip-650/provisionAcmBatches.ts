import hre, { ethers } from "hardhat";

import {
  ACM_BATCH_INDEX_BASE_PART_1,
  ACM_BATCH_INDEX_BASE_PART_2,
  AUX_COMMANDS_AGGREGATOR,
  OPERATOR,
} from "./addresses/bscmainnet";
import { type AcmCommand, buildAcmBatchesPart1, buildAcmBatchesPart2 } from "./commands";

// ---------------------------------------------------------------------------------------------------
// Stores VIP-650 / VIP-651's ACM grants on the bscmainnet AuxiliaryCommandsAggregator, one batch per asset
// stack, starting at that part's base index. Runs once per part, and the part must be explicit —
// picking one silently is how grants end up in the wrong slot:
//
//   VIP_PART=1 npx hardhat run vips/vip-650/provisionAcmBatches.ts --network bscmainnet
//   VIP_PART=2 npx hardhat run vips/vip-650/provisionAcmBatches.ts --network bscmainnet
//
// Run each once, by hand, from a wallet in the aggregator's `authorizedBatchers` allowlist, and only
// once that part's VIP is final. Batches are append-only, so anything stored early is dead weight and
// shifts every index that follows.
//
// Contents come from ./commands.ts, which the proposals and simulations also read.
// ---------------------------------------------------------------------------------------------------

const PARTS = {
  "1": {
    label: "part 1 (USDT + USDC)",
    build: buildAcmBatchesPart1,
    base: ACM_BATCH_INDEX_BASE_PART_1,
    baseConstant: "ACM_BATCH_INDEX_BASE_PART_1",
    vipFile: "bscmainnet-part-1.ts",
  },
  "2": {
    label: "part 2 (U)",
    build: buildAcmBatchesPart2,
    base: ACM_BATCH_INDEX_BASE_PART_2,
    baseConstant: "ACM_BATCH_INDEX_BASE_PART_2",
    vipFile: "bscmainnet-part-2.ts",
  },
} as const;

const AGGREGATOR_ABI = [
  "function authorizedBatchers(address) view returns (bool)",
  "function batchCount() view returns (uint256)",
  "function addBatch((address target, bytes data)[] calls, uint256 expectedIndex) returns (uint256)",
  "function getBatch(uint256 index) view returns ((address target, bytes data)[])",
  "event BatchAdded(uint256 index)",
];

const ZERO = ethers.constants.AddressZero;

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
    throw new Error(`provisionAcmBatches: expected --network bscmainnet, got "${hre.network.name}"`);
  }

  const selected = process.env.VIP_PART;
  if (selected !== "1" && selected !== "2") {
    throw new Error(
      `provisionAcmBatches: set VIP_PART to 1 or 2 (got ${JSON.stringify(selected)}). ` +
        "Part 1 stores USDT + USDC, part 2 stores U. Each part has its own base index, so the part " +
        "must be explicit — there is no safe default.",
    );
  }
  const part = PARTS[selected];

  const batches = part.build();
  const flat = batches.flat();

  // If part 1's range ever grows into part 2's base, part 2 would replay part 1's grants.
  const partOneEnd = ACM_BATCH_INDEX_BASE_PART_1 + buildAcmBatchesPart1().length;
  if (partOneEnd > ACM_BATCH_INDEX_BASE_PART_2) {
    throw new Error(
      `provisionAcmBatches: slot ranges overlap — part 1 occupies ${ACM_BATCH_INDEX_BASE_PART_1}..` +
        `${partOneEnd - 1} but ACM_BATCH_INDEX_BASE_PART_2 is ${ACM_BATCH_INDEX_BASE_PART_2}. ` +
        "Fix the bases in addresses/bscmainnet.ts before storing anything.",
    );
  }

  // Should never fire: every address in the book is a live deployment. Kept because a batch stored
  // against a zero address is permanent and would only surface as a failure at execute.
  if (OPERATOR === ZERO) {
    throw new Error("provisionAcmBatches: OPERATOR is the zero address in addresses/bscmainnet.ts");
  }
  const unresolved = flat.filter(c => c.params[0] === ZERO || c.params[2] === ZERO);
  if (unresolved.length > 0) {
    throw new Error(
      `provisionAcmBatches: ${unresolved.length} of ${flat.length} entries point at the zero address. ` +
        "Every Hub-stack address and role holder in addresses/bscmainnet.ts must be a live deployment " +
        "before anything is stored.",
    );
  }

  const [signer] = await ethers.getSigners();
  const aggregator = new ethers.Contract(AUX_COMMANDS_AGGREGATOR, AGGREGATOR_ABI, signer);

  if (!(await aggregator.authorizedBatchers(signer.address))) {
    throw new Error(
      `provisionAcmBatches: ${signer.address} is not in the aggregator's authorizedBatchers allowlist. ` +
        "Run from a whitelisted batcher wallet.",
    );
  }

  // A drift here means the VIP's executeBatch indices are stale.
  const batchCount: number = (await aggregator.batchCount()).toNumber();
  if (batchCount !== part.base) {
    throw new Error(
      `provisionAcmBatches: index drift for ${part.label} — batchCount() is ${batchCount} but ` +
        `${part.baseConstant} is ${part.base}. Set ${part.baseConstant} = ${batchCount} in ` +
        `addresses/bscmainnet.ts, confirm ${part.vipFile} re-encodes its executeBatch commands from it, ` +
        "then re-run.",
    );
  }

  const byAccount = flat.reduce<Record<string, number>>((acc, c) => {
    acc[c.params[2]] = (acc[c.params[2]] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Part:         ${part.label} -> ${part.vipFile}`);
  console.log(`Aggregator:   ${AUX_COMMANDS_AGGREGATOR}`);
  console.log(`Batcher:      ${signer.address}`);
  console.log(`Base index:   ${part.base} (${part.baseConstant})`);
  console.log(`Batches:      ${batches.length} (${batches.map(b => b.length).join(" / ")} calls)`);
  console.log(`Total grants: ${flat.length}`);
  console.table(byAccount);

  let lastBlock = 0;

  for (let b = 0; b < batches.length; b++) {
    const expectedIndex = part.base + b;
    const calls = encodeCalls(batches[b]);

    console.log(`\nStoring batch ${b + 1}/${batches.length} -> index ${expectedIndex} (${calls.length} calls)...`);

    // Indexed overload: reverts InvalidBatchIndex if another batch landed since the check above,
    // rather than silently occupying a slot the proposal does not reference.
    const tx = await aggregator.addBatch(calls, expectedIndex);
    console.log(`  tx: ${tx.hash}`);
    const receipt = await tx.wait();
    lastBlock = receipt.blockNumber;

    const event = receipt.events?.find((e: { event: string }) => e.event === "BatchAdded");
    if (!event) {
      throw new Error(`provisionAcmBatches: BatchAdded event not found in receipt for batch ${b}`);
    }
    const index: number = event.args?.index.toNumber();
    if (index !== expectedIndex) {
      throw new Error(`provisionAcmBatches: batch ${b} landed at ${index}, expected ${expectedIndex}`);
    }

    // Read back, so the index the VIP encodes is proven to hold exactly these calls.
    const stored: { target: string; data: string }[] = await aggregator.getBatch(index);
    if (stored.length !== calls.length) {
      throw new Error(`provisionAcmBatches: index ${index} stored ${stored.length} calls, expected ${calls.length}`);
    }
    for (let i = 0; i < calls.length; i++) {
      const sameTarget = ethers.utils.getAddress(stored[i].target) === ethers.utils.getAddress(calls[i].target);
      if (!sameTarget || stored[i].data !== calls[i].data) {
        throw new Error(
          `provisionAcmBatches: mismatch at index ${index} call ${i}\n  stored:   ${stored[i].target} ` +
            `${stored[i].data}\n  expected: ${calls[i].target} ${calls[i].data}`,
        );
      }
    }
    console.log(`  index ${index} verified: all ${calls.length} calls match.`);
  }

  const first = part.base;
  const last = part.base + batches.length - 1;
  console.log(
    `\nAll ${batches.length} batches for ${part.label} stored and verified across indices ${first}..${last}.`,
  );

  // The batch indices are the only link between this script and the proposal, and the VIP encodes
  // them as bare numbers — if they are wrong it replays whatever else sits in those slots.
  console.log(`
================================================================================
 NEXT STEPS — copy these into the repo before proposing ${part.vipFile}
================================================================================

 1. addresses/bscmainnet.ts
      export const ${part.baseConstant} = ${part.base};

    Already correct — the batchCount() check above passed, which means the repo
    value matched the chain. Nothing to edit unless you re-run this script later.

 2. ${part.vipFile} will encode exactly these commands (verify in the sim output):
${batches.map((_, b) => `      executeBatch(${part.base + b})   // ${batches[b].length} grants`).join("\n")}

 3. simulations/vip-650/${part.vipFile}
      const BLOCK_NUMBER = <a block AFTER ${lastBlock}>;

    This is what makes the simulation verify the REAL stored batches. Pinned at or
    before ${lastBlock} the batches do not exist yet on chain, so the simulation stores
    them on its own fork and its batch check compares the builder against itself.
    Pinned after ${lastBlock} it reads what is actually on chain and would fail loudly
    if the repo has drifted from what was just stored.

 4. Re-run the simulation, confirm the "is comparing against REAL mainnet batches"
    test is no longer skipped, then propose.

 IF YOU CHANGE ANY CODE AFTER THIS POINT (a role string, an address, a cap), the
 stored batches are stale — they are frozen on chain and the proposal would replay
 the old ones. Re-run this script: it appends fresh batches at new indices and
 tells you the new numbers to use. The old slots become harmless dead weight.
================================================================================
`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
