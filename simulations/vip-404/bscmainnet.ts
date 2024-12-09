import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip404, {
  CERTIK,
  CERTIK_AMOUNT_USDT,
  CHAOS_LABS,
  CHAOS_LABS_AMOUNT_USDC,
  TOKEN_REDEEMER,
  USDC,
  USDT,
  VANGUARD_VANTAGE_AMOUNT_USDT,
  VANGUARD_VANTAGE_SOURCECONTROL_AMOUNT_USDT,
  VANGUARD_VANTAGE_TREASURY,
  VENUS_STARS_BEINCRYPTO_AMOUNT_USDT,
  VENUS_STARS_TREASURY,
  vUSDC,
} from "../../vips/vip-404/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(44729395, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let vusdc: Contract;

  let prevUSDTBalanceOfVanguard: BigNumber;
  let prevUSDTBalanceOfVenusStars: BigNumber;
  let prevUSDCBalanceOfChaosLabs: BigNumber;
  let prevUSDTBalanceOfCertik: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vusdc = new ethers.Contract(vUSDC, ERC20_ABI, ethers.provider);

    prevUSDTBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VANTAGE_TREASURY);
    prevUSDTBalanceOfVenusStars = await usdt.balanceOf(VENUS_STARS_TREASURY);
    prevUSDCBalanceOfChaosLabs = await usdc.balanceOf(CHAOS_LABS);
    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK);
  });

  testVip("VIP-404", await vip404(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const usdtBalanceOfCertik = await usdt.balanceOf(CERTIK);
      const usdtBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VANTAGE_TREASURY);
      const usdcBalanceOfChaosLabs = await usdc.balanceOf(CHAOS_LABS);
      const usdtBalanceOfVenusStars = await usdt.balanceOf(VENUS_STARS_TREASURY);

      expect(usdtBalanceOfCertik.sub(prevUSDTBalanceOfCertik)).to.equal(CERTIK_AMOUNT_USDT);
      expect(usdtBalanceOfVanguard.sub(prevUSDTBalanceOfVanguard)).to.equal(
        BigNumber.from(VANGUARD_VANTAGE_AMOUNT_USDT).add(VANGUARD_VANTAGE_SOURCECONTROL_AMOUNT_USDT),
      );
      expect(usdcBalanceOfChaosLabs.sub(prevUSDCBalanceOfChaosLabs)).to.equal(CHAOS_LABS_AMOUNT_USDC);
      expect(usdtBalanceOfVenusStars.sub(prevUSDTBalanceOfVenusStars)).to.equal(VENUS_STARS_BEINCRYPTO_AMOUNT_USDT);
    });

    it("Leaves no USDC in the redeemer helper contract", async () => {
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("Leaves no vUSDC in the redeemer helper contract", async () => {
      expect(await vusdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
