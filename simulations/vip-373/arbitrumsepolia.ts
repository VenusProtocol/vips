import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip014, { ACM } from "../../multisig/proposals/arbitrumsepolia/vip-014";
import vip373, { DEFAULT_ADMIN_ROLE, OPBNBTESTNET_ACM_AGGREGATOR } from "../../vips/vip-373/bsctestnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

forking(86016842, async () => {
  before(async () => {
    await pretendExecutingVip(await vip014());
  });

  testForkedNetworkVipCommands("vip373", await vip373(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [84]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [35]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, OPBNBTESTNET_ACM_AGGREGATOR)).to.be.false;
    });
  });
});
