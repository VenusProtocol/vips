import { ethers } from "hardhat";

/**
 * Generic command in the same shape as a VIP Command (minus dstChainId / value).
 * Use this format when building the commands array for seedAuxiliaryAggregator —
 * reviewers can cross-check entries directly against the VIP file.
 */
export interface SeedCommand {
  target: string;
  signature: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[];
}

const AGGREGATOR_ABI = [
  "function addBatch((address target, bytes data)[] calldata calls) external returns (uint256 index)",
  "function batchCount() external view returns (uint256)",
];

function encodeCalldata(signature: string, params: unknown[]): string {
  const iface = new ethers.utils.Interface([`function ${signature}`]);
  return iface.encodeFunctionData(signature, params);
}

/**
 * Encodes an array of VIP-style commands and stores them as a new batch on the
 * AuxiliaryCommandsAggregator at `aggregatorAddress`.
 *
 * Guards against double-seeding by asserting batchCount() === expectedIndex before submitting,
 * confirming the slot is unused. Pass 0 for the first batch, 1 for the second, etc.
 *
 * @param aggregatorAddress Deployed AuxiliaryCommandsAggregator address on the target chain.
 * @param commands          Commands to encode and store, in { target, signature, params } format.
 * @param expectedIndex     The batch index this call should occupy (default 0).
 */
export async function seedAuxiliaryAggregator(
  aggregatorAddress: string,
  commands: SeedCommand[],
  expectedIndex = 0,
): Promise<void> {
  if (commands.length === 0) {
    throw new Error("commands array is empty — nothing to seed");
  }

  const [signer] = await ethers.getSigners();
  const aggregator = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, signer);

  const currentCount = await aggregator.batchCount();
  if (!currentCount.eq(expectedIndex)) {
    throw new Error(
      `Aggregator at ${aggregatorAddress} has ${currentCount.toString()} batch(es) but expected ${expectedIndex}. ` +
        `The target index is already occupied or a prior batch is missing.`,
    );
  }

  const calls = commands.map(cmd => ({
    target: cmd.target,
    data: encodeCalldata(cmd.signature, cmd.params),
  }));

  console.log(`  Encoding and submitting batch of ${calls.length} calls…`);
  const tx = await aggregator.addBatch(calls);
  const receipt = await tx.wait();
  console.log(`  addBatch() confirmed in tx ${receipt.transactionHash}`);
  console.log(`  Batch index: ${receipt.events?.[0]?.args?.index?.toString() ?? String(expectedIndex)}`);
}
