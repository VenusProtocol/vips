import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { NORMAL_TIMELOCK, vip256, vBNB, TREASURY, vToken_Transfers, WBNB_AMOUNT, BEP20Transfers, BINANCE } from "../../vips/vip-256/bscmainnet";
import vBNB_ABI from "./abi/vBNB.json";
import vBEP20_ABI from "./abi/vBEP20.json";
import BEP20_ABI from "./abi/BEP20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

forking(35949601, () => {
  let vBNBContract: ethers.Contract;
  let oldBalances: any;
  let oldBnbBalance: BigNumber;
  let oldBalancesAll: any;

  before(async () => {
    impersonateAccount(NORMAL_TIMELOCK)
    vBNBContract = new ethers.Contract(vBNB, vBNB_ABI, await ethers.getSigner(NORMAL_TIMELOCK));

    oldBnbBalance = (await ethers.provider.getBalance(TREASURY));

    oldBalances = {}
    for(const token of BEP20Transfers) {
      const assetContract = new ethers.Contract(token.address, BEP20_ABI, ethers.provider);
      const balance = await assetContract.balanceOf(BINANCE);

      oldBalances[token.address] = balance
    }
  });

  testVip("VIP-256", vip256(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [vToken_Transfers.length+BEP20Transfers.length+1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    for(const token of BEP20Transfers) {
      it(`Verify that the binance wallet has received the correct amount of ${token.symbol}`, async () => {
        const assetContract = new ethers.Contract(token.address, BEP20_ABI, ethers.provider);
        const balance = await assetContract.balanceOf(BINANCE);
        expect(balance).to.eq(oldBalances[token.address].add(token.amount))
      })
    }

    it("Verify that the treasury has received the correct amount of BNB", async () => {
      const newBnbBalance = (await ethers.provider.getBalance(TREASURY));
      expect(newBnbBalance).to.be.equal(BigNumber.from(WBNB_AMOUNT))
    })

  });
});
