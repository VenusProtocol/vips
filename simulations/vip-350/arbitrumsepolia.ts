import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip013 from "../../multisig/proposals/arbitrumsepolia/vip-013";
import vip350 from "../../vips/vip-350/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(69719920, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip013());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
    },
  });
});