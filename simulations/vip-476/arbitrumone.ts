import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip476, { ARBITRUM_ACM, DEFAULT_ADMIN_ROLE } from "../../vips/vip-476/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(245111060, async () => {
  const acm = new ethers.Contract(ARBITRUM_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("Default admin role hasn't been revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, arbitrumone.GUARDIAN)).to.be.true;
    });
  });

  testForkedNetworkVipCommands("vip476", await vip476());

  describe("Post-VIP behaviour", async () => {
    it("Default admin role must be revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, arbitrumone.GUARDIAN)).to.be.false;
    });
  });
});
