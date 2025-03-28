import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip021, { ACM, DEFAULT_ADMIN_ROLE } from "../../../proposals/zksyncsepolia/vip-021";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(4977067, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip021());
    });

    it("Default admin role must be revoked", async () => {
      const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, zksyncsepolia.GUARDIAN)).to.be.false;
    });
  });
});
