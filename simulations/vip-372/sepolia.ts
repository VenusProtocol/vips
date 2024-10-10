import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip060, { ACM } from "../../multisig/proposals/sepolia/vip-060";
import vip372, {
  DEFAULT_ADMIN_ROLE,
  OPBNBTESTNET_ACM_AGGREGATOR,
} from "../../vips/vip-372/bsctestnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6831661, async () => {
  before(async () => {
    await pretendExecutingVip(await vip060());
  });

  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip372(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [95]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [42]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, OPBNBTESTNET_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(["address", "string"], [sepolia.RESILIENT_ORACLE, "pause()"]);

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;

      const role2 = ethers.utils.solidityPack(
        ["address", "string"],
        [sepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)"],
      );

      const roleHash2 = ethers.utils.keccak256(role2);
      expect(await acm.hasRole(roleHash2, sepolia.NORMAL_TIMELOCK)).to.be.true;
    });
  });
});
