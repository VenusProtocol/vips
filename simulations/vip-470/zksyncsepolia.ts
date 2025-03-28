import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip470, { DEFAULT_ADMIN_ROLE, ZKSYNC_SEPOLIA_ACM } from "../../vips/vip-470/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(4977067, async () => {
  const acm = new ethers.Contract(ZKSYNC_SEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("Default admin role hasn't been revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, zksyncsepolia.GUARDIAN)).to.be.true;
    });
  });

  testForkedNetworkVipCommands("vip470", await vip470());

  describe("Post-VIP behaviour", async () => {
    it("Default admin role must be revoked", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, zksyncsepolia.GUARDIAN)).to.be.false;
    });
  });
});
