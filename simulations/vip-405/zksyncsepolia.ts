import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip405, {
  DEFAULT_ADMIN_ROLE,
  ZKSYNCSEPOLIA_ACM,
  ZKSYNCSEPOLIA_ACM_AGGREGATOR,
} from "../../vips/vip-405/bsctestnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(4236122, async () => {
  testForkedNetworkVipCommands("VIP 405 Multichain Governance - Permissions", await vip405(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [190]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [54]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ZKSYNCSEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(["address", "string"], [zksyncsepolia.RESILIENT_ORACLE, "pause()"]);

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, zksyncsepolia.NORMAL_TIMELOCK)).to.be.true;

      const role2 = ethers.utils.solidityPack(
        ["address", "string"],
        [zksyncsepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)"],
      );

      const roleHash2 = ethers.utils.keccak256(role2);
      expect(await acm.hasRole(roleHash2, zksyncsepolia.NORMAL_TIMELOCK)).to.be.true;
    });
  });
});
