import { FORKED_NETWORK, ethers, network } from "hardhat";

// AuxiliaryCommandsAggregator instances per network. ACM-gated operations are pre-seeded into them so a
// proposal can run many via a single executeBatch(index) and stay under GovernorBravo's 100-op limit.
export const AUXILIARY_AGGREGATORS: { [network: string]: string } = {
  bscmainnet: "0x528A428748dfE73DFcc844176B401475D1831057",
  ethereum: "0xc79Cb7efEBd121DC4B39eA141C214606595D665A",
  arbitrumone: "0x768FEf3a88ea92cCF9CAcDf0aB15C4B29B3C1379",
  basemainnet: "0x768FEf3a88ea92cCF9CAcDf0aB15C4B29B3C1379",
  zksyncmainnet: "0x0B906d55025cE88bF713764AAc6F23918a25fA49",
};

// Resolve the aggregator for a network, defaulting to the forked (or active) network.
export const getAuxiliaryAggregator = (net: string = FORKED_NETWORK ?? network.name): string => {
  const address = AUXILIARY_AGGREGATORS[net];
  if (!address) {
    throw new Error(`No AuxiliaryCommandsAggregator configured for network "${net}"`);
  }
  return address;
};

/**
 * Reusable helpers for Venus' AuxiliaryCommandsAggregator.
 *
 * The aggregator stores append-only batches of {target, data} calls and replays them in a single
 * `executeBatch(index)` call (gated by ACM, granted to the timelocks). Because `executeBatch` runs each
 * call as `aggregator.call(data)`, the aggregator itself is `msg.sender` for every batched call — so only
 * ACM-gated functions can be batched, and the aggregator must hold the relevant permission while the
 * batch runs (typically granted transiently in the proposal and revoked as the batch's last call).
 *
 */

export interface SeedCommand {
  target: string;
  signature: string;
  params: any[];
}

export interface AggregatorCall {
  target: string;
  data: string;
}

export const AGGREGATOR_SEED_ABI = [
  "function addBatch((address target, bytes data)[] calldata calls, uint256 expectedIndex) external returns (uint256 index)",
  "function batchCount() external view returns (uint256)",
];

function encodeCalldata(signature: string, params: unknown[]): string {
  const iface = new ethers.utils.Interface([`function ${signature}`]);
  return iface.encodeFunctionData(signature, params);
}

/**
 * Encodes a list of {target, signature, params} commands into the aggregator's {target, data} call shape.
 */
export function encodeSeedCommands(commands: SeedCommand[]): AggregatorCall[] {
  return commands.map(cmd => ({
    target: cmd.target,
    data: encodeCalldata(cmd.signature, cmd.params),
  }));
}

/**
 * Encodes commands and appends them as a new batch on the aggregator at `expectedIndex`.
 *
 * Uses the index-checked `addBatch(calls, expectedIndex)` overload, so the call reverts on-chain
 * (`InvalidBatchIndex`) unless the batch lands exactly where the VIP's `executeBatch(index)` expects it —
 * no separate batchCount precheck needed. The first signer must be an authorized batcher.
 */
export async function seedAuxiliaryAggregator(commands: SeedCommand[], expectedIndex: number): Promise<number> {
  if (commands.length === 0) {
    throw new Error("commands array is empty — nothing to seed");
  }

  const [signer] = await ethers.getSigners();
  const aggregator = new ethers.Contract(getAuxiliaryAggregator(), AGGREGATOR_SEED_ABI, signer);
  const calls = encodeSeedCommands(commands);

  console.log(`  Submitting batch of ${calls.length} calls at index ${expectedIndex}…`);
  const tx = await aggregator.addBatch(calls, expectedIndex);
  const receipt = await tx.wait();
  console.log(`  addBatch() confirmed in tx ${receipt.transactionHash}; batch stored at index ${expectedIndex}.`);
  return expectedIndex;
}
