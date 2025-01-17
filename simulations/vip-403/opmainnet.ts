import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip403, { DEFAULT_ADMIN_ROLE, OPMAINNET_ACM, OPMAINNET_ACM_AGGREGATOR } from "../../vips/vip-403/bscmainnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { opmainnet } = NETWORK_ADDRESSES;
const FAST_TRACK_TIMELOCK = "0x508bD9C31E8d6760De04c70fe6c2b24B3cDea7E7";
const CRITICAL_TIMELOCK = "0xB82479bc345CAA7326D7d21306972033226fC185";

forking(128771016, async () => {
  testForkedNetworkVipCommands("VIP 403 Multichain Governance - Permissions", await vip403(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [190]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [50]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(OPMAINNET_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, OPMAINNET_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(["address", "string"], [opmainnet.RESILIENT_ORACLE, "pause()"]);

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, opmainnet.NORMAL_TIMELOCK)).to.be.true;

      const role2 = ethers.utils.solidityPack(
        ["address", "string"],
        [opmainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)"],
      );

      const roleHash2 = ethers.utils.keccak256(role2);
      expect(await acm.hasRole(roleHash2, opmainnet.NORMAL_TIMELOCK)).to.be.true;

      const role3 = ethers.utils.solidityPack(
        ["address", "string"],
        [opmainnet.XVS, "migrateMinterTokens(address,address)"],
      );

      const roleHash3 = ethers.utils.keccak256(role3);
      expect(await acm.hasRole(roleHash3, FAST_TRACK_TIMELOCK)).to.be.true;

      const role4 = ethers.utils.solidityPack(["address", "string"], [opmainnet.XVS, "updateBlacklist(address,bool)"]);

      const roleHash4 = ethers.utils.keccak256(role4);
      expect(await acm.hasRole(roleHash4, CRITICAL_TIMELOCK)).to.be.true;
    });
  });
});
