import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip476, { DEFAULT_ADMIN_ROLE, UNICHAIN_ACM } from "../../vips/vip-476/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

forking(12089574, async () => {
  const acm = new ethers.Contract(UNICHAIN_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("Default admin role hasn't been revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, unichainmainnet.GUARDIAN)).to.be.true;
    });
  });

  testForkedNetworkVipCommands("vip476", await vip476());

  describe("Post-VIP behaviour", async () => {
    it("Default admin role must be revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, unichainmainnet.GUARDIAN)).to.be.false;
    });
  });
});
