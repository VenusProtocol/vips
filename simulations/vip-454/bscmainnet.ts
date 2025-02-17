import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip454, {
  USDT,
  VANGUARD_VANTAGE_AMOUNT_USDT,
  VANGUARD_VANTAGE_TREASURY,
  VENUS_STARS_AMOUNT_USDT,
  VENUS_STARS_TREASURY,
} from "../../vips/vip-454/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(46738959, async () => {
  let usdt: Contract;

  let prevUSDTBalanceOfVanguard: BigNumber;
  let prevUSDTBalanceOfVenusStars: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);

    prevUSDTBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VANTAGE_TREASURY);
    prevUSDTBalanceOfVenusStars = await usdt.balanceOf(VENUS_STARS_TREASURY);
  });

  testVip("VIP-454", await vip454(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const usdtBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VANTAGE_TREASURY);
      const usdtBalanceOfVenusStars = await usdt.balanceOf(VENUS_STARS_TREASURY);

      expect(usdtBalanceOfVanguard.sub(prevUSDTBalanceOfVanguard)).to.equal(VANGUARD_VANTAGE_AMOUNT_USDT);
      expect(usdtBalanceOfVenusStars.sub(prevUSDTBalanceOfVenusStars)).to.equal(VENUS_STARS_AMOUNT_USDT);
    });
  });
});
