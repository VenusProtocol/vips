import ACM_COMMANDS_AGGREATOR_ABI from "@venusprotocol/governance-contracts/artifacts/contracts/Utils/ACMCommandsAggregator.sol/ACMCommandsAggregator.json";
import { ACMCommandsAggregator } from "@venusprotocol/governance-contracts/typechain/contracts/Utils/ACMCommandsAggregator";
import { ethers } from "hardhat";
import hre from "hardhat";
import { AccountType, getPrimeLiquidityProviderPermissions, getPrimePermissions } from "src/permissions";

interface Permissions {
  [key: string]: string[][];
}

const BERACHAINBEPOLIA_GUARDIAN = "0xdf3b635d2b535f906BB02abb22AED71346E36a00";
const PRIME = "0x6C3cB3CacBDEB37aAa3Ff12d18D19C49FA82f425";
const PLP = "0x6c680DE00C8D57c14f0ec23Bd16b41d04961E1Cf";

const grantPermissions: Permissions = {
  berachainbepolia: [...getPrimePermissions(PRIME), ...getPrimeLiquidityProviderPermissions(PLP)],
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
