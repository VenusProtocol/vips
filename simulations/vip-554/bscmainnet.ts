import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip552, { TOTAL_XVS } from "../../vips/vip-554/bscmainnet";
import XVS_ABI from "./abi/XVS.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(64039825, async () => {
  let provider: any;
  let xvs: any;
  let comptrollerPreviousXVSBalance: any;

  before(async () => {
    provider = ethers.provider;
    xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
    comptrollerPreviousXVSBalance = await xvs.balanceOf(bscmainnet.UNITROLLER);
  });

  testVip("vip-552", await vip552());

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS to the Comptroller", async () => {
      const comptrollerXVSBalanceAfter = await xvs.balanceOf(bscmainnet.UNITROLLER);
      expect(comptrollerXVSBalanceAfter).to.equal(comptrollerPreviousXVSBalance.add(TOTAL_XVS));
    });
  });
});
