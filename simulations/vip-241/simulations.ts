import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip241 } from "../../vips/vip-241";
import ERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOVE_DEBT_DELEGATE_ABI from "./abi/moveDebtDelegate.json";
import PRICE_ORACLE_ABI from "./abi/priceOracleAbi.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";

const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const USDC_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
const USDT_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
const BTC_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const ANY_USER = "0x0000000000000000000000000000000000000001";

const BORROWERS_IN_SHORTFALL = [EXPLOITER_WALLET];

const VTOKENS_WITH_BAD_DEBT = [VUSDC, VUSDT, VBTC, VETH];

const MOVE_DEBT_ALLOWLIST: { [borrower: string]: string[] } = {
  [EXPLOITER_WALLET]: [VUSDC, VUSDT],
};

// Interest rate model with no interest, for testing purposes
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

forking(35356722, () => {
  testVip("VIP-241 Forced liquidations for user", vip241());
});

forking(35356722, () => {
  let comptroller: Contract;
  let moveDebtDelegate: Contract;
  let oracle: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    const oracleAddress = await comptroller.oracle();
    oracle = await ethers.getContractAt(PRICE_ORACLE_ABI, oracleAddress);
    moveDebtDelegate = await ethers.getContractAt(MOVE_DEBT_DELEGATE_ABI, MOVE_DEBT_DELEGATE);
    await pretendExecutingVip(vip241());
  });

  describe("MoveDebtDelegate configuration", () => {
    describe("repaymentAllowed matrix", () => {
      for (const borrower of BORROWERS_IN_SHORTFALL) {
        for (const vTokenAddress of VTOKENS_WITH_BAD_DEBT) {
          const isAllowed = MOVE_DEBT_ALLOWLIST[borrower].includes(vTokenAddress);
          it(`sets repaymentAllowed(${borrower}, ${vTokenAddress}) to ${isAllowed}`, async () => {
            expect(await moveDebtDelegate.repaymentAllowed(vTokenAddress, borrower)).to.equal(isAllowed);
          });
        }
      }
    });

    it("does not allow ANY_USER wildcard for any vToken", async () => {
      const allMarkets = await comptroller.getAllMarkets();
      for (const market of allMarkets) {
        expect(await moveDebtDelegate.repaymentAllowed(market, ANY_USER)).to.equal(false);
      }
    });
  });

  describe(`Moving USDT debt from 0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc to BTC debt of the exploiter`, () => {
    const borrowerAddress = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
    const repayAmount = parseUnits("1000000", 18);
    let vUSDC: Contract;
    let vUSDT: Contract;
    let vBTC: Contract;
    let usdc: Contract;
    let usdt: Contract;
    let btc: Contract;
    let usdcHolder: SignerWithAddress;
    let usdtHolder: SignerWithAddress;

    before(async () => {
      vUSDC = await ethers.getContractAt(VTOKEN_ABI, VUSDC);
      vUSDT = await ethers.getContractAt(VTOKEN_ABI, VUSDT);
      vBTC = await ethers.getContractAt(VTOKEN_ABI, VBTC);
      usdc = await ethers.getContractAt(ERC20_ABI, await vUSDC.underlying());
      usdt = await ethers.getContractAt(ERC20_ABI, await vUSDT.underlying());
      btc = await ethers.getContractAt(ERC20_ABI, await vBTC.underlying());
      usdcHolder = await initMainnetUser(USDC_HOLDER, parseEther("1"));
      usdtHolder = await initMainnetUser(USDT_HOLDER, parseEther("1"));
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await vUSDT.connect(timelock)._setInterestRateModel(ZERO_RATE_MODEL);
      await vBTC.connect(timelock)._setInterestRateModel(ZERO_RATE_MODEL);

      // Funding the exploiter wallet to ensure it is not underwater
      const extraFunding = parseUnits("10000000", 18);
      await usdc.connect(usdcHolder).approve(vUSDC.address, extraFunding);
      await vUSDC.connect(usdcHolder).mintBehalf(EXPLOITER_WALLET, extraFunding);
    });

    beforeEach(async () => {
      await usdt.connect(usdtHolder).approve(moveDebtDelegate.address, repayAmount);
    });

    const convert = async (from: Contract, to: Contract, amount: BigNumber) => {
      const fromPrice = await oracle.getUnderlyingPrice(from.address);
      const toPrice = await oracle.getUnderlyingPrice(to.address);
      return amount.mul(fromPrice).div(toPrice);
    };

    it(`moves USDT debt from ${borrowerAddress} to BTC debt of the exploiter`, async () => {
      const [shortfallAccountDebtBefore, exploiterDebtBefore] = await Promise.all([
        vUSDT.callStatic.borrowBalanceCurrent(borrowerAddress),
        vBTC.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET),
      ]);
      await moveDebtDelegate.connect(usdtHolder).moveDebt(vUSDT.address, borrowerAddress, repayAmount, vBTC.address);
      const [shortfallAccountDebtAfter, exploiterDebtAfter] = await Promise.all([
        vUSDT.callStatic.borrowBalanceCurrent(borrowerAddress),
        vBTC.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET),
      ]);
      expect(shortfallAccountDebtBefore.sub(shortfallAccountDebtAfter)).to.equal(repayAmount);
      expect(exploiterDebtAfter.sub(exploiterDebtBefore)).to.equal(await convert(vUSDT, vBTC, repayAmount));
    });

    it(`transfers USDT from the sender and sends BTC to the sender`, async () => {
      const [usdtBalanceBefore, btcBalanceBefore] = await Promise.all([
        usdt.balanceOf(USDT_HOLDER),
        btc.balanceOf(USDT_HOLDER),
      ]);
      await moveDebtDelegate.connect(usdtHolder).moveDebt(vUSDT.address, borrowerAddress, repayAmount, vBTC.address);
      const [usdtBalanceAfter, btcBalanceAfter] = await Promise.all([
        usdt.balanceOf(USDT_HOLDER),
        btc.balanceOf(USDT_HOLDER),
      ]);
      expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.equal(repayAmount);
      expect(btcBalanceAfter.sub(btcBalanceBefore)).to.equal(await convert(vUSDT, vBTC, repayAmount));
    });

    it("emits RepayBorrow and Borrow events", async () => {
      const tx = await moveDebtDelegate
        .connect(usdtHolder)
        .moveDebt(vUSDT.address, borrowerAddress, repayAmount, vBTC.address);
      await expect(tx).to.emit(vUSDT, "RepayBorrow").withArgs(
        MOVE_DEBT_DELEGATE, // payer
        borrowerAddress, // old borrower
        repayAmount,
        anyValue,
        anyValue,
      );

      await expect(tx)
        .to.emit(vBTC, "Borrow")
        .withArgs(
          EXPLOITER_WALLET, // new borrower
          await convert(vUSDT, vBTC, repayAmount),
          anyValue,
          anyValue,
        );
    });
  });
});
