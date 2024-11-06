import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip015, { ZKSYNCMAINNET_ACM, ZKSYNCMAINNET_NORMAL_TIMELOCK } from "../../../proposals/zksyncmainnet/vip-015";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManagerAbi.json";

forking(48280698, async () => {
  let acm: Contract;
  let defaultAdminRole: string;
  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ZKSYNCMAINNET_ACM);
    defaultAdminRole = await acm.DEFAULT_ADMIN_ROLE();
  });
  describe("Pre-VIP behaviour", async () => {
    it("Normal Timelock does not has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, ZKSYNCMAINNET_NORMAL_TIMELOCK);
      expect(hasRole).equals(false);
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip015());
    });
    it("Normal Timelock has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, ZKSYNCMAINNET_NORMAL_TIMELOCK);
      expect(hasRole).equals(true);
    });
  });
});
