import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip390, {
  CERTIK,
  CERTIK_AMOUNT_USDT,
  CHAOS_LABS,
  CHAOS_LABS_AMOUNT_USDC,
  COMMUNITY,
  COMMUNITY_BEINCRYPTO_AMOUNT_USDT,
  COMMUNITY_SOURCECONTROL_AMOUNT_USDT,
  TOKEN_REDEEMER,
  USDC,
  USDT,
  VANGUARD_VINTAGE,
  VANGUARD_VINTAGE_AMOUNT_USDT,
  vUSDC,
} from "../../vips/vip-390/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(43390658, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let vusdc: Contract;

  let prevUSDTBalanceOfVanguard: BigNumber;
  let prevUSDTBalanceOfCommunity: BigNumber;
  let prevUSDCBalanceOfChaosLabs: BigNumber;
  let prevUSDTBalanceOfCertik: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vusdc = new ethers.Contract(vUSDC, ERC20_ABI, ethers.provider);

    prevUSDTBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VINTAGE);
    prevUSDTBalanceOfCommunity = await usdt.balanceOf(COMMUNITY);
    prevUSDCBalanceOfChaosLabs = await usdc.balanceOf(CHAOS_LABS);
    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK);
  });

  testVip("VIP-390", await vip390(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const usdtBalanceOfCertik = await usdt.balanceOf(CERTIK);
      const usdtBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VINTAGE);
      const usdcBalanceOfChaosLabs = await usdc.balanceOf(CHAOS_LABS);
      const usdtBalanceOfCommunity = await usdt.balanceOf(COMMUNITY);

      expect(usdtBalanceOfCertik.sub(prevUSDTBalanceOfCertik)).to.equal(CERTIK_AMOUNT_USDT);
      expect(usdtBalanceOfVanguard.sub(prevUSDTBalanceOfVanguard)).to.equal(VANGUARD_VINTAGE_AMOUNT_USDT);
      expect(usdcBalanceOfChaosLabs.sub(prevUSDCBalanceOfChaosLabs)).to.equal(CHAOS_LABS_AMOUNT_USDC);
      expect(usdtBalanceOfCommunity.sub(prevUSDTBalanceOfCommunity)).to.equal(
        BigNumber.from(COMMUNITY_BEINCRYPTO_AMOUNT_USDT).add(COMMUNITY_SOURCECONTROL_AMOUNT_USDT),
      );
    });

    it("Leaves no USDC in the redeemer helper contract", async () => {
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("Leaves no vUSDC in the redeemer helper contract", async () => {
      expect(await vusdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
