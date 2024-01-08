import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip007 } from "../../../proposals/vip-007/vip-007-ethereum";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTDest.json";

const XVS_BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";
const TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";

forking(18918859, () => {
  let xvsBridge: Contract;

  before(async () => {
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    await pretendExecutingVip(vip007());
  });

  describe("Post tx checks", () => {
    it("Should whitelist treasury address", async () => {
      const isWhitelisted = await xvsBridge.whitelist(TREASURY);
      expect(isWhitelisted).equals(true);
    });
  });
});
