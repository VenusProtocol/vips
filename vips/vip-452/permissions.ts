import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ACMCommandsAggregator } from "@venusprotocol/governance-contracts/typechain/contracts/Utils/ACMCommandsAggregator";
import ACM_COMMANDS_AGGREATOR_ABI from "@venusprotocol/governance-contracts/artifacts/contracts/Utils/ACMCommandsAggregator.sol/ACMCommandsAggregator.json";

import {
  AccountType,
  getBoundValidatorPermissions,
  getChainlinkOraclePermissions,
  getOmniChainExecutorOwnerPermissions,
  getRedstoneOraclePermissions,
  getResilientOraclePermissions,
} from "@venusprotocol/governance-contracts/dist/helpers/permissions";

interface Permissions {
  [key: string]: string[][];
}

const BERACHAINBARTIO_RESILIENT_ORACLE = "0x7aa615EBBf51A02bb32005E368547dd20DFCcB8c";
const BERACHAINBARTIO_CHAINLINK_ORACLE = "0x33baAA71Fdb915275908c80A383874096c5ecdEa";
const BERACHAINBARTIO_REDSTONE_ORACLE = "0xB0fd34F6233Ab50a417955dB5E456CEBCe2A81fA";
const BERACHAINBARTIO_BOUND_VALIDATOR = "0xF7451caCcb32E6E3695e4B4bcF42152D57B73aD5";
const BERACHAINBARTIO_OMNICHAIN_EXECUTOR_OWNER = "0xd934a7c03D6fA022321565f2042EC37bD26Baf3c";
const BERACHAINBARTIO_GUARDIAN = "0xdf3b635d2b535f906BB02abb22AED71346E36a00";

const grantPermissions: Permissions = {
  berachainbartio: [
    ...getResilientOraclePermissions(BERACHAINBARTIO_RESILIENT_ORACLE),
    ...getChainlinkOraclePermissions(BERACHAINBARTIO_CHAINLINK_ORACLE),
    ...getRedstoneOraclePermissions(BERACHAINBARTIO_REDSTONE_ORACLE),
    ...getBoundValidatorPermissions(BERACHAINBARTIO_BOUND_VALIDATOR),
    ...getOmniChainExecutorOwnerPermissions(BERACHAINBARTIO_OMNICHAIN_EXECUTOR_OWNER, BERACHAINBARTIO_GUARDIAN),
  ],
};

const acmCommandsAggreator: any = {
  berachainbartio: "0x65cfF2E3833dC0fFcEE09102C29DD43e2ED75DF9",
}

const timelocks: any = {
  berachainbartio: {
    NormalTimelock: "0x08Cf9d51df988F1E69174D22b7f93f97e1aAEbeE",
    FastTrackTimelock: "0x2aae1073B2219729Ff8e5952887905A8da498062",
    CriticalTimelock: "0x243313C1cC198FF80756ed2ef14D9dcd94Ee762b",
  },
}

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
  const [deployer] = await ethers.getSigners();
  console.log("Running script with deployer:", deployer.address);

  const hre = require("hardhat");
  const acmCommandsAggregator = await ethers.getContractAt(
    ACM_COMMANDS_AGGREATOR_ABI.abi,
    acmCommandsAggreator[hre.network.name]
  );
  const networkGrantPermissions = grantPermissions[hre.network.name];

  for (const permission of networkGrantPermissions) {
    if (Object.values(AccountType).includes(permission[2] as AccountType)) {
      permission[2] = timelocks[hre.network.name][permission[2]];
    }
  }

  const _grantPermissions: ACMCommandsAggregator.PermissionStruct[] = networkGrantPermissions.map((permission) => ({
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
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });