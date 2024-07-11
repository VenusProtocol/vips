import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip020 from "../../multisig/proposals/opbnbmainnet/vip-020";
import vip333, { OPBNBMAINNET_XVS_BRIDGE_ADMIN } from "../../vips/vip-333/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(28761242, async () => {
  before(async () => {
    await pretendExecutingVip(await vip020());
  });

  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip333(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, XVS_BRIDGE_ADMIN_ABI],
        ["PermissionGranted", "OwnershipTransferred"],
        [21, 1],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    let xvsBridgeAdmin: Contract;
    before(async () => {
      xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, OPBNBMAINNET_XVS_BRIDGE_ADMIN);
    });
    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(opbnbmainnet.NORMAL_TIMELOCK);
    });
  });
});
