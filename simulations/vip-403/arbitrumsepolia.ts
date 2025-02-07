import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip403, {
  ARBITRUMSEPOLIA_ACM_AGGREGATOR,
  ARBITRUM_SEPOLIA_ACM,
  DEFAULT_ADMIN_ROLE,
} from "../../vips/vip-403/bsctestnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(101407909, async () => {
  testForkedNetworkVipCommands("VIP 403 Multichain Governance - Permissions", await vip403(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [2]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [4]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ARBITRUM_SEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ARBITRUMSEPOLIA_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(
        ["address", "string"],
        [arbitrumsepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)"],
      );

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, arbitrumsepolia.GUARDIAN)).to.be.true;
    });
  });
});
