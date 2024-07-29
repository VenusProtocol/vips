import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ETH_AMOUNT,
  TREASURY,
  USDC_AMOUNT,
  USDT_AMOUNT,
  vETH,
  vUSDC,
  vUSDT,
  vip262,
} from "../../vips/vip-262/bscmainnet";
import VTOKEN_ABI from "./abi/VBep20Abi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(36506196, async () => {
  let vUSDCContract: Contract;
  let vUSDTContract: Contract;
  let vETHContract: Contract;
  let prevUSDCBalance: BigNumber;
  let prevUSDTBalance: BigNumber;
  let prevETHBalance: BigNumber;

  before(async () => {
    vUSDCContract = new ethers.Contract(vUSDC, VTOKEN_ABI, ethers.provider);
    vUSDTContract = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
    vETHContract = new ethers.Contract(vETH, VTOKEN_ABI, ethers.provider);
    prevUSDCBalance = await vUSDCContract.balanceOf(TREASURY);
    prevUSDTBalance = await vUSDTContract.balanceOf(TREASURY);
    prevETHBalance = await vETHContract.balanceOf(TREASURY);
  });

  testVip("VIP-262", await vip262(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [3]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["MintBehalf"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase vToken balances of Treasury", async () => {
      const newUSDCBalance = await vUSDCContract.balanceOf(TREASURY);
      const newUSDTBalance = await vUSDTContract.balanceOf(TREASURY);
      const newETHBalance = await vETHContract.balanceOf(TREASURY);

      const usdcExchangeRate = await vUSDCContract.exchangeRateStored();
      const usdcBalanceChange = newUSDCBalance.sub(prevUSDCBalance);
      const usdcUnderlyingAssetBalance = await usdcExchangeRate.mul(usdcBalanceChange).div(parseUnits("1", 18));
      expect(usdcUnderlyingAssetBalance).to.be.closeTo(USDC_AMOUNT, parseUnits("0.01", 18));

      const usdtExchangeRate = await vUSDTContract.exchangeRateStored();
      const usdtBalanceChange = newUSDTBalance.sub(prevUSDTBalance);
      const usdtUnderlyingAssetBalance = await usdtExchangeRate.mul(usdtBalanceChange).div(parseUnits("1", 18));
      expect(usdtUnderlyingAssetBalance).to.be.closeTo(USDT_AMOUNT, parseUnits("0.01", 18));

      const ethExchangeRate = await vETHContract.exchangeRateStored();
      const ethBalanceChange = newETHBalance.sub(prevETHBalance);
      const ethUnderlyingAssetBalance = await ethExchangeRate.mul(ethBalanceChange).div(parseUnits("1", 18));
      expect(ethUnderlyingAssetBalance).to.be.closeTo(ETH_AMOUNT, parseUnits("0.0000000001", 18));
    });
  });
});
