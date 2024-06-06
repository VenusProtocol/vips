import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BNB_AMOUNT, ERC20_TOKENS, NORMAL_TIMELOCK, TREASURY, vip271 } from "../../vips/vip-271/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";

const prevBalances: any = {};
let prevBNBBalance: any;

forking(36907609, async () => {
  before(async () => {
    for (const token of ERC20_TOKENS) {
      const tokenContract = await ethers.getContractAt(IERC20_ABI, token.address);
      prevBalances[token.symbol] = await tokenContract.balanceOf(TREASURY);
    }

    prevBNBBalance = await ethers.provider.getBalance(TREASURY);
  });

  testVip("VIP-271", await vip271(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [IERC20_ABI], ["Transfer"], [ERC20_TOKENS.length + 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have transferred the correct amount of tokens", async () => {
      for (const token of ERC20_TOKENS) {
        const tokenContract = await ethers.getContractAt(IERC20_ABI, token.address);
        const newBalance = await tokenContract.balanceOf(TREASURY);
        const expectedBalance = BigNumber.from(token.amount).add(prevBalances[token.symbol]);
        expect(newBalance).to.equal(expectedBalance);

        const timelockBalance = await tokenContract.balanceOf(NORMAL_TIMELOCK);
        expect(timelockBalance).to.equal(0);
      }
    });

    it("check bnb balance", async () => {
      const newBNBBalance = await ethers.provider.getBalance(TREASURY);
      const expectedBNBBalance = BigNumber.from(prevBNBBalance).add(BNB_AMOUNT);
      expect(newBNBBalance).to.equal(expectedBNBBalance);
    });
  });
});
