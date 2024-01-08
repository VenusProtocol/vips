import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { XVS, XVS_AMOUNT, XVS_BRIDGE_SRC, BTC, ETH, USDC, USDT, BTC_AMOUNT, USDC_AMOUNT, USDT_AMOUNT, ETH_AMOUNT, COMMUNITY_WALLET, BNB_TREASURY, vip213Testnet } from "../../../vips/vip-213/vip-213-testnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

forking(36355864, () => {
  let xvsBridge: ethers.Contract;
  let xvs: ethers.Contract;
  let btc: ethers.Contract;
  let eth: ethers.Contract;
  let usdc: ethers.Contract;
  let usdt: ethers.Contract;
  let oldBTCBal: BigNumber;
  let oldETHBal: BigNumber;
  let oldUSDCBal: BigNumber;
  let oldUSDTBal: BigNumber;
  let oldBTCBalTreasury: BigNumber;
  let oldETHBalTreasury: BigNumber;
  let oldUSDCBalTreasury: BigNumber;
  let oldUSDTBalTreasury: BigNumber;
  let oldCirculatingSupply: BigNumber;
  let oldXVSBal: BigNumber;

  before(async () => {
    xvsBridge = new ethers.Contract(XVS_BRIDGE_SRC, XVS_BRIDGE_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    oldXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
    btc = new ethers.Contract(BTC, ERC20_ABI, ethers.provider);
    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    oldBTCBal = await btc.balanceOf(COMMUNITY_WALLET);
    oldETHBal = await eth.balanceOf(COMMUNITY_WALLET);
    oldUSDCBal = await usdc.balanceOf(COMMUNITY_WALLET);
    oldUSDTBal = await usdt.balanceOf(COMMUNITY_WALLET);
    oldBTCBalTreasury = await btc.balanceOf(BNB_TREASURY);
    oldETHBalTreasury = await eth.balanceOf(BNB_TREASURY);
    oldUSDCBalTreasury = await usdc.balanceOf(BNB_TREASURY);
    oldUSDTBalTreasury = await usdt.balanceOf(BNB_TREASURY);
  });

  testVip("VIP-213 Send XVS to Dest Chain", vip213Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI, XVS_BRIDGE_ABI], ["VenusGranted", "SendToChain"], [1, 1]);
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

    it("Should transfer BTC, ETH, USDC and USDT", async () => {
      const currBTCBal = await btc.balanceOf(COMMUNITY_WALLET);
      const currETHBal = await eth.balanceOf(COMMUNITY_WALLET);
      const currUSDCBal = await usdc.balanceOf(COMMUNITY_WALLET);
      const currUSDTBal = await usdt.balanceOf(COMMUNITY_WALLET);

      expect(currBTCBal.sub(oldBTCBal)).equals(BTC_AMOUNT);
      expect(currETHBal.sub(oldETHBal)).equals(ETH_AMOUNT);
      expect(currUSDCBal.sub(oldUSDCBal)).equals(USDC_AMOUNT);
      expect(currUSDTBal.sub(oldUSDTBal)).equals(USDT_AMOUNT);

      const currBTCBalTreasury = await btc.balanceOf(BNB_TREASURY);
      const currETHBalTreasury = await eth.balanceOf(BNB_TREASURY);
      const currUSDCBalTreasury = await usdc.balanceOf(BNB_TREASURY);
      const currUSDTBalTreasury = await usdt.balanceOf(BNB_TREASURY);

      expect(currBTCBalTreasury.add(BTC_AMOUNT)).equals(oldBTCBalTreasury);
      expect(currETHBalTreasury.add(ETH_AMOUNT)).equals(oldETHBalTreasury);
      expect(currUSDCBalTreasury.add(USDC_AMOUNT)).equals(oldUSDCBalTreasury);
      expect(currUSDTBalTreasury.add(USDT_AMOUNT)).equals(oldUSDTBalTreasury);
    });
  });
});
