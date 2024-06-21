import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip323, {
  COMMUNITY_WALLET,
  ETH,
  ETH_AMOUNT_WALLET,
  XVS,
  XVS_AMOUNT,
  XVS_AMOUNT_WALLET,
  XVS_BRIDGE_SRC,
} from "../../vips/vip-323/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

forking(39546351, async () => {
  let xvsBridge: Contract;
  let xvs: Contract;
  let eth: Contract;
  let oldCirculatingSupply: BigNumber;
  let oldXvsBalBridge: BigNumber;
  let oldXvsBalWallet: BigNumber;
  let oldEthBalWallet: BigNumber;

  before(async () => {
    xvsBridge = new ethers.Contract(XVS_BRIDGE_SRC, XVS_BRIDGE_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);

    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    oldXvsBalBridge = await xvs.balanceOf(XVS_BRIDGE_SRC);
    oldXvsBalWallet = await xvs.balanceOf(COMMUNITY_WALLET);
    oldEthBalWallet = await eth.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-323 Send XVS to Dest Chain", await vip323(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_BRIDGE_ABI], ["SendToChain"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase wallet xvs and eth balance", async () => {
      expect(await xvs.balanceOf(COMMUNITY_WALLET)).to.equal(XVS_AMOUNT_WALLET.add(oldXvsBalWallet));
      expect(await eth.balanceOf(COMMUNITY_WALLET)).to.equal(ETH_AMOUNT_WALLET.add(oldEthBalWallet));
    });

    it("Should decrease circulating supply", async () => {
      const currCirculatingSupply = await xvsBridge.circulatingSupply();
      expect(oldCirculatingSupply.sub(currCirculatingSupply)).equals(XVS_AMOUNT);
    });

    it("Should increase number of locked tokens on bridge", async () => {
      const currXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
      expect(currXVSBal.sub(oldXvsBalBridge)).equals(XVS_AMOUNT);
    });
  });
});
