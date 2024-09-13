import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip013 from "../../../proposals/sepolia/vip-013";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTDest.json";

const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
const XVS_BRIDGE = "0xc340b7d3406502F43dC11a988E4EC5bbE536E642";

forking(4965126, async () => {
  let xvsBridge: Contract;

  before(async () => {
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    await pretendExecutingVip(await vip013());
  });

  describe("Post tx checks", () => {
    it("Should whitelist treasury address", async () => {
      const isWhitelisted = await xvsBridge.whitelist(TREASURY);
      expect(isWhitelisted).equals(true);
    });
  });
});
