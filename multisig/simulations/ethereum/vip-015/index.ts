import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip015, { COMMUNITY_WALLET, TREASURY, XVS } from "../../../proposals/ethereum/vip-015";
import XVS_ABI from "../../vip-015/vip-015-ethereum/abi/XVS.json";

forking(19474280, () => {
  let xvs: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
  });

  describe("Pre-Execution state", () => {
    it("check xvs balance", async () => {
      expect(await xvs.balanceOf(TREASURY)).to.equal(parseUnits("168000", 18));
      expect(await xvs.balanceOf(COMMUNITY_WALLET)).to.equal(parseUnits("41.03214704", 18));
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip015());
    });

    it("check xvs balance", async () => {
      expect(await xvs.balanceOf(TREASURY)).to.equal(parseUnits("160000", 18));
      expect(await xvs.balanceOf(COMMUNITY_WALLET)).to.equal(parseUnits("8041.03214704", 18));
    });
  });
});
