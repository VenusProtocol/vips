import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip019 from "../../multisig/proposals/opbnbtestnet/vip-019";
import vip350 from "../../vips/vip-350/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(31356515, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip019());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
    },
  });
});