import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  BEP20Transfers,
  BINANCE,
  BNB_AMOUNT,
  NORMAL_TIMELOCK,
  TREASURY,
  WBNB_AMOUNT,
  vToken_Transfers,
  vip256,
} from "../../vips/vip-256/bscmainnet";
import BEP20_ABI from "./abi/BEP20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(35949601, () => {
  let oldBalances: any;

  before(async () => {
    impersonateAccount(NORMAL_TIMELOCK);
    oldBalances = {};
    for (const token of BEP20Transfers) {
      const assetContract = new ethers.Contract(token.address, BEP20_ABI, ethers.provider);
      const balance = await assetContract.balanceOf(BINANCE);

      oldBalances[token.address] = balance;
    }
  });

  testVip("VIP-256", vip256(), {
    callbackAfterExecution: async txResponse => {
      // We are adding 2 for WBNB and vBNB withdrawals.
      await expectEvents(
        txResponse,
        [VTREASURY_ABI],
        ["WithdrawTreasuryBEP20"],
        [vToken_Transfers.length + BEP20Transfers.length + 2],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const token of BEP20Transfers) {
      it(`Verify that the binance wallet has received the correct amount of ${token.symbol}`, async () => {
        const assetContract = new ethers.Contract(token.address, BEP20_ABI, ethers.provider);
        const balance = await assetContract.balanceOf(BINANCE);
        expect(balance).to.eq(oldBalances[token.address].add(token.amount));
      });
    }

    it("Verify that the treasury has received the correct amount of BNB", async () => {
      const newBnbBalance = await ethers.provider.getBalance(TREASURY);
      expect(newBnbBalance).to.be.equal(BigNumber.from(WBNB_AMOUNT).add(BigNumber.from(BNB_AMOUNT)));
    });
  });
});
