import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip391, { DEFAULT_ADMIN_ROLE, OPBNBMAINNET_ACM_AGGREGATOR } from "../../vips/vip-391/bscmainnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;
const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const FAST_TRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";
const CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";

forking(38111847, async () => {
  testForkedNetworkVipCommands("VIP 391 Multichain Governance - Permissions", await vip391(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [140]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [35]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, OPBNBMAINNET_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(["address", "string"], [opbnbmainnet.RESILIENT_ORACLE, "pause()"]);

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, opbnbmainnet.NORMAL_TIMELOCK)).to.be.true;

      const role2 = ethers.utils.solidityPack(
        ["address", "string"],
        [opbnbmainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)"],
      );

      const roleHash2 = ethers.utils.keccak256(role2);
      expect(await acm.hasRole(roleHash2, opbnbmainnet.NORMAL_TIMELOCK)).to.be.true;

      const role3 = ethers.utils.solidityPack(
        ["address", "string"],
        [opbnbmainnet.XVS, "migrateMinterTokens(address,address)"],
      );

      const roleHash3 = ethers.utils.keccak256(role3);
      expect(await acm.hasRole(roleHash3, FAST_TRACK_TIMELOCK)).to.be.true;

      const role4 = ethers.utils.solidityPack(
        ["address", "string"],
        [opbnbmainnet.XVS, "updateBlacklist(address,bool)"],
      );

      const roleHash4 = ethers.utils.keccak256(role4);
      expect(await acm.hasRole(roleHash4, CRITICAL_TIMELOCK)).to.be.true;
    });
  });
});
