import ACM_COMMANDS_AGGREATOR_ABI from "@venusprotocol/governance-contracts/artifacts/contracts/Utils/ACMCommandsAggregator.sol/ACMCommandsAggregator.json";
import { ACMCommandsAggregator } from "@venusprotocol/governance-contracts/typechain/contracts/Utils/ACMCommandsAggregator";
import { ethers } from "hardhat";
import hre from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { AccountType, getConverterPermissions, splitPermissions } from "src/permissions";

import { TREASURY_CONVERTER } from "./configuration";

const { bscmainnet, ethereum, arbitrumone, bsctestnet } = NETWORK_ADDRESSES;

interface Permissions {
  [key: string]: string[][];
}

const grantPermissions: Permissions = {
  bscmainnet: [...getConverterPermissions(TREASURY_CONVERTER.bscmainnet.converter)],
  bsctestnet: [...getConverterPermissions(TREASURY_CONVERTER.bsctestnet.converter)],
  ethereum: [...getConverterPermissions(TREASURY_CONVERTER.ethereum.converter)],
  arbitrumone: [...getConverterPermissions(TREASURY_CONVERTER.arbitrumone.converter)],
};

const acmCommandsAggregatorAddresses: any = {
  bscmainnet: bscmainnet.ACM_AGGREGATOR,
  bsctestnet: bsctestnet.ACM_AGGREGATOR,
  ethereum: ethereum.ACM_AGGREGATOR,
  arbitrumone: arbitrumone.ACM_AGGREGATOR,
};

const accounts: any = {
  bscmainnet: {
    [AccountType.NORMAL_TIMELOCK]: bscmainnet.NORMAL_TIMELOCK,
    [AccountType.FAST_TRACK_TIMELOCK]: bscmainnet.FAST_TRACK_TIMELOCK,
    [AccountType.CRITICAL_TIMELOCK]: bscmainnet.CRITICAL_TIMELOCK,
    [AccountType.GUARDIAN]: bscmainnet.GUARDIAN,
  },
  bsctestnet: {
    [AccountType.NORMAL_TIMELOCK]: bsctestnet.NORMAL_TIMELOCK,
    [AccountType.FAST_TRACK_TIMELOCK]: bsctestnet.FAST_TRACK_TIMELOCK,
    [AccountType.CRITICAL_TIMELOCK]: bsctestnet.CRITICAL_TIMELOCK,
    [AccountType.GUARDIAN]: bsctestnet.GUARDIAN,
  },
  ethereum: {
    [AccountType.NORMAL_TIMELOCK]: ethereum.NORMAL_TIMELOCK,
    [AccountType.FAST_TRACK_TIMELOCK]: ethereum.FAST_TRACK_TIMELOCK,
    [AccountType.CRITICAL_TIMELOCK]: ethereum.CRITICAL_TIMELOCK,
    [AccountType.GUARDIAN]: ethereum.GUARDIAN,
  },
  arbitrumone: {
    [AccountType.NORMAL_TIMELOCK]: arbitrumone.NORMAL_TIMELOCK,
    [AccountType.FAST_TRACK_TIMELOCK]: arbitrumone.FAST_TRACK_TIMELOCK,
    [AccountType.CRITICAL_TIMELOCK]: arbitrumone.CRITICAL_TIMELOCK,
    [AccountType.GUARDIAN]: arbitrumone.GUARDIAN,
  },
};

async function main() {
  const acmCommandsAggregator = await ethers.getContractAt(
    ACM_COMMANDS_AGGREATOR_ABI.abi,
    acmCommandsAggregatorAddresses[hre.network.name],
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
