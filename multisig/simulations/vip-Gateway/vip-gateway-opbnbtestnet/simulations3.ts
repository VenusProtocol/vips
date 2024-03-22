import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vipCallPermission } from "../../../proposals/vip-Gateway/vip-gateway-opbnbtestnet3";
import ACM_ABI from "../abi/AccessControlManager.json";

const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const NORMAL_TIMELOCK = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

let acm: Contract;
forking(23894854, () => {
  before(async () => {
    acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);
    await pretendExecutingVip(vipCallPermission());
  });

  it("vip executes successfully", async () => {
    expect(
      await acm.isAllowedToCall(NORMAL_TIMELOCK, "setLastRewardingBlocks(address[],uint32[],uint32[])"),
    ).to.be.equal(true);
  });
});
