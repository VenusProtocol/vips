import ACM_COMMANDS_AGGREATOR_ABI from "@venusprotocol/governance-contracts/artifacts/contracts/Utils/ACMCommandsAggregator.sol/ACMCommandsAggregator.json";
import { ACMCommandsAggregator } from "@venusprotocol/governance-contracts/typechain/contracts/Utils/ACMCommandsAggregator";
import { ethers } from "hardhat";
import hre from "hardhat";
import { AccountType, getXVSBridgeAdminPermissions, getXVSPermissions, getXVSVaultPermissions } from "src/permissions";

interface Permissions {
  [key: string]: string[][];
}

const BERACHAINBEPOLIA_GUARDIAN = "0xdf3b635d2b535f906BB02abb22AED71346E36a00";
const XVS_BRIDGE_ADMIN = "0xC07dF2bdee34861B5c3398bD8c2E6a00f414dffC";
const XVS = "0x8699D418D8bae5CFdc566E4fce897B08bd9B03B0";
const XVS_VAULT = "0x19AdEbF431D855684EBb7bcD627CD0e72A47421a";
const XVS_BRIDGE_DEST = "0x723b7CB226d86bd89638ec77936463453a46C656";

const grantPermissions: Permissions = {
  berachainbepolia: [
    ...getXVSBridgeAdminPermissions(XVS_BRIDGE_ADMIN),
    ...getXVSPermissions(XVS),
    ...getXVSVaultPermissions(XVS_VAULT),
  ],
};

const acmCommandsAggreator: any = {
  berachainbepolia: "0x1EAA596ad8101bb321a5999e509A61747893078B",
};

const accounts: any = {
  NormalTimelock: "0xAb3DBA18664B96AD54459D06Ca8BD18C9146d5CE",
  FastTrackTimelock: "0x08Cf9d51df988F1E69174D22b7f93f97e1aAEbeE",
  CriticalTimelock: "0x2aae1073B2219729Ff8e5952887905A8da498062",
  Guardian: BERACHAINBEPOLIA_GUARDIAN,
  XVSBridgeDest: XVS_BRIDGE_DEST,
};

async function main() {
  const acmCommandsAggregator = await ethers.getContractAt(
    ACM_COMMANDS_AGGREATOR_ABI.abi,
    acmCommandsAggreator[hre.network.name],
  );
  const networkGrantPermissions = grantPermissions[hre.network.name];

  for (const permission of networkGrantPermissions) {
    if (Object.values(AccountType).includes(permission[2] as AccountType)) {
      permission[2] = accounts[permission[2]];
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
