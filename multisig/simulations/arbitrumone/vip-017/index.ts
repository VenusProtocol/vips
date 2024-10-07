import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip017, { VTREASURY, XVS, XVS_AMOUNT, XVS_STORE } from "../../../proposals/arbitrumone/vip-017";
import XVS_ABI from "./abi/xvs.json";

const BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

forking(259950247, async () => {
  const provider = ethers.provider;
  let bridgeSigner: Signer;
  let xvs: Contract;
  let treasuryBalanceBefore: BigNumber;
  let xvsStoreBalanceBefore: BigNumber;

  describe("Pre-VIP behaviour", async () => {
    before(async () => {
      bridgeSigner = await initMainnetUser(BRIDGE, parseUnits("1", 18));
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);
      await xvs.connect(bridgeSigner).mint(VTREASURY, XVS_AMOUNT);
    });

    it("vTreasury should hold 4500 XVS", async () => {
      expect(await xvs.balanceOf(VTREASURY)).equals(XVS_AMOUNT);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);
      treasuryBalanceBefore = await xvs.balanceOf(VTREASURY);
      xvsStoreBalanceBefore = await xvs.balanceOf(XVS_STORE);
      await pretendExecutingVip(await vip017());
    });

    it("vTreasury balance should be updated", async () => {
      expect(await xvs.balanceOf(VTREASURY)).to.be.equal(treasuryBalanceBefore.sub(XVS_AMOUNT));
    });

    it("xvs store should have 4500 xvs", async () => {
      expect(await xvs.balanceOf(XVS_STORE)).to.be.equal(xvsStoreBalanceBefore.add(XVS_AMOUNT));
    });
  });
});
