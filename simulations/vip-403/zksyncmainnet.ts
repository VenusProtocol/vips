import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip403, { DEFAULT_ADMIN_ROLE, ZKSYNC_ACM, ZKSYNC_ACM_AGGREGATOR } from "../../vips/vip-403/bscmainnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const FAST_TRACK_TIMELOCK = "0x32f71c95BC8F9d996f89c642f1a84d06B2484AE9";
const CRITICAL_TIMELOCK = "0xbfbc79D4198963e4a66270F3EfB1fdA0F382E49c";

forking(50316022, async () => {
  testForkedNetworkVipCommands("VIP 403 Multichain Governance - Permissions", await vip403(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [190]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [54]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ZKSYNC_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ZKSYNC_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(["address", "string"], [zksyncmainnet.RESILIENT_ORACLE, "pause()"]);

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, zksyncmainnet.NORMAL_TIMELOCK)).to.be.true;

      const role2 = ethers.utils.solidityPack(
        ["address", "string"],
        [zksyncmainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)"],
      );

      const roleHash2 = ethers.utils.keccak256(role2);
      expect(await acm.hasRole(roleHash2, zksyncmainnet.NORMAL_TIMELOCK)).to.be.true;

      const role3 = ethers.utils.solidityPack(
        ["address", "string"],
        [zksyncmainnet.XVS, "migrateMinterTokens(address,address)"],
      );

      const roleHash3 = ethers.utils.keccak256(role3);
      expect(await acm.hasRole(roleHash3, FAST_TRACK_TIMELOCK)).to.be.true;

      const role4 = ethers.utils.solidityPack(
        ["address", "string"],
        [zksyncmainnet.XVS, "updateBlacklist(address,bool)"],
      );

      const roleHash4 = ethers.utils.keccak256(role4);
      expect(await acm.hasRole(roleHash4, CRITICAL_TIMELOCK)).to.be.true;
    });
  });
});
