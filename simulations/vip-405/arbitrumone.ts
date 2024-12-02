import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip405, { ARBITRUM_ACM, ARBITRUM_ACM_AGGREGATOR, DEFAULT_ADMIN_ROLE } from "../../vips/vip-405/bscmainnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(280572842, async () => {
  testForkedNetworkVipCommands("VIP 405 Multichain Governance - Permissions", await vip405(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [2]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [4]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ARBITRUM_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(
        ["address", "string"],
        [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)"],
      );

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, arbitrumone.GUARDIAN)).to.be.true;
    });
  });
});
