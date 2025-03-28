import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip021, { ACM, DEFAULT_ADMIN_ROLE } from "../../../proposals/arbitrumone/vip-021";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(245111060, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip021());
    });

    it("Default admin role must be revoked", async () => {
      const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, arbitrumone.GUARDIAN)).to.be.false;
    });
  });
});
