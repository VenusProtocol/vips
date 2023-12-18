import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip221 } from "../../vips/vip-221";
import ERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import LIQUIDATOR_ABI from "./abi/liquidator.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const LIQUIDATOR_CONTRACT = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const APPROVED_LIQUIDATOR_WALLET = "0x56306851238D7Aee9FaC8cDd6877E92f83d5924c";
const USDC_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
const USDT_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";

forking(34469100, () => {
  testVip("VIP-221 Forced liquidations for user", vip221());
});

forking(34469100, () => {
  let comptroller: Contract;
  let liquidatorContract: Contract;
  let usdc: Contract;
  let usdt: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    liquidatorContract = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR_CONTRACT);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    await pretendExecutingVip(vip221());
  });

  describe("Post-VIP behavior", () => {
    it("should enable forced liquidation for BNB bridge exploiter", async () => {
      expect(await comptroller.isForcedLiquidationEnabledForUser(EXPLOITER_WALLET, VUSDT)).to.be.true;
      expect(await comptroller.isForcedLiquidationEnabledForUser(EXPLOITER_WALLET, VUSDC)).to.be.true;
    });

    it(`should allow ${APPROVED_LIQUIDATOR_WALLET} to liquidate USDC debt of BNB bridge exploiter`, async () => {
      const approvedLiquidator = await initMainnetUser(APPROVED_LIQUIDATOR_WALLET, parseEther("1"));
      const usdcHolder = await initMainnetUser(USDC_HOLDER, parseEther("1"));
      const repayAmount = parseUnits("1000", 18);

      await usdc.connect(usdcHolder).transfer(APPROVED_LIQUIDATOR_WALLET, repayAmount);
      await usdc.connect(approvedLiquidator).approve(LIQUIDATOR_CONTRACT, repayAmount);
      const tx = await liquidatorContract
        .connect(approvedLiquidator)
        .liquidateBorrow(VUSDC, EXPLOITER_WALLET, repayAmount, VBNB);
      await expect(tx)
        .to.emit(liquidatorContract, "LiquidateBorrowedTokens")
        .withArgs(APPROVED_LIQUIDATOR_WALLET, EXPLOITER_WALLET, repayAmount, VUSDC, VBNB, anyValue, anyValue);
    });

    it(`should allow ${APPROVED_LIQUIDATOR_WALLET} to liquidate USDT debt of BNB bridge exploiter`, async () => {
      const approvedLiquidator = await initMainnetUser(APPROVED_LIQUIDATOR_WALLET, parseEther("1"));
      const usdtHolder = await initMainnetUser(USDT_HOLDER, parseEther("1"));
      const repayAmount = parseUnits("1000", 18);

      await usdt.connect(usdtHolder).transfer(APPROVED_LIQUIDATOR_WALLET, repayAmount);
      await usdt.connect(approvedLiquidator).approve(LIQUIDATOR_CONTRACT, repayAmount);
      const tx = await liquidatorContract
        .connect(approvedLiquidator)
        .liquidateBorrow(VUSDT, EXPLOITER_WALLET, repayAmount, VBNB);
      await expect(tx)
        .to.emit(liquidatorContract, "LiquidateBorrowedTokens")
        .withArgs(APPROVED_LIQUIDATOR_WALLET, EXPLOITER_WALLET, repayAmount, VUSDT, VBNB, anyValue, anyValue);
    });

    it(`should fail if someone else tries to liquidate USDC debt of BNB bridge exploiter`, async () => {
      const usdcHolder = await initMainnetUser(USDC_HOLDER, parseEther("1"));
      const repayAmount = parseUnits("1000", 18);

      await usdc.connect(usdcHolder).approve(LIQUIDATOR_CONTRACT, repayAmount);
      await expect(
        liquidatorContract.connect(usdcHolder).liquidateBorrow(VUSDC, EXPLOITER_WALLET, repayAmount, VBNB),
      ).to.be.revertedWithCustomError(liquidatorContract, "LiquidationNotAllowed");
    });

    it(`should fail if someone else tries to liquidate USDT debt of BNB bridge exploiter`, async () => {
      const usdtHolder = await initMainnetUser(USDT_HOLDER, parseEther("1"));
      const repayAmount = parseUnits("1000", 18);

      await usdt.connect(usdtHolder).approve(LIQUIDATOR_CONTRACT, repayAmount);
      await expect(
        liquidatorContract.connect(usdtHolder).liquidateBorrow(VUSDT, EXPLOITER_WALLET, repayAmount, VBNB),
      ).to.be.revertedWithCustomError(liquidatorContract, "LiquidationNotAllowed");
    });
  });
});
