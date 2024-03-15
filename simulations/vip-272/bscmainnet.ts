import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  COMMUNITY_WALLET,
  TOKEN_REDEEMER,
  VETH,
  XVS,
  XVS_AMOUNT,
  XVS_BRIDGE_SRC,
  vip272,
} from "../../vips/vip-272/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import VTreasurey_ABI from "./abi/VTreasury.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

forking(36990775, () => {
  let xvsBridge: ethers.Contract;
  let xvs: ethers.Contract;
  let eth: ethers.Contract;
  let veth: ethers.Contract;
  let oldCirculatingSupply: BigNumber;
  let oldXVSBal: BigNumber;
  let prevBalanceCommunityWallet: BigNumber;

  before(async () => {
    xvsBridge = new ethers.Contract(XVS_BRIDGE_SRC, XVS_BRIDGE_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);
    veth = new ethers.Contract(VETH, ERC20_ABI, ethers.provider);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    oldXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
    prevBalanceCommunityWallet = await eth.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-272 Send XVS to Dest Chain", vip272(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI, XVS_BRIDGE_ABI], ["VenusGranted", "SendToChain"], [1, 1]);
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBNB", "WithdrawTreasuryBEP20"], [1, 1]);
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

    it("Should increase ETH balance of the community wallet", async () => {
      const currETHBal = await eth.balanceOf(COMMUNITY_WALLET);
      const delta = currETHBal.sub(prevBalanceCommunityWallet);
      expect(delta).to.be.closeTo(parseUnits("30", 18), parseUnits("0.002", 18));
    });

    it("leaves no ETH in the redeemer helper contract", async () => {
      expect(await eth.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("leaves no vETH in the redeemer helper contract", async () => {
      expect(await veth.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
