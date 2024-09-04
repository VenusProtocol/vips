import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip058, { DEFAULT_PROXY_ADMIN } from "../../../proposals/sepolia/vip-058";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6466682, async () => {
  const provider = ethers.provider;
  let proxyAdmin: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);
    });

    it("owner of proxy admin is guardian", async () => {
      expect(await proxyAdmin.owner()).to.equal(sepolia.GUARDIAN);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip058());
    });

    it("owner of proxy admin is timelock", async () => {
      expect(await proxyAdmin.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });
  });
});
