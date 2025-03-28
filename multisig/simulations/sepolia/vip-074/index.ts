import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip074, { ACM, DEFAULT_ADMIN_ROLE } from "../../../proposals/sepolia/vip-074";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6466682, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip074());
    });

    it("Default admin role must be revoked", async () => {
      const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, sepolia.GUARDIAN)).to.be.false;
    });
  });
});
