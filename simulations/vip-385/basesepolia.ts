import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, getOmnichainProposalSenderAddress } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands, testVip } from "src/vip-framework";

import vip384 from "../../vips/vip-384/bsctestnet";
import vip385, {
  ACM,
  ACM_AGGREGATOR,
  DEFAULT_ADMIN_ROLE,
} from "../../vips/vip-385/bsctestnet";
import ACMAggregator_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(18511708, async () => {
  testForkedNetworkVipCommands("VIP 385 Multichain Governance - Revoke", await vip385(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [48]);
      await expectEvents(txResponse, [ACMAggregator_ABI], ["RevokePermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

    it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR)).to.be.false;
    });

  });
});