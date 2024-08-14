import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip349, { COMMUNITY, USDT, USDT_AMOUNT, VAI, VAI_AMOUNT } from "../../vips/vip-349/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(41186097, async () => {
  let vai: Contract;
  let usdt: Contract;

  let prevUSDTBalance: BigNumber;
  let prevVAIBalance: BigNumber;

  before(async () => {
    vai = new ethers.Contract(VAI, ERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);

    prevUSDTBalance = await usdt.balanceOf(COMMUNITY);
    prevVAIBalance = await vai.balanceOf(COMMUNITY);
  });

  testVip("VIP-349", await vip349(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const usdtBalance = await usdt.balanceOf(COMMUNITY);
      const vaiBalance = await vai.balanceOf(COMMUNITY);

      expect(usdtBalance.sub(prevUSDTBalance)).to.equal(USDT_AMOUNT);
      expect(vaiBalance.sub(prevVAIBalance)).to.equal(VAI_AMOUNT);
    });
  });
});
