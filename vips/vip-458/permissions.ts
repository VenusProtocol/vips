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

const BERACHAINBEPOLIA_RESILIENT_ORACLE = "0x150B667d42FB80409f162aB84065f0c8E9B3A7a0";
const BERACHAINBEPOLIA_CHAINLINK_ORACLE = "0xF7451caCcb32E6E3695e4B4bcF42152D57B73aD5";
const BERACHAINBEPOLIA_REDSTONE_ORACLE = "0xedc00668FC314fcc85a574c8DBa0BB205810F247";
const BERACHAINBEPOLIA_BOUND_VALIDATOR = "0xd3A635930300ea87548A1C3428Ac5DDfE3FFE66E";
const BERACHAINBEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0x61ed025c4EB50604F367316B8E18dB7eb7283D49";
const BERACHAINBEPOLIA_GUARDIAN = "0xdf3b635d2b535f906BB02abb22AED71346E36a00";

const grantPermissions: Permissions = {
  berachainbepolia: [
    ...getResilientOraclePermissions(BERACHAINBEPOLIA_RESILIENT_ORACLE),
    ...getChainlinkOraclePermissions(BERACHAINBEPOLIA_CHAINLINK_ORACLE),
    ...getRedstoneOraclePermissions(BERACHAINBEPOLIA_REDSTONE_ORACLE),
    ...getBoundValidatorPermissions(BERACHAINBEPOLIA_BOUND_VALIDATOR),
    ...getOmniChainExecutorOwnerPermissions(BERACHAINBEPOLIA_OMNICHAIN_EXECUTOR_OWNER),
  ],
};

const acmCommandsAggreator: any = {
  berachainbepolia: "0x1EAA596ad8101bb321a5999e509A61747893078B",
};

const accounts: any = {
  berachainbepolia: {
    NormalTimelock: "0xAb3DBA18664B96AD54459D06Ca8BD18C9146d5CE",
    FastTrackTimelock: "0x08Cf9d51df988F1E69174D22b7f93f97e1aAEbeE",
    CriticalTimelock: "0x2aae1073B2219729Ff8e5952887905A8da498062",
    Guardian: BERACHAINBEPOLIA_GUARDIAN,
  },
};

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

  const tx = await acmCommandsAggregator.addGrantPermissions(_grantPermissions);
  const receipt = await tx.wait();
  const events = receipt.events?.filter((event: any) => event.event === "GrantPermissionsAdded");

  console.log("Grant Permissions added with indexes: ", events?.[0].args?.index.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
