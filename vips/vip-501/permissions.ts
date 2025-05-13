import ACM_COMMANDS_AGGREATOR_ABI from "@venusprotocol/governance-contracts/artifacts/contracts/Utils/ACMCommandsAggregator.sol/ACMCommandsAggregator.json";
import { ACMCommandsAggregator } from "@venusprotocol/governance-contracts/typechain/contracts/Utils/ACMCommandsAggregator";
import { ethers } from "hardhat";
import hre from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import {
  AccountType,
  getConverterNetworkPermissions,
  getConverterPermissions,
  getXVSVaultTreasuryPermissions,
} from "../../src/permissions";
import {
  CONVERTER_NETWORK as UNICHAINSEPOLIA_CONVERTER_NETWORK,
  XVS_VAULT_TREASURY as UNICHAINSEPOLIA_XVS_VAULT_TREASURY,
} from "./testnetAddresses";

interface Permissions {
  [key: string]: string[][];
}

const grantPermissions: Permissions = {
  unichainsepolia: [
    ...getConverterNetworkPermissions(UNICHAINSEPOLIA_CONVERTER_NETWORK),
    ...getConverterPermissions(),
    ...getXVSVaultTreasuryPermissions(UNICHAINSEPOLIA_XVS_VAULT_TREASURY),
  ],
};

const acmCommandsAggreator: any = {
  unichainsepolia: "0x1EAA596ad8101bb321a5999e509A61747893078B",
};

const accounts: any = {
  unichainsepolia: {
    NormalTimelock: NETWORK_ADDRESSES.unichainsepolia.NORMAL_TIMELOCK,
    FastTrackTimelock: "0x668cDb1A414006D0a26e9e13881D4Cd30B8b2a4A",
    CriticalTimelock: "0x86C093266e824FA4345484a7B9109e9567923DA6",
    Guardian: NETWORK_ADDRESSES.unichainsepolia.GUARDIAN,
  },
};

function splitPermissions(
  array: ACMCommandsAggregator.PermissionStruct[],
  chunkSize: number = 200,
): ACMCommandsAggregator.PermissionStruct[][] {
  const result: ACMCommandsAggregator.PermissionStruct[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    result.push(chunk);
  }

  return result;
}

async function main() {
  const acmCommandsAggregator = await ethers.getContractAt(
    ACM_COMMANDS_AGGREATOR_ABI.abi,
    acmCommandsAggreator[hre.network.name],
  );

  const networkGrantPermissions = grantPermissions[hre.network.name];

  for (const permission of networkGrantPermissions) {
    if (Object.values(AccountType).includes(permission[2] as AccountType)) {
      permission[2] = accounts[hre.network.name][permission[2]];
    }
  }

  const _grantPermissions: ACMCommandsAggregator.PermissionStruct[] = networkGrantPermissions.map(permission => ({
    contractAddress: permission[0],
    functionSig: permission[1],
    account: permission[2],
  }));

  const grantChunks = splitPermissions(_grantPermissions);
  const grantIndexes: string[] = [];

  for (const chunk of grantChunks) {
    const tx = await acmCommandsAggregator.addGrantPermissions(chunk);
    const receipt = await tx.wait();
    const events = receipt.events?.filter((event: any) => event.event === "GrantPermissionsAdded");
    grantIndexes.push(events?.[0].args?.index.toString());
  }

  console.log("Grant Permissions added with indexes: ", grantIndexes.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
