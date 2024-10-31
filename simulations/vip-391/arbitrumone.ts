import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip391, { ARBITRUM_ACM_AGGREGATOR, DEFAULT_ADMIN_ROLE } from "../../vips/vip-391/bscmainnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { arbitrumone } = NETWORK_ADDRESSES;
const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
const FAST_TRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
const CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";

forking(267530159, async () => {
  testForkedNetworkVipCommands("VIP 391 Multichain Governance - Permissions", await vip391(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [190]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [52]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR)).to.be.false;
    });

    it("check few permissions", async () => {
      const role1 = ethers.utils.solidityPack(["address", "string"], [arbitrumone.RESILIENT_ORACLE, "pause()"]);

      const roleHash = ethers.utils.keccak256(role1);
      expect(await acm.hasRole(roleHash, arbitrumone.NORMAL_TIMELOCK)).to.be.true;

      const role2 = ethers.utils.solidityPack(
        ["address", "string"],
        [arbitrumone.XVS_VAULT_PROXY, "set(address,uint256,uint256)"],
      );

      const roleHash2 = ethers.utils.keccak256(role2);
      expect(await acm.hasRole(roleHash2, arbitrumone.NORMAL_TIMELOCK)).to.be.true;

      const role3 = ethers.utils.solidityPack(
        ["address", "string"],
        [arbitrumone.XVS, "migrateMinterTokens(address,address)"],
      );

      const roleHash3 = ethers.utils.keccak256(role3);
      expect(await acm.hasRole(roleHash3, FAST_TRACK_TIMELOCK)).to.be.true;

      const role4 = ethers.utils.solidityPack(
        ["address", "string"],
        [arbitrumone.XVS, "updateBlacklist(address,bool)"],
      );

      const roleHash4 = ethers.utils.keccak256(role4);
      expect(await acm.hasRole(roleHash4, CRITICAL_TIMELOCK)).to.be.true;
    });
  });
});
