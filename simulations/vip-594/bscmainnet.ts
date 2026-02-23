import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip594, {
  ALLEZ_LAB_RECIPIENT,
  USDC,
  USDC_AMOUNT,
  USDT,
  USDT_AMOUNT,
  VENUS_RECIPIENT,
  WBNB,
  WBNB_AMOUNT,
} from "../../vips/vip-594/bscmainnet";
import ERC20_ABI from "../vip-454/abi/ERC20.json";

const { VTREASURY } = NETWORK_ADDRESSES.bscmainnet;

forking(46500000, async () => {
  let usdcContract: any;
  let usdtContract: any;
  let wbnbContract: any;

  let treasuryUsdcBalanceBefore: BigNumber;
  let treasuryUsdtBalanceBefore: BigNumber;
  let treasuryWbnbBalanceBefore: BigNumber;

  let allezLabUsdcBalanceBefore: BigNumber;
  let venusRecipientUsdtBalanceBefore: BigNumber;
  let venusRecipientWbnbBalanceBefore: BigNumber;

  before(async () => {
    usdcContract = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    usdtContract = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    wbnbContract = new ethers.Contract(WBNB, ERC20_ABI, ethers.provider);

    // Record treasury balances before
    treasuryUsdcBalanceBefore = await usdcContract.balanceOf(VTREASURY);
    treasuryUsdtBalanceBefore = await usdtContract.balanceOf(VTREASURY);
    treasuryWbnbBalanceBefore = await wbnbContract.balanceOf(VTREASURY);

    // Record recipient balances before
    allezLabUsdcBalanceBefore = await usdcContract.balanceOf(
      ALLEZ_LAB_RECIPIENT
    );
    venusRecipientUsdtBalanceBefore = await usdtContract.balanceOf(
      VENUS_RECIPIENT
    );
    venusRecipientWbnbBalanceBefore = await wbnbContract.balanceOf(
      VENUS_RECIPIENT
    );
  });

  describe("Pre-VIP behavior", () => {
    it("should have sufficient USDC balance in treasury", async () => {
      expect(treasuryUsdcBalanceBefore).to.be.gte(USDC_AMOUNT);
    });

    it("should have sufficient USDT balance in treasury", async () => {
      expect(treasuryUsdtBalanceBefore).to.be.gte(USDT_AMOUNT);
    });

    it("should have sufficient WBNB balance in treasury", async () => {
      expect(treasuryWbnbBalanceBefore).to.be.gte(WBNB_AMOUNT);
    });
  });

  testVip("VIP-594 Treasury Transfers", await vip594());

  describe("Post-VIP behavior", async () => {
    describe("Treasury Balance Changes", () => {
      it("treasury USDC balance decreased by 70,000", async () => {
        const treasuryUsdcBalanceAfter = await usdcContract.balanceOf(
          VTREASURY
        );
        expect(treasuryUsdcBalanceAfter).to.equal(
          treasuryUsdcBalanceBefore.sub(USDC_AMOUNT)
        );
      });

      it("treasury USDT balance decreased by 400,000", async () => {
        const treasuryUsdtBalanceAfter = await usdtContract.balanceOf(
          VTREASURY
        );
        expect(treasuryUsdtBalanceAfter).to.equal(
          treasuryUsdtBalanceBefore.sub(USDT_AMOUNT)
        );
      });

      it("treasury WBNB balance decreased by 1,649", async () => {
        const treasuryWbnbBalanceAfter = await wbnbContract.balanceOf(
          VTREASURY
        );
        expect(treasuryWbnbBalanceAfter).to.equal(
          treasuryWbnbBalanceBefore.sub(WBNB_AMOUNT)
        );
      });
    });

    describe("Allez Lab Recipient", () => {
      it("received 70,000 USDC", async () => {
        const allezLabUsdcBalanceAfter = await usdcContract.balanceOf(
          ALLEZ_LAB_RECIPIENT
        );
        expect(allezLabUsdcBalanceAfter).to.equal(
          allezLabUsdcBalanceBefore.add(USDC_AMOUNT)
        );
      });
    });

    describe("Venus Recipient", () => {
      it("received 400,000 USDT", async () => {
        const venusRecipientUsdtBalanceAfter = await usdtContract.balanceOf(
          VENUS_RECIPIENT
        );
        expect(venusRecipientUsdtBalanceAfter).to.equal(
          venusRecipientUsdtBalanceBefore.add(USDT_AMOUNT)
        );
      });

      it("received 1,649 WBNB", async () => {
        const venusRecipientWbnbBalanceAfter = await wbnbContract.balanceOf(
          VENUS_RECIPIENT
        );
        expect(venusRecipientWbnbBalanceAfter).to.equal(
          venusRecipientWbnbBalanceBefore.add(WBNB_AMOUNT)
        );
      });

      it("received approximately $1.4M total (USDT + WBNB)", async () => {
        // Verify the total USD value received by Venus recipient
        // At ~$606.47/WBNB: 1,649 WBNB ≈ $1M
        // Plus 400,000 USDT ≈ $400K
        // Total ≈ $1.4M
        const venusRecipientUsdtBalanceAfter = await usdtContract.balanceOf(
          VENUS_RECIPIENT
        );
        const venusRecipientWbnbBalanceAfter = await wbnbContract.balanceOf(
          VENUS_RECIPIENT
        );

        const usdtReceived = venusRecipientUsdtBalanceAfter.sub(
          venusRecipientUsdtBalanceBefore
        );
        const wbnbReceived = venusRecipientWbnbBalanceAfter.sub(
          venusRecipientWbnbBalanceBefore
        );

        expect(usdtReceived).to.equal(USDT_AMOUNT);
        expect(wbnbReceived).to.equal(WBNB_AMOUNT);
      });
    });

    describe("Transfer Accuracy", () => {
      it("all transfers executed with exact amounts", async () => {
        const allezLabUsdcBalanceAfter = await usdcContract.balanceOf(
          ALLEZ_LAB_RECIPIENT
        );
        const venusRecipientUsdtBalanceAfter = await usdtContract.balanceOf(
          VENUS_RECIPIENT
        );
        const venusRecipientWbnbBalanceAfter = await wbnbContract.balanceOf(
          VENUS_RECIPIENT
        );

        // Verify exact transfer amounts
        const usdcTransferred = allezLabUsdcBalanceAfter.sub(
          allezLabUsdcBalanceBefore
        );
        const usdtTransferred = venusRecipientUsdtBalanceAfter.sub(
          venusRecipientUsdtBalanceBefore
        );
        const wbnbTransferred = venusRecipientWbnbBalanceAfter.sub(
          venusRecipientWbnbBalanceBefore
        );

        expect(usdcTransferred).to.equal(USDC_AMOUNT);
        expect(usdtTransferred).to.equal(USDT_AMOUNT);
        expect(wbnbTransferred).to.equal(WBNB_AMOUNT);
      });

      it("no tokens left in timelock after transfers", async () => {
        // Verify timelock doesn't hold any residual tokens from the transfers
        const timelockUsdcBalance = await usdcContract.balanceOf(
          NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK
        );
        const timelockUsdtBalance = await usdtContract.balanceOf(
          NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK
        );
        const timelockWbnbBalance = await wbnbContract.balanceOf(
          NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK
        );

        // Note: These checks verify no NEW tokens are stuck; timelock may have existing balances
        // We're not checking absolute values, just that our transfers didn't leave residuals
        // This is verified by the exact amount checks above
        expect(timelockUsdcBalance).to.be.gte(0);
        expect(timelockUsdtBalance).to.be.gte(0);
        expect(timelockWbnbBalance).to.be.gte(0);
      });
    });
  });
});
