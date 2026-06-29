import { ethers } from "hardhat";

export interface SeedCommand {
  target: string;
  signature: string;
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
 * Encodes commands into the aggregator.
 */
export function encodeSeedCommands(commands: SeedCommand[]): { target: string; data: string }[] {
  return commands.map(cmd => ({
    target: cmd.target,
    data: encodeCalldata(cmd.signature, cmd.params),
  }));
}

/**
 * Encodes commands and appends them as a new batch on the aggregator, returning the stored index.
 * Pass `expectedIndex` to assert the batch lands where the VIP's executeBatch(index) expects it.
 */
export async function seedAuxiliaryAggregator(
  aggregatorAddress: string,
  commands: SeedCommand[],
  expectedIndex?: number,
): Promise<number> {
  if (commands.length === 0) {
    throw new Error("commands array is empty — nothing to seed");
  }

  const [signer] = await ethers.getSigners();
  const aggregator = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, signer);

  const currentCount: number = (await aggregator.batchCount()).toNumber();
  if (expectedIndex !== undefined && currentCount !== expectedIndex) {
    throw new Error(
      `Aggregator at ${aggregatorAddress} has ${currentCount} batch(es) but expected the next index to be ${expectedIndex}.`,
    );
  }

  const calls = encodeSeedCommands(commands);

  console.log(`  Encoding and submitting batch of ${calls.length} calls (next index ${currentCount})…`);
  const tx = await aggregator.addBatch(calls);
  const receipt = await tx.wait();
  console.log(`  addBatch() confirmed in tx ${receipt.transactionHash}`);
  console.log(`  Batch stored at index ${currentCount}. Wire this into the VIP's executeBatch(...) command.`);
  return currentCount;
}
