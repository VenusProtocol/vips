import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { NORMAL_TIMELOCK, forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { vip224 } from "../../vips/vip-224";
import ERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import LIQUIDATOR_ABI from "./abi/liquidator.json";
import MOVE_DEBT_DELEGATE_ABI from "./abi/moveDebtDelegate.json";
import PRICE_ORACLE_ABI from "./abi/priceOracleAbi.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const LIQUIDATOR_CONTRACT = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";
const PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";
const NEW_MOVE_DEBT_DELEGATE_IMPL = "0x8439932C45e646FcC1009690417A65BF48f68Ce7";

const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const VBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";

const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const APPROVED_LIQUIDATOR_WALLET_1 = "0x56306851238D7Aee9FaC8cDd6877E92f83d5924c";
const APPROVED_LIQUIDATOR_WALLET_2 = "0x1934057d1DE58cF65fB59277A91f26aC9f8A4282";
const USDC_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
const USDT_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
const BTC_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const ANY_USER = "0x0000000000000000000000000000000000000001";

const BORROWERS_IN_SHORTFALL = [
  "0xef044206db68e40520bfa82d45419d498b4bc7bf",
  "0x7589dd3355dae848fdbf75044a3495351655cb1a",
  "0x24e77e5b74b30b026e9996e4bc3329c881e24968",
  "0x33df7a7f6d44307e1e5f3b15975b47515e5524c0",
  "0x1f6d66ba924ebf554883cf84d482394013ed294b",
  "0x3b7f525dc67cca55251abb5d04c81a83a6005269",
  "0x0f2577ccb1e895ed1e8bfd4e709706595831e78a",
  "0xbd043882d36b6def4c30f20c613cfa70d3af8bb7",
  "0x4f381fb46dfde2bc9dcae2d881705749b1ed6e1a",
  "0x7b899b97afacd8b9654a447b4db016ba430f6d11",
  "0xe62721e908b7cbd4f92a014d5ccf07adbf71933b",
  "0x8dcf5f960c38fd1861a4d036513adde829d63d81",
  "0x3762e67e24b9b44cea8e89163aba9d4015e27d40",
  "0x7eb163e6d0562d8534ab198551b7bf8815371152",
  "0x55f6dc97d739f52d66c7332c2f93016a4c9d852d",
  "0xb38a6184069cf136ee9d145c6acf564dd10fd195",
  "0x1e85d99e182557960e2b86bb53ca417007eed16a",
  "0x5cf9f8a81eb9a3eff4c72326903b27782eb47be2",
];

const VTOKENS_WITH_BAD_DEBT = [VUSDC, VUSDT, VBNB, VBTC, VETH, VBCH, VDAI, VTUSDOLD];

const MOVE_DEBT_ALLOWLIST: { [borrower: string]: string[] } = {
  "0xef044206db68e40520bfa82d45419d498b4bc7bf": [VBTC, VETH, VBCH],
  "0x7589dd3355dae848fdbf75044a3495351655cb1a": [VETH],
  "0x24e77e5b74b30b026e9996e4bc3329c881e24968": [VBTC, VETH],
  "0x33df7a7f6d44307e1e5f3b15975b47515e5524c0": [VBTC, VETH],
  "0x1f6d66ba924ebf554883cf84d482394013ed294b": [VUSDC, VUSDT, VETH],
  "0x3b7f525dc67cca55251abb5d04c81a83a6005269": [VUSDT],
  "0x0f2577ccb1e895ed1e8bfd4e709706595831e78a": [VUSDC, VUSDT, VTUSDOLD],
  "0xbd043882d36b6def4c30f20c613cfa70d3af8bb7": [VUSDC],
  "0x4f381fb46dfde2bc9dcae2d881705749b1ed6e1a": [VUSDT],
  "0x7b899b97afacd8b9654a447b4db016ba430f6d11": [VUSDT],
  "0xe62721e908b7cbd4f92a014d5ccf07adbf71933b": [VDAI],
  "0x8dcf5f960c38fd1861a4d036513adde829d63d81": [VUSDC],
  "0x3762e67e24b9b44cea8e89163aba9d4015e27d40": [VUSDT],
  "0x7eb163e6d0562d8534ab198551b7bf8815371152": [VUSDT],
  "0x55f6dc97d739f52d66c7332c2f93016a4c9d852d": [VUSDC, VUSDT],
  "0xb38a6184069cf136ee9d145c6acf564dd10fd195": [VUSDT],
  "0x1e85d99e182557960e2b86bb53ca417007eed16a": [VUSDC],
  "0x5cf9f8a81eb9a3eff4c72326903b27782eb47be2": [VTUSDOLD],
};

// Interest rate model with no interest, for testing purposes
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

forking(34775900, async () => {
  testVip("VIP-224 Forced liquidations for user", await vip224());
});

forking(34775900, async () => {
  let comptroller: Contract;
  let liquidatorContract: Contract;
  let moveDebtDelegate: Contract;
  let oracle: Contract;
  let usdc: Contract;
  let usdt: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    liquidatorContract = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR_CONTRACT);
    const oracleAddress = await comptroller.oracle();
    oracle = await ethers.getContractAt(PRICE_ORACLE_ABI, oracleAddress);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    moveDebtDelegate = await ethers.getContractAt(MOVE_DEBT_DELEGATE_ABI, MOVE_DEBT_DELEGATE);
    await pretendExecutingVip(await vip224());
  });

  describe("Forced liquidation", () => {
    it("should enable forced liquidation for BNB bridge exploiter", async () => {
      expect(await comptroller.isForcedLiquidationEnabledForUser(EXPLOITER_WALLET, VUSDT)).to.be.true;
      expect(await comptroller.isForcedLiquidationEnabledForUser(EXPLOITER_WALLET, VUSDC)).to.be.true;
      expect(await comptroller.isForcedLiquidationEnabledForUser(EXPLOITER_WALLET, VBTC)).to.be.true;
      expect(await comptroller.isForcedLiquidationEnabledForUser(EXPLOITER_WALLET, VETH)).to.be.true;
    });

    it(`should add ${APPROVED_LIQUIDATOR_WALLET_2} to allowlist`, async () => {
      expect(await liquidatorContract.allowedLiquidatorsByAccount(EXPLOITER_WALLET, APPROVED_LIQUIDATOR_WALLET_2)).to.be
        .true;
    });

    it(`should allow ${APPROVED_LIQUIDATOR_WALLET_1} to liquidate USDC debt of BNB bridge exploiter`, async () => {
      const approvedLiquidator = await initMainnetUser(APPROVED_LIQUIDATOR_WALLET_1, parseEther("1"));
      const usdcHolder = await initMainnetUser(USDC_HOLDER, parseEther("1"));
      const repayAmount = parseUnits("1000", 18);

      await usdc.connect(usdcHolder).transfer(APPROVED_LIQUIDATOR_WALLET_1, repayAmount);
      await usdc.connect(approvedLiquidator).approve(LIQUIDATOR_CONTRACT, repayAmount);
      const tx = await liquidatorContract
        .connect(approvedLiquidator)
        .liquidateBorrow(VUSDC, EXPLOITER_WALLET, repayAmount, VBNB);
      await expect(tx)
        .to.emit(liquidatorContract, "LiquidateBorrowedTokens")
        .withArgs(APPROVED_LIQUIDATOR_WALLET_1, EXPLOITER_WALLET, repayAmount, VUSDC, VBNB, anyValue, anyValue);
    });

    it(`should allow ${APPROVED_LIQUIDATOR_WALLET_2} to liquidate USDT debt of BNB bridge exploiter`, async () => {
      const approvedLiquidator = await initMainnetUser(APPROVED_LIQUIDATOR_WALLET_2, parseEther("1"));
      const usdtHolder = await initMainnetUser(USDT_HOLDER, parseEther("1"));
      const repayAmount = parseUnits("1000", 18);

      await usdt.connect(usdtHolder).transfer(APPROVED_LIQUIDATOR_WALLET_2, repayAmount);
      await usdt.connect(approvedLiquidator).approve(LIQUIDATOR_CONTRACT, repayAmount);
      const tx = await liquidatorContract
        .connect(approvedLiquidator)
        .liquidateBorrow(VUSDT, EXPLOITER_WALLET, repayAmount, VBNB);
      await expect(tx)
        .to.emit(liquidatorContract, "LiquidateBorrowedTokens")
        .withArgs(APPROVED_LIQUIDATOR_WALLET_2, EXPLOITER_WALLET, repayAmount, VUSDT, VBNB, anyValue, anyValue);
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

  describe("MoveDebtDelegate configuration", () => {
    let proxyAdmin: Contract;

    before(async () => {
      proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, PROXY_ADMIN);
    });

    it("has the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(MOVE_DEBT_DELEGATE)).to.equal(NEW_MOVE_DEBT_DELEGATE_IMPL);
    });

    it("allows USDT, USDC, BTC, ETH borrows", async () => {
      expect(await moveDebtDelegate.borrowAllowed(VUSDT)).to.be.true;
      expect(await moveDebtDelegate.borrowAllowed(VUSDC)).to.be.true;
      expect(await moveDebtDelegate.borrowAllowed(VBTC)).to.be.true;
      expect(await moveDebtDelegate.borrowAllowed(VETH)).to.be.true;
    });

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

  describe(`Moving BTC debt from 0xEF044206Db68E40520BfA82D45419d498b4bc7Bf to ETH debt of the exploiter`, () => {
    const borrowerAddress = "0xEF044206Db68E40520BfA82D45419d498b4bc7Bf";
    const repayAmount = parseUnits("1", 18);
    let vBTC: Contract;
    let vETH: Contract;
    let btc: Contract;
    let eth: Contract;
    let btcHolder: SignerWithAddress;

    before(async () => {
      vBTC = await ethers.getContractAt(VTOKEN_ABI, VBTC);
      vETH = await ethers.getContractAt(VTOKEN_ABI, VETH);
      btc = await ethers.getContractAt(ERC20_ABI, await vBTC.underlying());
      eth = await ethers.getContractAt(ERC20_ABI, await vETH.underlying());
      btcHolder = await initMainnetUser(BTC_HOLDER, parseEther("1"));
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await vBTC.connect(timelock)._setInterestRateModel(ZERO_RATE_MODEL);
    });

    beforeEach(async () => {
      await btc.connect(btcHolder).approve(moveDebtDelegate.address, repayAmount);
    });

    const convert = async (from: Contract, to: Contract, amount: BigNumber) => {
      const fromPrice = await oracle.getUnderlyingPrice(from.address);
      const toPrice = await oracle.getUnderlyingPrice(to.address);
      return amount.mul(fromPrice).div(toPrice);
    };

    it(`moves BTC debt from ${borrowerAddress} to ETH debt of the exploiter`, async () => {
      const [shortfallAccountDebtBefore, exploiterDebtBefore] = await Promise.all([
        vBTC.callStatic.borrowBalanceCurrent(borrowerAddress),
        vETH.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET),
      ]);
      await moveDebtDelegate.connect(btcHolder).moveDebt(vBTC.address, borrowerAddress, repayAmount, vETH.address);
      const [shortfallAccountDebtAfter, exploiterDebtAfter] = await Promise.all([
        vBTC.callStatic.borrowBalanceCurrent(borrowerAddress),
        vETH.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET),
      ]);
      expect(shortfallAccountDebtBefore.sub(shortfallAccountDebtAfter)).to.equal(repayAmount);
      expect(exploiterDebtAfter.sub(exploiterDebtBefore)).to.equal(await convert(vBTC, vETH, repayAmount));
    });

    it(`transfers BTC from the sender and sends ETH to the sender`, async () => {
      const [btcBalanceBefore, ethBalanceBefore] = await Promise.all([
        btc.balanceOf(BTC_HOLDER),
        eth.balanceOf(BTC_HOLDER),
      ]);
      await moveDebtDelegate.connect(btcHolder).moveDebt(vBTC.address, borrowerAddress, repayAmount, vETH.address);
      const [btcBalanceAfter, ethBalanceAfter] = await Promise.all([
        btc.balanceOf(BTC_HOLDER),
        eth.balanceOf(BTC_HOLDER),
      ]);
      expect(btcBalanceBefore.sub(btcBalanceAfter)).to.equal(repayAmount);
      expect(ethBalanceAfter.sub(ethBalanceBefore)).to.equal(await convert(vBTC, vETH, repayAmount));
    });

    it("emits RepayBorrow and Borrow events", async () => {
      const tx = await moveDebtDelegate
        .connect(btcHolder)
        .moveDebt(vBTC.address, borrowerAddress, repayAmount, vETH.address);
      await expect(tx).to.emit(vBTC, "RepayBorrow").withArgs(
        MOVE_DEBT_DELEGATE, // payer
        borrowerAddress, // old borrower
        repayAmount,
        anyValue,
        anyValue,
      );

      await expect(tx)
        .to.emit(vETH, "Borrow")
        .withArgs(
          EXPLOITER_WALLET, // new borrower
          await convert(vBTC, vETH, repayAmount),
          anyValue,
          anyValue,
        );
    });
  });
});
