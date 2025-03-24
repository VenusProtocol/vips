import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip008, { ACM, DEFAULT_ADMIN_ROLE } from "../../../proposals/opsepolia/vip-008";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

const { opsepolia } = NETWORK_ADDRESSES;

forking(25517569, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip008());
    });

    it("Default admin role must be revoked from ACMAggregator contract", async () => {
      const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, opsepolia.GUARDIAN)).to.be.false;
    });
  });
});
