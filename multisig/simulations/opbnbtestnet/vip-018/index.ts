import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NORMAL_TIMELOCK, forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip018, {
  XVS_VAULT_PROXY,
  XVS
} from "../../../proposals/opbnbtestnet/vip-018/index";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

forking(32019810, () => {
  const provider = ethers.provider;
  let xvsVault: Contract;
 

  before(async () => {
    xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check XVS address", async () => {
      expect(await xvsVault.xvsAddress()).to.equal("0x3d0e20D4caD958bc848B045e1da19Fe378f86f03");
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip018());
    });

    it("check XVS address", async () => {
      expect(await xvsVault.xvsAddress()).to.equal(XVS);
    });
  });
});
