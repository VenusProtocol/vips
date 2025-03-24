import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { COMMUNITY_WALLET, ETH, XVS, XVS_AMOUNT, XVS_BRIDGE_SRC, vip369 } from "../../vips/vip-369/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

forking(42389720, async () => {
  let xvsBridge: Contract;
  let xvs: Contract;
  let oldCirculatingSupply: BigNumber;
  let oldXVSBal: BigNumber;
  let oldETHBalance: BigNumber;
  let eth: Contract;

  before(async () => {
    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);
    oldETHBalance = await eth.balanceOf(COMMUNITY_WALLET);

    xvsBridge = new ethers.Contract(XVS_BRIDGE_SRC, XVS_BRIDGE_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    oldXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
  });

  testVip("VIP-369 Send XVS to Dest Chain(zksync mainnet)", await vip369(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, XVS_BRIDGE_ABI, VTREASURY_ABI],
        ["VenusGranted", "SendToChain", "WithdrawTreasuryBEP20"],
        [1, 1, 1],
      );
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

    it("Verify that the community wallet has received the correct amount of ETH", async () => {
      const balance = await eth.balanceOf(COMMUNITY_WALLET);
      expect(balance).to.eq(oldETHBalance.add(parseUnits("5", 18)));
    });
  });
});
