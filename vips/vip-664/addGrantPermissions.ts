import { ethers } from "hardhat";

import { ACM_AGGREGATOR, PERMISSIONS } from "./bsctestnet";

const ACM_AGGREGATOR_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "contractAddress", type: "address" },
          { internalType: "string", name: "functionSig", type: "string" },
          { internalType: "address", name: "account", type: "address" },
        ],
        internalType: "struct ACMCommandsAggregator.Permission[]",
        name: "_PERMISSIONS",
        type: "tuple[]",
      },
    ],
    name: "addGrantPermissions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "index", type: "uint256" }],
    name: "GrantPermissionsAdded",
    type: "event",
  },
];

async function main() {
  console.log(`Total PERMISSIONS to add: ${PERMISSIONS.length}`);

  const [signer] = await ethers.getSigners();
  const acmAggregator = new ethers.Contract(ACM_AGGREGATOR, ACM_AGGREGATOR_ABI, signer);

  const tx = await acmAggregator.addGrantPermissions(PERMISSIONS);
  console.log(`Transaction hash: ${tx.hash}`);

  const receipt = await tx.wait();
  const event = receipt.events?.find((e: { event: string }) => e.event === "GrantPermissionsAdded");

  if (event) {
    console.log(`GrantPermissionsAdded index: ${event.args?.index.toString()}`);
  } else {
    console.log("GrantPermissionsAdded event not found in receipt");
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
