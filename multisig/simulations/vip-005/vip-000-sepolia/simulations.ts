import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip005 } from "../../../proposals/vip-005/vip-000-sepolia";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTDest.json";

const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
const XVS_BRIDGE = "0x307C77D8606d7E486aC5D73d309e16996A336dbd";

forking(4832812, () => {
  let xvsBridge: Contract;

  before(async () => {
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    await pretendExecutingVip(vip005());
  });

  describe("Post tx checks", () => {
    it("Should whitelist treasury address", async () => {
      const isWhitelisted = await xvsBridge.whitelist(TREASURY);
      expect(isWhitelisted).equals(true);
    });
  });
});
