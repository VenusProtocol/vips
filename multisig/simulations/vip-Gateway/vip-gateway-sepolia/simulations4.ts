import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vipCallPermission } from "../../../proposals/vip-Gateway/vip-gateway-sepolia4";
import ACM_ABI from "../abi/AccessControlManager.json";

const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const NORMAL_TIMELOCK = "0x94fa6078b6b8a26f0b6edffbe6501b22a10470fb";

let acm: Contract;
forking(5470354, () => {
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
