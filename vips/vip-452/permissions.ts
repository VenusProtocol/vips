import { ethers } from "hardhat";
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
    ...getOmniChainExecutorOwnerPermissions(BERACHAINBARTIO_OMNICHAIN_EXECUTOR_OWNER, BERACHAINBARTIO_GUARDIAN),
  ],
};

const acmCommandsAggreator: any = {
  berachainbartio: "0x1ba10ca9a744131aD8428D719767816A693c3b71",
}

const addresses: any = {
  berachainbartio: {
    NormalTimelock: "0x8699D418D8bae5CFdc566E4fce897B08bd9B03B0",
    FastTrackTimelock: "0x723b7CB226d86bd89638ec77936463453a46C656",
    CriticalTimelock: "0x920eeE8A5581e80Ca9C47CbF11B7A6cDB30204BD",
    Guardian: BERACHAINBARTIO_GUARDIAN,
    OmnichainExecutorOwner: BERACHAINBARTIO_OMNICHAIN_EXECUTOR_OWNER,
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

const functionSignatures = {
  normal: [
    "setSendVersion(uint16)",
    "setReceiveVersion(uint16)",
    "setMaxDailyReceiveLimit(uint256)",
    "pause()",
    "setPrecrime(address)",
    "setMinDstGas(uint16,uint16,uint256)",
    "setPayloadSizeLimit(uint16,uint256)",
    "setConfig(uint16,uint16,uint256,bytes)",
    "addTimelocks(address[])",
    "setTrustedRemoteAddress(uint16,bytes)",
    "setTimelockPendingAdmin(address,uint8)",
    "retryMessage(uint16,bytes,uint64,bytes)",
    "setGuardian(address)",
    "setSrcChainId(uint16)",
    "transferBridgeOwnership(address)",
  ],
  fasttrack: [
    "setReceiveVersion(uint16)",
    "setMaxDailyReceiveLimit(uint256)",
    "pause()",
    "setConfig(uint16,uint16,uint256,bytes)",
    "addTimelocks(address[])",
    "retryMessage(uint16,bytes,uint64,bytes)",
  ],
  critical: [
    "setReceiveVersion(uint16)",
    "setMaxDailyReceiveLimit(uint256)",
    "pause()",
    "setConfig(uint16,uint16,uint256,bytes)",
    "addTimelocks(address[])",
    "retryMessage(uint16,bytes,uint64,bytes)",
  ],
  guardian: [
    "setReceiveVersion(uint16)",
    "forceResumeReceive(uint16,bytes)",
    "setMaxDailyReceiveLimit(uint256)",
    "pause()",
    "unpause()",
    "setConfig(uint16,uint16,uint256,bytes)",
    "addTimelocks(address[])",
    "setTrustedRemoteAddress(uint16,bytes)",
    "setTimelockPendingAdmin(address,uint8)",
    "retryMessage(uint16,bytes,uint64,bytes)",
    "setSrcChainId(uint16)",
    "transferBridgeOwnership(address)",
  ],
};

const generateGrantPermissions = (
  OMNICHAIN_EXECUTOR_OWNER: string,
  functionSigs: string[],
  account: string,
): ACMCommandsAggregator.PermissionStruct[] =>
  functionSigs.map(functionSig => ({
    contractAddress: OMNICHAIN_EXECUTOR_OWNER,
    functionSig: functionSig,
    account: account,
  }));

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
      permission[2] = addresses[hre.network.name][permission[2]];
    }
  }

  const _grantPermissions: ACMCommandsAggregator.PermissionStruct[] = networkGrantPermissions.map((permission) => ({
    contractAddress: permission[0],
    functionSig: permission[1],
    account: permission[2],
  }));

  const normalGrantPermissions = generateGrantPermissions(
    addresses[hre.network.name].OmnichainExecutorOwner,
    functionSignatures.normal,
    addresses[hre.network.name].NormalTimelock,
  );
  const fasttrackGrantPermissions = generateGrantPermissions(
    addresses[hre.network.name].OmnichainExecutorOwner,
    functionSignatures.fasttrack,
    addresses[hre.network.name].FastTrackTimelock,
  );
  const criticalGrantPermissions = generateGrantPermissions(
    addresses[hre.network.name].OmnichainExecutorOwner,
    functionSignatures.critical,
    addresses[hre.network.name].CriticalTimelock,
  );
  const guardianGrantPermissions = generateGrantPermissions(
    addresses[hre.network.name].OmnichainExecutorOwner,
    functionSignatures.guardian,
    addresses[hre.network.name].Guardian,
  );

  const omnichainGrantPermissions: ACMCommandsAggregator.PermissionStruct[] = [
    ...normalGrantPermissions,
    ...fasttrackGrantPermissions,
    ...criticalGrantPermissions,
    ...guardianGrantPermissions,
  ];

  const allGrantPermissions: ACMCommandsAggregator.PermissionStruct[] = [
    ..._grantPermissions,
    ...omnichainGrantPermissions,
  ];

  const grantChunks = splitPermissions(allGrantPermissions);
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