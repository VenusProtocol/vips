import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import vip343, { ProxyAdmin, vBNBAdmin, vBNBAdmin_Implementation } from "../../vips/vip-343/bscmainnet";
import PROXY_ABI from "./abi/proxy.json";

const OLD_IMPL = "0x8c15384f1346BD977A689C0c51BD369E8d7313cA";

forking(39313293, async () => {
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

  testVip("VIP-343", await vip343());

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      const impl = await proxy.callStatic.implementation();
      expect(impl).to.be.equal(vBNBAdmin_Implementation);
    });
  });
});
