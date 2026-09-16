import hre, { ethers } from "hardhat";

import { ACM_AGGREGATOR, ACM_AGGREGATOR_INDEX } from "../bscmainnet";
import { ACM_AGGREGATOR_ABI, buildPermissions } from "./acmPermissions";

// ---------------------------------------------------------------------------------------------------
// Pre-loads this proposal's ACM grants into the bscmainnet ACMCommandsAggregator:
//
//   npx hardhat run vips/vip-661/scripts/addGrantPermissions.ts --network bscmainnet
//
// Run once, by hand, and only once the proposal is final. Entries are append-only: anything stored
// early is dead weight and shifts every index that follows. The proposal replays the batch by index,
// so ACM_AGGREGATOR_INDEX in ../bscmainnet.ts must match the slot this lands in.
// ---------------------------------------------------------------------------------------------------

async function main() {
  if (hre.network.name !== "bscmainnet") {
    throw new Error(`addGrantPermissions: expected --network bscmainnet, got "${hre.network.name}"`);
  }

  const permissions = buildPermissions();
  const [signer] = await ethers.getSigners();
  const aggregator = new ethers.Contract(ACM_AGGREGATOR, ACM_AGGREGATOR_ABI, signer);

  // Entries are append-only and the proposal encodes a bare index, so a slot that already holds
  // something means ACM_AGGREGATOR_INDEX is stale and the proposal would replay the wrong grants.
  const taken = await aggregator.grantPermissions(ACM_AGGREGATOR_INDEX, 0).then(
    () => true,
    () => false,
  );
  if (taken) {
    throw new Error(
      `addGrantPermissions: index ${ACM_AGGREGATOR_INDEX} is already occupied. Find the next free slot, ` +
        "set ACM_AGGREGATOR_INDEX in vips/vip-661/bscmainnet.ts, re-run the simulation, then re-run this.",
    );
  }

  const tx = await aggregator.addGrantPermissions(permissions);
  const receipt = await tx.wait();

  const event = receipt.events?.find((e: { event: string }) => e.event === "GrantPermissionsAdded");
  const index: number = event?.args?.index.toNumber();
  if (index !== ACM_AGGREGATOR_INDEX) {
    throw new Error(`addGrantPermissions: landed at index ${index}, expected ${ACM_AGGREGATOR_INDEX}`);
  }

  // Read back, so the index the proposal encodes is proven to hold exactly these grants.
  for (let i = 0; i < permissions.length; i++) {
    const [contractAddress, functionSig, account] = await aggregator.grantPermissions(index, i);
    const p = permissions[i];
    const same =
      ethers.utils.getAddress(contractAddress) === ethers.utils.getAddress(p.contractAddress) &&
      functionSig === p.functionSig &&
      ethers.utils.getAddress(account) === ethers.utils.getAddress(p.account);
    if (!same) throw new Error(`addGrantPermissions: mismatch at index ${index} entry ${i}`);
  }

  console.log(`\nIndex ${index} stored and verified: all ${permissions.length} grants match.`);
  console.log(`Pin simulations/vip-661/bscmainnet.ts at a block after ${receipt.blockNumber}.`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
