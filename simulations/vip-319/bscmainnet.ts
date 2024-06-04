import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import vip319, {
  vBNBAdmin,
  NORMAL_TIMELOCK,
  vBNBAdmin_Implementation,
  ProxyAdmin
} from "../../vips/vip-319/bscmainnet";
import PROXY_ABI from "./abi/proxy.json";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

const OLD_IMPL = "0x8c15384f1346BD977A689C0c51BD369E8d7313cA";

forking(39313293, async () => {
  const provider = ethers.provider;
  let proxy: Contract;

  before(async () => {
    await impersonateAccount(ProxyAdmin);
    proxy = new ethers.Contract(vBNBAdmin, PROXY_ABI, await ethers.getSigner(ProxyAdmin));
  });

  describe("Pre-VIP behavior", async () => {
    it("check implementation", async () => {
      const impl = await proxy.callStatic.implementation();
      expect(impl).to.be.equal(OLD_IMPL);
    });
  });

  testVip("VIP-319", vip319());

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      const impl = await proxy.callStatic.implementation();
      expect(impl).to.be.equal(vBNBAdmin_Implementation);
    });
  });
});
