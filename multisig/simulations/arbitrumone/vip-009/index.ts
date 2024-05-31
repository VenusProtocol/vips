import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip009, {
  REWARDS_SPEED,
  XVS,
  XVS_AMOUNT,
  XVS_STORE,
  XVS_VAULT_PROXY,
} from "../../../proposals/arbitrumone/vip-009";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";
import XVS_ABI from "./abi/xvs.json";

forking(216881933, () => {
  const provider = ethers.provider;
  let xvsVault: Contract;
  let xvs: Contract;

  describe("Post-VIP behavior", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);
      await pretendExecutingVip(vip009());
    });

    it("vault should be enabled", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(false);
    });

    it("should have correct reward speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(XVS)).to.be.equal(REWARDS_SPEED);
    });

    it("xvs store should have 5000 xvs", async () => {
      expect(await xvs.balanceOf(XVS_STORE)).to.be.equal(XVS_AMOUNT);
    });
  });
});
