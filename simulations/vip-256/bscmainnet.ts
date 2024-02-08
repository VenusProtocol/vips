import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { NORMAL_TIMELOCK, vip256, vBNB, TREASURY,vToken_Transfers, BEP20Transfers, BINANCE } from "../../vips/vip-256/bscmainnet";
import vBNB_ABI from "./abi/vBNB.json";
import vBEP20_ABI from "./abi/vBEP20.json";
import BEP20_ABI from "./abi/BEP20.json";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

forking(35949601, () => {
  let vBNBContract: ethers.Contract;
  let oldBalance: any

  before(async () => {
    impersonateAccount(NORMAL_TIMELOCK)
    vBNBContract = new ethers.Contract(vBNB, vBNB_ABI, await ethers.getSigner(NORMAL_TIMELOCK));

    oldBalance = {}
    for(const token of BEP20Transfers) {
      // const contract = new ethers.Contract(token.address, vBEP20_ABI, ethers.provider);
      // const underlyingAsset = await contract.underlying();
      const assetContract = new ethers.Contract(token.address, BEP20_ABI, ethers.provider);
      const balance = await assetContract.balanceOf(BINANCE);

      oldBalance[token.address] = balance
    }
  });

  describe("Pre-VIP behavior", async () => {
    // it("should have the correct BNB balance", async () => {
    //   const balance = await ethers.provider.getBalance(NORMAL_TIMELOCK);
    //   console.log(await ethers.provider.getBalance(TREASURY))
    // })
  });

  testVip("VIP-256", vip256(), {
    callbackAfterExecution: async txResponse => {
    //   await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    for(const token of BEP20Transfers) {
      it(`Verify that the binance wallet has received the correct amount of ${token.symbol}`, async () => {
        const assetContract = new ethers.Contract(token.address, BEP20_ABI, ethers.provider);
        const balance = await assetContract.balanceOf(BINANCE);
        expect(balance).to.eq(oldBalance[token.address].add(token.amount))
      })
    }

    // it("should have the correct BNB balance", async () => {
    //     const balance = await ethers.provider.getBalance(NORMAL_TIMELOCK);
    //     console.log(await ethers.provider.getBalance(TREASURY))
    // })
  });
});
