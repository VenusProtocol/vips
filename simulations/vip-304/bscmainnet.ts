import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  BTC,
  BTC_AMOUNT,
  ETH,
  ETH_AMOUNT,
  REMAINING_USDC_AMOUNT,
  USDC,
  USDC_AMOUNT_ON_TREASURY,
  USDT,
  USDT_AMOUNT,
  WALLET,
  WBNB_AMOUNT,
  vip304,
} from "../../vips/vip-304/bscmainnet";
import BEP20_ABI from "./abi/BEP-20Abi.json";
import VTREASURY_ABI from "./abi/VtreasuryAbi.json";

forking(38777357, () => {
  let oldUsdcBalance: BigNumber;
  let oldEthBalance: BigNumber;
  let oldUsdtBalance: BigNumber;
  let oldBtcBalance: BigNumber;
  let oldBnbBalance: BigNumber;
  let usdc: Contract;
  let usdt: Contract;
  let eth: Contract;
  let btc: Contract;
  const provider = ethers.provider;

  before(async () => {
    usdc = new ethers.Contract(USDC, BEP20_ABI, provider);
    usdt = new ethers.Contract(USDT, BEP20_ABI, provider);

    eth = new ethers.Contract(ETH, BEP20_ABI, provider);
    btc = new ethers.Contract(BTC, BEP20_ABI, provider);
    oldUsdcBalance = await usdc.balanceOf(WALLET);
    oldUsdtBalance = await usdt.balanceOf(WALLET);

    oldEthBalance = await eth.balanceOf(WALLET);
    oldBtcBalance = await btc.balanceOf(WALLET);
    oldBnbBalance = await ethers.provider.getBalance(WALLET);
  });

  testVip("VIP-304", vip304(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [6]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check new token balance of Wallet", async () => {
      const newUsdcBalance = await usdc.balanceOf(WALLET);
      const newEthBalance = await eth.balanceOf(WALLET);
      const newBtcBalance = await btc.balanceOf(WALLET);
      const newUsdtBalance = await usdt.balanceOf(WALLET);
      expect(newUsdcBalance).equals(oldUsdcBalance.add(USDC_AMOUNT_ON_TREASURY.add(REMAINING_USDC_AMOUNT)));
      expect(newEthBalance).equals(oldEthBalance.add(ETH_AMOUNT));
      expect(newBtcBalance).equals(oldBtcBalance.add(BTC_AMOUNT));
      expect(newUsdtBalance).equals(oldUsdtBalance.add(USDT_AMOUNT));
    });
    it("Verify that the wallet has received the correct amount of BNB", async () => {
      const balance = await ethers.provider.getBalance(WALLET);
      expect(balance).to.be.equal(oldBnbBalance.add(WBNB_AMOUNT));
    });
  });
});
