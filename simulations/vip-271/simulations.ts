import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { ERC20_TOKENS, TREASURY, vip271 } from "../../vips/vip-271/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";

const prevBalances: any = {};

forking(36903529, () => {
  before(async () => {
    for (const token of ERC20_TOKENS) {
      const tokenContract = await ethers.getContractAt(IERC20_ABI, token.address);
      prevBalances[token.symbol] = await tokenContract.balanceOf(TREASURY);
    }
  });

  testVip("VIP-271", vip271(), {
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
      }
    });
  });
});
