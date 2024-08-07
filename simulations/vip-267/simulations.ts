import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BRIDGE_XVS_AMOUNT,
  COMPTROLLER,
  TREASURY,
  XVS,
  XVS_AMOUNT_TO_COMPTROLLER,
  XVS_AMOUNT_TO_VESTING,
  XVS_BRIDGE,
  XVS_VESTING_PROXY,
  vip267,
} from "../../vips/vip-267/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import REWARD_FACET_ABI from "./abi/RewardFacet.json";
import VTreasurey_ABI from "./abi/VTreasury.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

forking(36760588, async () => {
  let xvsBridge: Contract;
  let xvs: Contract;
  let treasuryXVSBalPrev: BigNumber;
  let vestingProxyXVSBalPrev: BigNumber;
  let comptrollerXVSBalPrev: BigNumber;
  let bridgeXVSBalPrev: BigNumber;
  let oldCirculatingSupply: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(XVS, IERC20_ABI, ethers.provider);
    xvsBridge = new ethers.Contract(XVS_BRIDGE, XVS_BRIDGE_ABI, ethers.provider);
    treasuryXVSBalPrev = await xvs.balanceOf(TREASURY);
    vestingProxyXVSBalPrev = await xvs.balanceOf(XVS_VESTING_PROXY);
    comptrollerXVSBalPrev = await xvs.balanceOf(COMPTROLLER);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    bridgeXVSBalPrev = await xvs.balanceOf(XVS_BRIDGE);
  });

  testVip("VIP-267", await vip267(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [2]);
      await expectEvents(txResponse, [REWARD_FACET_ABI], ["VenusGranted"], [1]);
      await expectEvents(txResponse, [XVS_BRIDGE_ABI], ["SendToChain"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Treasury balance checks", async () => {
      const currXVSBal = await xvs.balanceOf(TREASURY);
      // (PrevBal - CurrBal) = (Amount sent to XVSVestingProxy + Amount sent to Comptroller)
      expect(treasuryXVSBalPrev.sub(currXVSBal)).equals(XVS_AMOUNT_TO_VESTING.add(XVS_AMOUNT_TO_COMPTROLLER));
    });

    it("Should increase XVS balance of XVSVestingProxy", async () => {
      const currXVSBal = await xvs.balanceOf(XVS_VESTING_PROXY);
      expect(currXVSBal.sub(vestingProxyXVSBalPrev)).equals(XVS_AMOUNT_TO_VESTING);
    });

    it("Should increase XVS balance of Comptroller", async () => {
      const currXVSBal = await xvs.balanceOf(COMPTROLLER);
      // (CurrBal - PrevBal) = (Amount received from Treasury - Amount sent to XVSBridge)
      expect(currXVSBal.sub(comptrollerXVSBalPrev)).equals(XVS_AMOUNT_TO_COMPTROLLER.sub(BRIDGE_XVS_AMOUNT));
    });

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
