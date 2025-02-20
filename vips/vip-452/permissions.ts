import ACM_COMMANDS_AGGREATOR_ABI from "@venusprotocol/governance-contracts/artifacts/contracts/Utils/ACMCommandsAggregator.sol/ACMCommandsAggregator.json";
import { ACMCommandsAggregator } from "@venusprotocol/governance-contracts/typechain/contracts/Utils/ACMCommandsAggregator";
import { ethers } from "hardhat";
import hre from "hardhat";
import {
  AccountType,
  getBoundValidatorPermissions,
  getChainlinkOraclePermissions,
  getOmniChainExecutorOwnerPermissions,
  getRedstoneOraclePermissions,
  getResilientOraclePermissions,
} from "src/permissions";

interface Permissions {
  [key: string]: string[][];
}

const BERACHAINBARTIO_RESILIENT_ORACLE = "0x279Bd38D27247BFb28064cab434f71816BD4aF4B";
const BERACHAINBARTIO_CHAINLINK_ORACLE = "0x54568071437BcF7D7F1C004D0561B3aCa89E2132";
const BERACHAINBARTIO_REDSTONE_ORACLE = "0x2E9aC3e161359d572E1F0cBe177fc5E84651D962";
const BERACHAINBARTIO_BOUND_VALIDATOR = "0x24C815d92f5F084E3679ceD7c51c2033784AaC06";
const BERACHAINBARTIO_OMNICHAIN_EXECUTOR_OWNER = "0x94ba324b639F2C4617834dFcF45EA23188a17124";
const BERACHAINBARTIO_GUARDIAN = "0xdf3b635d2b535f906BB02abb22AED71346E36a00";

const grantPermissions: Permissions = {
  berachainbartio: [
    ...getResilientOraclePermissions(BERACHAINBARTIO_RESILIENT_ORACLE),
    ...getChainlinkOraclePermissions(BERACHAINBARTIO_CHAINLINK_ORACLE),
    ...getRedstoneOraclePermissions(BERACHAINBARTIO_REDSTONE_ORACLE),
    ...getBoundValidatorPermissions(BERACHAINBARTIO_BOUND_VALIDATOR),
    ...getOmniChainExecutorOwnerPermissions(BERACHAINBARTIO_OMNICHAIN_EXECUTOR_OWNER),
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

  console.log("Adding Grant Permissions: ", _grantPermissions);
  return;

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
