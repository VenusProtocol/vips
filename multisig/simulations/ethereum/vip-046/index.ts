import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip046 from "../../../proposals/ethereum/vip-046";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTDest.json";

const XVS_BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";
const XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";

forking(20324857, async () => {
  let xvsBridge: Contract;

  before(async () => {
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
  });

  describe("Pre tx checks", () => {
    it("xvs vault treasury address is not whitelisted", async () => {
      const isWhitelisted = await xvsBridge.whitelist(XVS_VAULT_TREASURY);
      expect(isWhitelisted).equals(false);
    });
  });

  describe("Post tx checks", () => {
    before(async () => {
      await pretendExecutingVip(await vip046());
    });

    it("Should whitelist xvs vault treasury address", async () => {
      const isWhitelisted = await xvsBridge.whitelist(XVS_VAULT_TREASURY);
      expect(isWhitelisted).equals(true);
    });
  });
});
