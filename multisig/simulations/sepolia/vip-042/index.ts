import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip042, { XVS, XVS_BRIDGE_ADMIN_PROXY } from "../../../proposals/sepolia/vip-042";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6276156, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    await pretendExecutingVip(await vip042());
  });
  describe("Post-Execution state", () => {
    it("Should set bridge pending owner to Normal Timelock", async () => {
      const pendingOwner = await xvsBridgeAdmin.pendingOwner();
      expect(pendingOwner).equals(sepolia.NORMAL_TIMELOCK);
    });
    it("Should set XVS owner to Normal Timelock", async () => {
      const owner = await xvs.owner();
      expect(owner).equals(sepolia.NORMAL_TIMELOCK);
    });
  });
});
