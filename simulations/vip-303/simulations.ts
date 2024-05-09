import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  BNB_AMOUNT,
  BNB_TREASURY,
  COMMUNITY_WALLET,
  ETH,
  ETH_AMOUNT,
  USDT,
  USDT_AMOUNT,
  vip303,
} from "../../vips/vip-303/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(38569600, () => {
  let eth: Contract;
  let usdt: Contract;
  let oldBNBBal: BigNumber;
  let oldETHBal: BigNumber;
  let oldUSDTBal: BigNumber;
  let oldBNBBalTreasury: BigNumber;
  let oldETHBalTreasury: BigNumber;
  let oldUSDTBalTreasury: BigNumber;

  before(async () => {
    eth = new ethers.Contract(ETH, ERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    oldBNBBal = await ethers.provider.getBalance(COMMUNITY_WALLET);
    oldETHBal = await eth.balanceOf(COMMUNITY_WALLET);
    oldUSDTBal = await usdt.balanceOf(COMMUNITY_WALLET);
    oldBNBBalTreasury = await ethers.provider.getBalance(BNB_TREASURY);
    oldETHBalTreasury = await eth.balanceOf(BNB_TREASURY);
    oldUSDTBalTreasury = await usdt.balanceOf(BNB_TREASURY);
  });

  testVip("VIP-236 VIP to refund the Community Wallet", vip303(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20", "WithdrawTreasuryBNB"], [2, 1]);
    },
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
  });

  describe("Post-VIP behavior", async () => {
    it("Should transfer BNB, ETH and USDT", async () => {
      const currBNBBal = await ethers.provider.getBalance(COMMUNITY_WALLET);
      const currETHBal = await eth.balanceOf(COMMUNITY_WALLET);
      const currUSDTBal = await usdt.balanceOf(COMMUNITY_WALLET);

      expect(currBNBBal.sub(oldBNBBal)).equals(BNB_AMOUNT);
      expect(currETHBal.sub(oldETHBal)).equals(ETH_AMOUNT);
      expect(currUSDTBal.sub(oldUSDTBal)).equals(USDT_AMOUNT);

      const currBNBBalTreasury = await ethers.provider.getBalance(BNB_TREASURY);
      const currETHBalTreasury = await eth.balanceOf(BNB_TREASURY);
      const currUSDTBalTreasury = await usdt.balanceOf(BNB_TREASURY);

      expect(currBNBBalTreasury.add(BNB_AMOUNT)).equals(oldBNBBalTreasury);
      expect(currETHBalTreasury.add(ETH_AMOUNT)).equals(oldETHBalTreasury);
      expect(currUSDTBalTreasury.add(USDT_AMOUNT)).equals(oldUSDTBalTreasury);
    });
  });
});
