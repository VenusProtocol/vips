import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip391, { DEFAULT_ADMIN_ROLE, OPBNBTESTNET_ACM_AGGREGATOR } from "../../vips/vip-391/bsctestnet-addendum";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;
const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";

forking(43312025, async () => {
  testForkedNetworkVipCommands("VIP 391 Multichain Governance - Permissions (addendum)", await vip391(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, OPBNBTESTNET_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(
        ["address", "string"],
        [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)"],
      );

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, opbnbtestnet.NORMAL_TIMELOCK)).to.be.true;
    });
  });
});
