import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip009, { REWARDS_SPEED, XVS, XVS_VAULT_PROXY } from "../../../proposals/arbitrumsepolia/vip-009";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";

forking(39116588, () => {
  const provider = ethers.provider;
  let xvsVault: Contract;

  describe("Post-VIP behavior", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      await pretendExecutingVip(vip009());
    });

    it("vault should be enabled", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(false);
    });

    it("should have correct reward speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(XVS)).to.be.equal(REWARDS_SPEED);
    });
  });
});
