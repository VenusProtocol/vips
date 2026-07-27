import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip665, {
  RECIPIENT,
  TOKEN_REDEEMER,
  USDC,
  USDC_FROM_BALANCE,
  USDC_SHORTFALL,
  USDC_TOTAL,
  VUSDC_AMOUNT,
  vUSDC,
} from "../../vips/vip-665/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";

const { VTREASURY } = NETWORK_ADDRESSES.bscmainnet;

forking(110000000, async () => {
  let usdcContract: any;
  let vUsdcContract: any;

  let treasuryUsdcBalanceBefore: BigNumber;
  let treasuryVUsdcBalanceBefore: BigNumber;
  let recipientUsdcBalanceBefore: BigNumber;

  before(async () => {
    usdcContract = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vUsdcContract = new ethers.Contract(vUSDC, ERC20_ABI, ethers.provider);

    treasuryUsdcBalanceBefore = await usdcContract.balanceOf(VTREASURY);
    treasuryVUsdcBalanceBefore = await vUsdcContract.balanceOf(VTREASURY);
    recipientUsdcBalanceBefore = await usdcContract.balanceOf(RECIPIENT);
  });

  describe("Pre-VIP behavior", () => {
    it("total to deliver equals liquid withdrawal plus redeemed shortfall", async () => {
      expect(USDC_FROM_BALANCE.add(USDC_SHORTFALL)).to.equal(USDC_TOTAL);
    });

    it("treasury holds at least the liquid USDC amount to withdraw", async () => {
      expect(treasuryUsdcBalanceBefore).to.be.gte(USDC_FROM_BALANCE);
    });

    it("treasury holds at least the vUSDC amount to redeem", async () => {
      expect(treasuryVUsdcBalanceBefore).to.be.gte(VUSDC_AMOUNT);
    });
  });

  testVip("VIP-665 Withdraw 3.1M USDC from Treasury for Finance", await vip665());

  describe("Post-VIP behavior", async () => {
    it("recipient received exactly 3,100,000 USDC", async () => {
      const recipientUsdcBalanceAfter = await usdcContract.balanceOf(RECIPIENT);
      expect(recipientUsdcBalanceAfter.sub(recipientUsdcBalanceBefore)).to.equal(USDC_TOTAL);
    });

    it("treasury liquid USDC decreased by exactly USDC_FROM_BALANCE", async () => {
      const treasuryUsdcBalanceAfter = await usdcContract.balanceOf(VTREASURY);
      expect(treasuryUsdcBalanceAfter).to.equal(treasuryUsdcBalanceBefore.sub(USDC_FROM_BALANCE));
    });

    it("treasury vUSDC decreased by at most VUSDC_AMOUNT (leftover returned to treasury)", async () => {
      const treasuryVUsdcBalanceAfter = await vUsdcContract.balanceOf(VTREASURY);
      const vUsdcDecrease = treasuryVUsdcBalanceBefore.sub(treasuryVUsdcBalanceAfter);
      // Never consume more than what was withdrawn to the redeemer.
      expect(vUsdcDecrease).to.be.lte(VUSDC_AMOUNT);
      // The over-provisioning margin is ~0.5%, so at least ~99% of the amount is consumed for the redeem.
      expect(vUsdcDecrease).to.be.gte(VUSDC_AMOUNT.mul(99).div(100));
    });

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
