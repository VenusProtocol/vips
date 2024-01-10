import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import {
  BNB_TREASURY,
  BTC,
  BTC_AMOUNT,
  COMMUNITY_WALLET,
  ETH,
  ETH_AMOUNT,
  USDT,
  USDT_AMOUNT,
  vip234,
} from "../../../vips/vip-234/vip-234";
import ERC20_ABI from "./abi/ERC20.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(35116910, () => {
  let btc: ethers.Contract;
  let eth: ethers.Contract;
  let usdt: ethers.Contract;
  let oldBTCBal: BigNumber;
  let oldETHBal: BigNumber;
  let oldUSDTBal: BigNumber;
  let oldBTCBalTreasury: BigNumber;
  let oldETHBalTreasury: BigNumber;
  let oldUSDTBalTreasury: BigNumber;

  before(async () => {
    btc = new ethers.Contract(BTC, ERC20_ABI, ethers.provider);
    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    oldBTCBal = await btc.balanceOf(COMMUNITY_WALLET);
    oldETHBal = await eth.balanceOf(COMMUNITY_WALLET);
    oldUSDTBal = await usdt.balanceOf(COMMUNITY_WALLET);
    oldBTCBalTreasury = await btc.balanceOf(BNB_TREASURY);
    oldETHBalTreasury = await eth.balanceOf(BNB_TREASURY);
    oldUSDTBalTreasury = await usdt.balanceOf(BNB_TREASURY);
  });

  testVip("VIP-213 Send XVS to Dest Chain", vip234(), {
    callbackAfterExecution: async txResponse => {
      expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should transfer BTC, ETH, USDC and USDT", async () => {
      const currBTCBal = await btc.balanceOf(COMMUNITY_WALLET);
      const currETHBal = await eth.balanceOf(COMMUNITY_WALLET);
      const currUSDTBal = await usdt.balanceOf(COMMUNITY_WALLET);

      expect(currBTCBal.sub(oldBTCBal)).equals(BTC_AMOUNT);
      expect(currETHBal.sub(oldETHBal)).equals(ETH_AMOUNT);
      expect(currUSDTBal.sub(oldUSDTBal)).equals(USDT_AMOUNT);

      const currBTCBalTreasury = await btc.balanceOf(BNB_TREASURY);
      const currETHBalTreasury = await eth.balanceOf(BNB_TREASURY);
      const currUSDTBalTreasury = await usdt.balanceOf(BNB_TREASURY);

      expect(currBTCBalTreasury.add(BTC_AMOUNT)).equals(oldBTCBalTreasury);
      expect(currETHBalTreasury.add(ETH_AMOUNT)).equals(oldETHBalTreasury);
      expect(currUSDTBalTreasury.add(USDT_AMOUNT)).equals(oldUSDTBalTreasury);
    });
  });
});
