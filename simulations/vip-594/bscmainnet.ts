import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip594, {
  ALLEZ_LAB_RECIPIENT,
  TOKEN_REDEEMER,
  USDC,
  USDC_TO_TREASURY,
  USDC_TO_VENUS,
  USDT,
  USDT_TO_ALLEZ,
  VENUS_RECIPIENT,
  VUSDC_AMOUNT,
  vUSDC,
} from "../../vips/vip-594/bscmainnet";
import ERC20_ABI from "../vip-454/abi/ERC20.json";

const { VTREASURY } = NETWORK_ADDRESSES.bscmainnet;

forking(83079000, async () => {
  let usdcContract: any;
  let usdtContract: any;
  let vUsdcContract: any;

  let treasuryUsdcBalanceBefore: BigNumber;
  let treasuryUsdtBalanceBefore: BigNumber;
  let treasuryVUsdcBalanceBefore: BigNumber;

  let allezLabUsdtBalanceBefore: BigNumber;
  let venusRecipientUsdcBalanceBefore: BigNumber;

  before(async () => {
    usdcContract = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    usdtContract = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    vUsdcContract = new ethers.Contract(vUSDC, ERC20_ABI, ethers.provider);

    treasuryUsdcBalanceBefore = await usdcContract.balanceOf(VTREASURY);
    treasuryUsdtBalanceBefore = await usdtContract.balanceOf(VTREASURY);
    treasuryVUsdcBalanceBefore = await vUsdcContract.balanceOf(VTREASURY);

    allezLabUsdtBalanceBefore = await usdtContract.balanceOf(ALLEZ_LAB_RECIPIENT);
    venusRecipientUsdcBalanceBefore = await usdcContract.balanceOf(VENUS_RECIPIENT);
  });

  describe("Pre-VIP behavior", () => {
    it("should have sufficient USDT balance in treasury", async () => {
      expect(treasuryUsdtBalanceBefore).to.be.gte(USDT_TO_ALLEZ);
    });

    it("should have sufficient vUSDC balance in treasury", async () => {
      expect(treasuryVUsdcBalanceBefore).to.be.gte(VUSDC_AMOUNT);
    });
  });

  testVip("VIP-594 Treasury Transfers", await vip594());

  describe("Post-VIP behavior", async () => {
    describe("Treasury Balance Changes", () => {
      it("treasury USDT balance decreased by 70,000", async () => {
        const treasuryUsdtBalanceAfter = await usdtContract.balanceOf(VTREASURY);
        expect(treasuryUsdtBalanceAfter).to.equal(treasuryUsdtBalanceBefore.sub(USDT_TO_ALLEZ));
      });

      it("treasury vUSDC balance decreased by approximately VUSDC_AMOUNT", async () => {
        const treasuryVUsdcBalanceAfter = await vUsdcContract.balanceOf(VTREASURY);
        // All ~76M vUSDC withdrawn; a tiny dust may return via receiver param
        // (because exchange rate accrues interest, so slightly less vUSDC is needed for 2M USDC)
        const vUsdcDecrease = treasuryVUsdcBalanceBefore.sub(treasuryVUsdcBalanceAfter);
        expect(vUsdcDecrease).to.be.lte(VUSDC_AMOUNT);
        // At least 99.9% of VUSDC_AMOUNT should have been consumed
        expect(vUsdcDecrease).to.be.gte(VUSDC_AMOUNT.mul(999).div(1000));
      });

      it("treasury USDC balance increased by exactly 600,000", async () => {
        const treasuryUsdcBalanceAfter = await usdcContract.balanceOf(VTREASURY);
        expect(treasuryUsdcBalanceAfter).to.equal(treasuryUsdcBalanceBefore.add(USDC_TO_TREASURY));
      });
    });

    describe("Allez Labs Recipient", () => {
      it("received 70,000 USDT", async () => {
        const allezLabUsdtBalanceAfter = await usdtContract.balanceOf(ALLEZ_LAB_RECIPIENT);
        expect(allezLabUsdtBalanceAfter).to.equal(allezLabUsdtBalanceBefore.add(USDT_TO_ALLEZ));
      });
    });

    describe("Venus Recipient", () => {
      it("received 1,400,000 USDC", async () => {
        const venusRecipientUsdcBalanceAfter = await usdcContract.balanceOf(VENUS_RECIPIENT);
        expect(venusRecipientUsdcBalanceAfter).to.equal(venusRecipientUsdcBalanceBefore.add(USDC_TO_VENUS));
      });
    });

    describe("Token Redeemer Cleanup", () => {
      it("Token Redeemer has no residual USDC", async () => {
        const redeemerUsdcBalance = await usdcContract.balanceOf(TOKEN_REDEEMER);
        expect(redeemerUsdcBalance).to.equal(0);
      });

      it("Token Redeemer has no residual vUSDC", async () => {
        const redeemerVUsdcBalance = await vUsdcContract.balanceOf(TOKEN_REDEEMER);
        expect(redeemerVUsdcBalance).to.equal(0);
      });
    });
  });
});
