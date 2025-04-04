import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip475, { DEFAULT_ADMIN_ROLE, ZKSYNC_ACM } from "../../vips/vip-475/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(58148637, async () => {
  const acm = new ethers.Contract(ZKSYNC_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("Default admin role hasn't been revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, zksyncmainnet.GUARDIAN)).to.be.true;
    });
  });

  testForkedNetworkVipCommands("vip475", await vip475());

  describe("Post-VIP behaviour", async () => {
    it("Default admin role must be revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, zksyncmainnet.GUARDIAN)).to.be.false;
    });
  });
});
