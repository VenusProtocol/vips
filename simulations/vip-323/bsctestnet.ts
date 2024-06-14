import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip323, { XVS, XVS_AMOUNT, XVS_BRIDGE_SRC } from "../../vips/vip-323/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

forking(39944964, () => {
  let xvsBridge: Contract;
  let xvs: Contract;
  let oldCirculatingSupply: BigNumber;
  let oldXVSBal: BigNumber;

  before(async () => {
    xvsBridge = new ethers.Contract(XVS_BRIDGE_SRC, XVS_BRIDGE_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    oldXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
  });

  testVip("VIP-323 Send XVS to Dest Chain", vip323(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_BRIDGE_ABI], ["SendToChain"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should decrease circulating supply", async () => {
      const currCirculatingSupply = await xvsBridge.circulatingSupply();
      expect(oldCirculatingSupply.sub(currCirculatingSupply)).equals(XVS_AMOUNT);
    });

    it("Should increase number of locked tokens on bridge", async () => {
      const currXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
      expect(currXVSBal.sub(oldXVSBal)).equals(XVS_AMOUNT);
    });
  });
});
