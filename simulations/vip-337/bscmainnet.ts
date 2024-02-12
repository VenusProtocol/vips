import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser, setMaxStaleCoreAssets } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import vip337 from "../../vips/vip-337/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import IERC20_ABI from "./abi/IERC20Abi.json";
import LIQUIDATE_AND_REDEEM_ABI from "./abi/LiquidateAndRedeem.json";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";
import TREASURY_ABI from "./abi/VTreasury.json";

const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const LIQUIDATE_AND_REDEEM_HELPER = "0xa569524A42E28580d5A5B1BdB847517BA0000ffE";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const LIQUIDATOR = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const VUSDC_AMOUNT = parseUnits("276060909.74786926", 8);
const REPAY_AMOUNT_WITH_INTEREST = parseUnits("6655965.849513021969132983", 18);
const EXPECTED_BNB_AMOUNT = parseUnits("14811.539080677835945182", 18);

// Interest rate model with no interest, for testing purposes
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

forking(40211900, () => {
  const usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
  const vUSDC = new ethers.Contract(VUSDC, VTOKEN_ABI, ethers.provider);
  const vBNB = new ethers.Contract(VBNB, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const treasury = new ethers.Contract(TREASURY, TREASURY_ABI, ethers.provider);
  const liquidateAndRedeemHelper = new ethers.Contract(
    LIQUIDATE_AND_REDEEM_HELPER,
    LIQUIDATE_AND_REDEEM_ABI,
    ethers.provider,
  );

  let timelock: SignerWithAddress;
  let treasuryVTokenBalanceBefore: BigNumber;
  let exploiterDebtBefore: BigNumber;
  let binanceWalletBalanceBefore: BigNumber;

  before(async () => {
    await setMaxStaleCoreAssets(CHAINLINK_ORACLE, NORMAL_TIMELOCK);

    // Set zero rate models to prevent interest accruals, so that borrow balance diffs are exact
    timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
    vUSDC.connect(timelock)._setInterestRateModel(ZERO_RATE_MODEL);

    treasuryVTokenBalanceBefore = await vUSDC.balanceOf(TREASURY);
    exploiterDebtBefore = await vUSDC.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET);
    binanceWalletBalanceBefore = await ethers.provider.getBalance(BINANCE_WALLET);
  });

  describe("Liquidate and redeem helper", () => {
    const USDC_SWEEP_AMOUNT = parseUnits("10", 18);
    const NATIVE_SWEEP_AMOUNT = parseUnits("0.01", 18);

    before(async () => {
      await treasury.connect(timelock).withdrawTreasuryBEP20(USDC, USDC_SWEEP_AMOUNT, LIQUIDATE_AND_REDEEM_HELPER);
      await treasury.connect(timelock).withdrawTreasuryBNB(NATIVE_SWEEP_AMOUNT, LIQUIDATE_AND_REDEEM_HELPER);
    });

    it("is owned by timelock", async () => {
      const liquidateAndRedeemHelper = new ethers.Contract(
        LIQUIDATE_AND_REDEEM_HELPER,
        LIQUIDATE_AND_REDEEM_ABI,
        ethers.provider,
      );
      expect(await liquidateAndRedeemHelper.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("does not allow a non-owner to sweep tokens", async () => {
      const [someone] = await ethers.getSigners();
      const tx = liquidateAndRedeemHelper.connect(someone).sweepTokens(USDC, someone.address);
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("does not allow a non-owner to sweep native", async () => {
      const [someone] = await ethers.getSigners();
      const tx = liquidateAndRedeemHelper.connect(someone).sweepNative(someone.address);
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("allows timelock to sweep tokens", async () => {
      const tx = await liquidateAndRedeemHelper.connect(timelock).sweepTokens(USDC, TREASURY);
      await expect(tx).to.changeTokenBalance(usdc, TREASURY, USDC_SWEEP_AMOUNT);
      expect(await usdc.balanceOf(LIQUIDATE_AND_REDEEM_HELPER)).to.equal(0);
    });

    it("allows timelock to sweep native", async () => {
      const tx = await liquidateAndRedeemHelper.connect(timelock).sweepNative(TREASURY);
      await expect(tx).to.changeEtherBalance(TREASURY, NATIVE_SWEEP_AMOUNT);
      expect(await ethers.provider.getBalance(LIQUIDATE_AND_REDEEM_HELPER)).to.equal(0);
    });
  });

  testVip("VIP-337", vip337());

  describe("Post-VIP state", () => {
    it(`transfers ${formatUnits(VUSDC_AMOUNT, 8)} vUSDC from treasury`, async () => {
      const treasuryVTokenBalanceAfter = await vUSDC.balanceOf(TREASURY);
      const treasuryVTokenBalanceDelta = treasuryVTokenBalanceBefore.sub(treasuryVTokenBalanceAfter);
      expect(treasuryVTokenBalanceDelta).to.equal(VUSDC_AMOUNT);
    });

    it("leaves no USDC in the liquidate and redeem helper contract", async () => {
      expect(await usdc.balanceOf(LIQUIDATE_AND_REDEEM_HELPER)).to.equal(0);
    });

    it("leaves no vBNB in the liquidate and redeem helper contract", async () => {
      expect(await vBNB.balanceOf(LIQUIDATE_AND_REDEEM_HELPER)).to.equal(0);
    });

    it(`reduces exploiter debt by ${formatUnits(REPAY_AMOUNT_WITH_INTEREST, 18)} USDC`, async () => {
      const exploiterDebtAfter = await vUSDC.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET);
      const exploiterDebtDelta = exploiterDebtBefore.sub(exploiterDebtAfter);
      expect(exploiterDebtDelta).to.equal(REPAY_AMOUNT_WITH_INTEREST);
    });

    it(`transfers ${formatUnits(EXPECTED_BNB_AMOUNT, 18)} BNB to Binance wallet`, async () => {
      const binanceWalletBalanceAfter = await ethers.provider.getBalance(BINANCE_WALLET);
      const binanceWalletBalanceDelta = binanceWalletBalanceAfter.sub(binanceWalletBalanceBefore);
      expect(binanceWalletBalanceDelta).to.equal(EXPECTED_BNB_AMOUNT);
    });

    it("restores the liquidator contract address", async () => {
      expect(await comptroller.liquidatorContract()).to.equal(LIQUIDATOR);
    });
  });
});
