import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip475, { DEFAULT_ADMIN_ROLE, OP_ACM } from "../../vips/vip-475/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { opmainnet } = NETWORK_ADDRESSES;

forking(133619400, async () => {
  const acm = new ethers.Contract(OP_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("Default admin role hasn't been revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, opmainnet.GUARDIAN)).to.be.true;
    });
  });

  testForkedNetworkVipCommands("vip475", await vip475());

  describe("Post-VIP behaviour", async () => {
    it("Default admin role must be revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, opmainnet.GUARDIAN)).to.be.false;
    });
  });
});
