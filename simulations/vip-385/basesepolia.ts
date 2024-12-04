import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip006 from "../../multisig/proposals/basesepolia/vip-006";
import vip385, { ACM, ACM_AGGREGATOR, DEFAULT_ADMIN_ROLE } from "../../vips/vip-385/bsctestnet";
import ACMAggregator_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(18771563, async () => {
  await pretendExecutingVip(await vip006());
  testForkedNetworkVipCommands("VIP 385 Multichain Governance - Revoke", await vip385(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [60]);
      await expectEvents(txResponse, [ACMAggregator_ABI], ["RevokePermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [194]);
      await expectEvents(txResponse, [ACMAggregator_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR)).to.be.false;
    });
  });
});
