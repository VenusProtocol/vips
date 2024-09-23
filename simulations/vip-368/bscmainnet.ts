import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BRIDGE_XVS_AMOUNT, XVS, XVS_BRIDGE, vip368 } from "../../vips/vip-368/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import REWARD_FACET_ABI from "./abi/RewardFacet.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

forking(42499461, async () => {
  let xvsBridge: Contract;
  let xvs: Contract;
  let bridgeXVSBalPrev: BigNumber;
  let oldCirculatingSupply: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(XVS, IERC20_ABI, ethers.provider);
    xvsBridge = new ethers.Contract(XVS_BRIDGE, XVS_BRIDGE_ABI, ethers.provider);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    bridgeXVSBalPrev = await xvs.balanceOf(XVS_BRIDGE);
  });

  testVip("VIP-368", await vip368(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [REWARD_FACET_ABI], ["VenusGranted"], [1]);
      await expectEvents(txResponse, [XVS_BRIDGE_ABI], ["SendToChain"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should decrease circulating supply", async () => {
      const currCirculatingSupply = await xvsBridge.circulatingSupply();
      expect(oldCirculatingSupply.sub(currCirculatingSupply)).equals(BRIDGE_XVS_AMOUNT);
    });

    it("Should increase number of locked tokens on bridge", async () => {
      const currXVSBal = await xvs.balanceOf(XVS_BRIDGE);
      expect(currXVSBal.sub(bridgeXVSBalPrev)).equals(BRIDGE_XVS_AMOUNT);
    });
  });
});
