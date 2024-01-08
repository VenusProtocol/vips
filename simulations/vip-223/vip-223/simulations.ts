import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { XVS, XVS_AMOUNT, XVS_BRIDGE_SRC, vip223 } from "../../../vips/vip-223/vip-223";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(34889414, () => {
  let xvsBridge: ethers.Contract;
  let xvs: ethers.Contract;
  let oldCirculatingSupply: BigNumber;
  let oldXVSBal: BigNumber;

  before(async () => {
    xvsBridge = new ethers.Contract(XVS_BRIDGE_SRC, XVS_BRIDGE_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    oldXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
  });

  testVip("VIP-213 Send XVS to Dest Chain", vip223(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI, XVS_BRIDGE_ABI], ["VenusGranted", "SendToChain"], [1, 1]);
      expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [4]);
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
