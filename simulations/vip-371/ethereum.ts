import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip371, { DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR } from "../../vips/vip-371/bscmainnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { ethereum } = NETWORK_ADDRESSES;
const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

forking(21043354, async () => {
  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip371(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [214]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [67]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [2]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(["address", "string"], [ethereum.RESILIENT_ORACLE, "pause()"]);

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, ethereum.NORMAL_TIMELOCK)).to.be.true;

      const role2 = ethers.utils.solidityPack(
        ["address", "string"],
        [ethereum.XVS_VAULT_PROXY, "set(address,uint256,uint256)"],
      );

      const roleHash2 = ethers.utils.keccak256(role2);
      expect(await acm.hasRole(roleHash2, ethereum.NORMAL_TIMELOCK)).to.be.true;
    });
  });
});
