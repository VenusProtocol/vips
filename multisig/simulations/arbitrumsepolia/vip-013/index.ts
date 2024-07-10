import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip013, { XVS, XVS_BRIDGE_ADMIN_PROXY } from "../../../proposals/arbitrumsepolia/vip-013";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(62418214, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    await pretendExecutingVip(await vip013());
  });
  describe("Post-Execution state", () => {
    it("Should set bridge pending owner to Normal Timelock", async () => {
      const pendingOwner = await xvsBridgeAdmin.pendingOwner();
      expect(pendingOwner).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it("Should set XVS owner to Normal Timelock", async () => {
      const owner = await xvs.owner();
      expect(owner).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
  });
});
