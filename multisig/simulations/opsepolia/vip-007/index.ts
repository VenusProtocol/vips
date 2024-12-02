import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip007, { OPSEPOLIA_ACM } from "../../../proposals/opsepolia/vip-007";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManagerAbi.json";

const { opsepolia } = NETWORK_ADDRESSES;

forking(18680626, async () => {
  let acm: Contract;
  let defaultAdminRole: string;

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, OPSEPOLIA_ACM);
    defaultAdminRole = await acm.DEFAULT_ADMIN_ROLE();
  });

  describe("Pre-VIP behaviour", async () => {
    it("Normal Timelock does not has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, opsepolia.NORMAL_TIMELOCK);
      expect(hasRole).equals(false);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip007());
    });

    it("Normal Timelock has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, opsepolia.NORMAL_TIMELOCK);
      expect(hasRole).equals(true);
    });
  });
});
