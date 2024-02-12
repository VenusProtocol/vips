import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser, setMaxStaleCoreAssets } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import vip267 from "../../vips/vip-267/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import IERC20_ABI from "./abi/IERC20Abi.json";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";

const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const LIQUIDATE_AND_REDEEM_HELPER = "0xA08301b7C5f4BccD654De95E8C9BD4388CC54Ec1";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const LIQUIDATOR = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";
const VUSDC_AMOUNT = parseUnits("326081635.9401868", 8);
const REPAY_AMOUNT = parseUnits("7605011.44891787996502290", 18);
const EXPECTED_BNB_AMOUNT = parseUnits("20456.609799695853115141", 18);

// Interest rate model with no interest, for testing purposes
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

forking(36726026, () => {
  const usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
  const vUSDC = new ethers.Contract(VUSDC, VTOKEN_ABI, ethers.provider);
  const vBNB = new ethers.Contract(VBNB, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);

  let treasuryVTokenBalanceBefore: BigNumber;
  let treasuryBalanceBefore: BigNumber;
  let exploiterDebtBefore: BigNumber;
  let binanceWalletBalanceBefore: BigNumber;

  before(async () => {
    await setMaxStaleCoreAssets(CHAINLINK_ORACLE, NORMAL_TIMELOCK);

    // Set zero rate models to prevent interest accruals, so that borrow balance diffs are exact
    const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
    vUSDC.connect(timelock)._setInterestRateModel(ZERO_RATE_MODEL);

    treasuryBalanceBefore = await usdc.balanceOf(TREASURY);
    treasuryVTokenBalanceBefore = await vUSDC.balanceOf(TREASURY);
    exploiterDebtBefore = await vUSDC.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET);
    binanceWalletBalanceBefore = await ethers.provider.getBalance(BINANCE_WALLET);
  });

  testVip("VIP-267", vip267());

  describe("Post-VIP state", () => {
    it(`transfers ${formatUnits(VUSDC_AMOUNT, 8)} vUSDC from treasury`, async () => {
      const treasuryVTokenBalanceAfter = await vUSDC.balanceOf(TREASURY);
      const treasuryVTokenBalanceDelta = treasuryVTokenBalanceBefore.sub(treasuryVTokenBalanceAfter);
      expect(treasuryVTokenBalanceDelta).to.equal(VUSDC_AMOUNT);
    });

    it(`redeems vUSDC and transfers dust to treasury`, async () => {
      const treasuryBalanceAfter = await usdc.balanceOf(TREASURY);
      const treasuryBalanceDelta = treasuryBalanceAfter.sub(treasuryBalanceBefore);
      expect(treasuryBalanceDelta).to.equal(parseUnits("8.018348270861963412", 18));
    });

    it("leaves no USDC in the liquidate and redeem helper contract", async () => {
      expect(await usdc.balanceOf(LIQUIDATE_AND_REDEEM_HELPER)).to.equal(0);
    });

    it("leaves no vBNB in the liquidate and redeem helper contract", async () => {
      expect(await vBNB.balanceOf(LIQUIDATE_AND_REDEEM_HELPER)).to.equal(0);
    });

    it(`reduces exploiter debt by ${formatUnits(REPAY_AMOUNT, 18)} USDC`, async () => {
      const exploiterDebtAfter = await vUSDC.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET);
      const exploiterDebtDelta = exploiterDebtBefore.sub(exploiterDebtAfter);
      expect(exploiterDebtDelta).to.equal(REPAY_AMOUNT);
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
