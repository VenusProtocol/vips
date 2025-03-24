import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip011, { ACM, DEFAULT_ADMIN_ROLE } from "../../../proposals/unichainmainnet/vip-011";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

forking(12089574, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip011());
    });

    it("Default admin role must be revoked from ACMAggregator contract", async () => {
      const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, unichainmainnet.GUARDIAN)).to.be.false;
    });
  });
});
