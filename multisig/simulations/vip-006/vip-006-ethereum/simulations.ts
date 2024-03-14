import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import {
  ETHEREUM_TREASURY,
  XVS,
  XVS_REWARD_AMOUNT,
  XVS_STORE,
  vip006,
} from "../../../proposals/vip-006/vip-006-ethereum";
import XVS_ABI from "./abi/xvs.json";

const XVS_PROXY_OFT_DEST = "0x888E317606b4c590BBAD88653863e8B345702633";

forking(19431807, () => {
  let xvs: Contract;
  let xvsStoreBalPrev: BigNumber;
  describe("Generic checks", async () => {
    before(async () => {
      xvs = new ethers.Contract(XVS, XVS_ABI, ethers.provider);
      const impersonateBridge = await initMainnetUser(XVS_PROXY_OFT_DEST, ethers.utils.parseEther("2"));
      await xvs.connect(impersonateBridge).mint(ETHEREUM_TREASURY, XVS_REWARD_AMOUNT);
      xvsStoreBalPrev = await xvs.balanceOf(XVS_STORE);
      await pretendExecutingVip(vip006());
    });

    it("Should increase XVSStore balance", async () => {
      const currBal = await xvs.balanceOf(XVS_STORE);
      expect(currBal).equals(xvsStoreBalPrev.add(XVS_REWARD_AMOUNT));
    });
  });
});
