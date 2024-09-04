import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip021, { DEFAULT_PROXY_ADMIN } from "../../../proposals/opbnbtestnet/vip-021";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

forking(36325286, async () => {
  const provider = ethers.provider;
  let proxyAdmin: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);
    });

    it("owner of proxy admin is guardian", async () => {
      expect(await proxyAdmin.owner()).to.equal(opbnbtestnet.GUARDIAN);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip021());
    });

    it("owner of proxy admin is timelock", async () => {
      expect(await proxyAdmin.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });
  });
});
