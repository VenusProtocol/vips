import ACM_COMMANDS_AGGREATOR_ABI from "@venusprotocol/governance-contracts/artifacts/contracts/Utils/ACMCommandsAggregator.sol/ACMCommandsAggregator.json";
import { ACMCommandsAggregator } from "@venusprotocol/governance-contracts/typechain/contracts/Utils/ACMCommandsAggregator";
import { ethers } from "hardhat";
import hre from "hardhat";
import {
  AccountType,
  getComptrollerPermissions,
  getIRMPermissions,
  getPoolRegistryPermissions,
  getProtocolShareReservePermissions,
  getRewardDistributorPermissionsTimebased,
  getVTokenPermissions,
} from "src/permissions";

interface Permissions {
  [key: string]: string[][];
}

const BERACHAINBARTIO_GUARDIAN = "0xdf3b635d2b535f906BB02abb22AED71346E36a00";
export const PSR = "0xE4dD1B52c3D9d93d42B44cB77D769A9F73225012";
export const POOL_REGISTRY = "0x5D95c09f78970E365E193645F45FDBD58131C975";

const grantPermissions: Permissions = {
  berachainbartio: [
    ...getProtocolShareReservePermissions(PSR),
    ...getComptrollerPermissions(),
    ...getPoolRegistryPermissions(POOL_REGISTRY),
    ...getVTokenPermissions(),
    ...getIRMPermissions(),
    ...getRewardDistributorPermissionsTimebased(),
  ],
};

const acmCommandsAggreator: any = {
  berachainbartio: "0x1ba10ca9a744131aD8428D719767816A693c3b71",
};

const accounts: any = {
  berachainbartio: {
    NormalTimelock: "0x8699D418D8bae5CFdc566E4fce897B08bd9B03B0",
    FastTrackTimelock: "0x723b7CB226d86bd89638ec77936463453a46C656",
    CriticalTimelock: "0x920eeE8A5581e80Ca9C47CbF11B7A6cDB30204BD",
    Guardian: BERACHAINBARTIO_GUARDIAN,
    PoolRegistry: POOL_REGISTRY,
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
