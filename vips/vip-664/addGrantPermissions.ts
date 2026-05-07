import hre, { ethers } from "hardhat";

import * as bscmainnet from "./bscmainnet";
import * as bsctestnet from "./bsctestnet";

const NETWORK_CONFIG: Record<string, { ACM_AGGREGATOR: string; PERMISSIONS: [string, string, string][] }> = {
  bsctestnet: { ACM_AGGREGATOR: bsctestnet.ACM_AGGREGATOR, PERMISSIONS: bsctestnet.PERMISSIONS },
  bscmainnet: { ACM_AGGREGATOR: bscmainnet.ACM_AGGREGATOR, PERMISSIONS: bscmainnet.PERMISSIONS },
};

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
  const networkName = hre.network.name;
  const config = NETWORK_CONFIG[networkName];
  if (!config) {
    throw new Error(
      `addGrantPermissions: unsupported network "${networkName}". Use --network bsctestnet or --network bscmainnet.`,
    );
  }
  const { ACM_AGGREGATOR, PERMISSIONS } = config;

  console.log(`Network: ${networkName}, ACM Aggregator: ${ACM_AGGREGATOR}`);
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
