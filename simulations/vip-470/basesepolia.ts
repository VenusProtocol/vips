import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip470, { BASE_SEPOLIA_ACM, DEFAULT_ADMIN_ROLE } from "../../vips/vip-470/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { basesepolia } = NETWORK_ADDRESSES;

forking(23534547, async () => {
  const acm = new ethers.Contract(BASE_SEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("Default admin role hasn't been revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, basesepolia.GUARDIAN)).to.be.true;
    });
  });

  testForkedNetworkVipCommands("vip470", await vip470());

  describe("Post-VIP behaviour", async () => {
    it("Default admin role must be revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, basesepolia.GUARDIAN)).to.be.false;
    });
  });
});
