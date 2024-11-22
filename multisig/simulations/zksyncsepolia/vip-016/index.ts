import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip016, { ZKSYNCSEPOLIA_ACM, ZKSYNCSEPOLIA_NORMAL_TIMELOCK } from "../../../proposals/zksyncsepolia/vip-016";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManagerAbi.json";

forking(3771669, async () => {
  let acm: Contract;
  let defaultAdminRole: string;
  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ZKSYNCSEPOLIA_ACM);
    defaultAdminRole = await acm.DEFAULT_ADMIN_ROLE();
  });
  describe("Pre-VIP behaviour", async () => {
    it("Normal Timelock does not has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, ZKSYNCSEPOLIA_NORMAL_TIMELOCK);
      expect(hasRole).equals(false);
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip016());
    });
    it("Normal Timelock has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, ZKSYNCSEPOLIA_NORMAL_TIMELOCK);
      expect(hasRole).equals(true);
    });
  });
});
