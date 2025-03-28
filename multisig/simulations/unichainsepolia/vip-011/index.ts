import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip011, { ACM, DEFAULT_ADMIN_ROLE } from "../../../proposals/unichainsepolia/vip-011";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

forking(15985553, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip011());
    });

    it("Default admin role must be revoked", async () => {
      const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, unichainsepolia.GUARDIAN)).to.be.false;
    });
  });
});
