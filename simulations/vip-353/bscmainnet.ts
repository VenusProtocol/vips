import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser, setMaxStaleCoreAssets } from "src/utils";
import { CRITICAL_TIMELOCK, NORMAL_TIMELOCK, forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { vip352 } from "../../vips/vip-352/bscmainnet";
import {
  EXPLOITER_WALLET,
  REPAY_AMOUNT,
  RISK_FUND,
  USDT,
  VBNB,
  VTREASURY,
  VUSDT,
  vip353,
} from "../../vips/vip-353/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VBEP20_ABI from "./abi/VBep20.json";

const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

// Interest rate model with no interest, for testing purposes
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

const erc20 = (address: string) => {
  return new ethers.Contract(address, ERC20_ABI, ethers.provider);
};

const vToken = (address: string) => {
  return new ethers.Contract(address, VBEP20_ABI, ethers.provider);
};

forking(41350730, async () => {
  const vUSDT = vToken(VUSDT);
  const usdt = erc20(USDT);
  const vBNB = vToken(VBNB);

  let vBNBBalancesBefore: {
    exploiter: BigNumber;
    treasury: BigNumber;
  };
  let riskFundUSDTBalanceBefore: BigNumber;
  let borrowerDebtBefore: BigNumber;

  before(async () => {
    await setMaxStaleCoreAssets(CHAINLINK_ORACLE, NORMAL_TIMELOCK);
    await pretendExecutingVip(await vip352(), NORMAL_TIMELOCK);

    // Setting interests to zero so that the numbers are exact
    const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
    await vUSDT.connect(timelock)._setInterestRateModel(ZERO_RATE_MODEL);
    vBNBBalancesBefore = {
      exploiter: await vBNB.balanceOf(EXPLOITER_WALLET),
      treasury: await vBNB.balanceOf(VTREASURY),
    };
    riskFundUSDTBalanceBefore = await usdt.balanceOf(RISK_FUND);
    borrowerDebtBefore = await vUSDT.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET);
  });

  testVip("VIP-353", await vip353(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VBEP20_ABI], ["LiquidateBorrow"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    const vBNBSeized = parseUnits("71975.06370735", 8);
    const vBNBAllocatedAsIncome = vBNBSeized.mul(5).div(110);
    const vBNBToTreasury = vBNBSeized.sub(vBNBAllocatedAsIncome);

    it("should decrease USDT balance of the risk fund", async () => {
      const before = riskFundUSDTBalanceBefore;
      const after = await usdt.balanceOf(RISK_FUND);
      expect(before.sub(after)).to.equal(REPAY_AMOUNT);
    });

    it("should decrease the borrower's debt", async () => {
      const before = borrowerDebtBefore;
      const after = await vUSDT.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET);
      expect(before.sub(after)).to.equal(REPAY_AMOUNT);
    });

    it("should increase vBNB balance of treasury", async () => {
      const before = vBNBBalancesBefore.treasury;
      const after = await vBNB.balanceOf(VTREASURY);
      expect(after.sub(before)).to.equal(vBNBToTreasury);
    });

    it("should decrease vBNB balance of the exploiter", async () => {
      const before = vBNBBalancesBefore.exploiter;
      const after = await vBNB.balanceOf(EXPLOITER_WALLET);
      expect(before.sub(after)).to.equal(vBNBSeized);
    });

    it("should not keep any funds in the timelock", async () => {
      expect(await usdt.balanceOf(CRITICAL_TIMELOCK)).to.equal(0);
      expect(await vBNB.balanceOf(CRITICAL_TIMELOCK)).to.equal(0);
    });
  });
});
