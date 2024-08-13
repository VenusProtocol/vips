import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip014, { XVS, XVS_VAULT_IMPLEMENTATION, XVS_VAULT_PROXY } from "../../../proposals/opbnbmainnet/vip-014/index";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

forking(27145987, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;

  before(async () => {
    xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check XVS address", async () => {
      expect(await xvsVault.xvsAddress()).to.equal("0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA");
    });

    it("check implementation", async () => {
      expect(await xvsVault.implementation()).to.equal(XVS_VAULT_IMPLEMENTATION);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip014());
    });

    it("check XVS address", async () => {
      expect(await xvsVault.xvsAddress()).to.equal(XVS);
    });

    it("check implementation", async () => {
      expect(await xvsVault.implementation()).to.equal(XVS_VAULT_IMPLEMENTATION);
    });
  });
});
