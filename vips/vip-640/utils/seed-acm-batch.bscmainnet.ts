// Seeds the VIP-640 ACM permission batch into the AuxiliaryCommandsAggregator on BNB Chain mainnet.
//
// Run this BEFORE proposing the VIP, from an authorized-batcher wallet (the Normal Timelock, Guardian, or one
// of the configured common batchers):
//
//   npx hardhat run vips/vip-640/utils/seed-acm-batch.bscmainnet.ts --network bscmainnet
//
// It appends the 20 give/revoke ACM calls as batch #ACM_BATCH_INDEX. The VIP then runs them in one action via
// executeBatch(ACM_BATCH_INDEX) after granting the aggregator the ACM DEFAULT_ADMIN_ROLE.
import { ethers } from "hardhat";

import { ACM_BATCH_INDEX, COMMANDS_AGGREGATOR, buildAcmBatch } from "../bscmainnet";

const AGGREGATOR_ABI = [
  "function addBatch((address target, bytes data)[] calldata calls, uint256 expectedIndex) external returns (uint256)",
  "function batchCount() external view returns (uint256)",
  "function authorizedBatchers(address) external view returns (bool)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  const aggregator = new ethers.Contract(COMMANDS_AGGREGATOR, AGGREGATOR_ABI, signer);

  if (!(await aggregator.authorizedBatchers(signerAddress))) {
    throw new Error(`Signer ${signerAddress} is not an authorized batcher on ${COMMANDS_AGGREGATOR}.`);
  }

  const currentCount: number = (await aggregator.batchCount()).toNumber();
  if (currentCount !== ACM_BATCH_INDEX) {
    throw new Error(
      `Aggregator batchCount is ${currentCount} but ACM_BATCH_INDEX is ${ACM_BATCH_INDEX}. ` +
        `Update ACM_BATCH_INDEX in vips/vip-640/bscmainnet.ts (and the simulation) to ${currentCount}, then re-run.`,
    );
  }

  const calls = buildAcmBatch().map(cmd => ({
    target: cmd.target,
    data: new ethers.utils.Interface([`function ${cmd.signature}`]).encodeFunctionData(cmd.signature, cmd.params),
  }));

  console.log(
    `Seeding ${calls.length} ACM calls into ${COMMANDS_AGGREGATOR} at index ${ACM_BATCH_INDEX} (batcher ${signerAddress})…`,
  );
  // The two-arg overload asserts the batch lands exactly at ACM_BATCH_INDEX, else it reverts.
  const tx = await aggregator["addBatch((address,bytes)[],uint256)"](calls, ACM_BATCH_INDEX);
  const receipt = await tx.wait();
  console.log(`addBatch confirmed in ${receipt.transactionHash}; batch #${ACM_BATCH_INDEX} seeded.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
