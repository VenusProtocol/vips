import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip391, { DEFAULT_ADMIN_ROLE, SEPOLIA_ACM_AGGREGATOR } from "../../vips/vip-391/bsctestnet-addendum";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { sepolia } = NETWORK_ADDRESSES;
const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const FAST_TRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";

forking(6968680, async () => {
  testForkedNetworkVipCommands("VIP 391 Multichain Governance - Permissions (addendum)", await vip391(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, SEPOLIA_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(
        ["address", "string"],
        [sepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)"],
      );

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;

      const role2 = ethers.utils.solidityPack(
        ["address", "string"],
        [sepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)"],
      );

      const roleHash2 = ethers.utils.keccak256(role2);
      expect(await acm.hasRole(roleHash2, FAST_TRACK_TIMELOCK)).to.be.true;
    });
  });
});
