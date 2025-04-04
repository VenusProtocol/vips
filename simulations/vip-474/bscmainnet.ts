import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip474, {
  CERTIK,
  CERTIK_AMOUNT_USDT,
  CHAOS_LABS,
  CHAOS_LABS_AMOUNT_USDC,
  FAIRYPROOF,
  FAIRYPROOF_AMOUNT_USDT,
  USDC,
  USDT,
  VANGUARD_VANTAGE_AMOUNT_USDC,
  VANGUARD_VANTAGE_TREASURY,
} from "../../vips/vip-474/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(48030191, async () => {
  let usdc: Contract;
  let usdt: Contract;

  let prevUSDCBalanceOfVanguard: BigNumber;
  let prevUSDTBalanceOfFairyproof: BigNumber;
  let prevUSDCBalanceOfChaosLabs: BigNumber;
  let prevUSDTBalanceOfCertik: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);

    prevUSDCBalanceOfVanguard = await usdc.balanceOf(VANGUARD_VANTAGE_TREASURY);
    prevUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF);
    prevUSDCBalanceOfChaosLabs = await usdc.balanceOf(CHAOS_LABS);
    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK);
  });

  testVip("VIP-474", await vip474(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const usdtBalanceOfCertik = await usdt.balanceOf(CERTIK);
      const usdcBalanceOfVanguard = await usdc.balanceOf(VANGUARD_VANTAGE_TREASURY);
      const usdcBalanceOfChaosLabs = await usdc.balanceOf(CHAOS_LABS);
      const usdtBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF);

      expect(usdtBalanceOfCertik.sub(prevUSDTBalanceOfCertik)).to.equal(CERTIK_AMOUNT_USDT);
      expect(usdcBalanceOfVanguard.sub(prevUSDCBalanceOfVanguard)).to.equal(VANGUARD_VANTAGE_AMOUNT_USDC);
      expect(usdcBalanceOfChaosLabs.sub(prevUSDCBalanceOfChaosLabs)).to.equal(CHAOS_LABS_AMOUNT_USDC);
      expect(usdtBalanceOfFairyproof.sub(prevUSDTBalanceOfFairyproof)).to.equal(FAIRYPROOF_AMOUNT_USDT);
    });
  });
});
