import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { checkCorePoolComptroller } from "../../src/vip-framework/checks/checkCorePoolComptroller";
import { vip215 } from "../../vips/vip-215";
import IERC20_UPGRADABLE_ABI from "./abi/IERC20UpgradableAbi.json";
import VBEP20_DELEGATE_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOVE_DEBT_DELEGATE_ABI from "./abi/moveDebtDelegate.json";
import PRICE_ORACLE_ABI from "./abi/priceOracleAbi.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const DIAMOND_IMPL = "0xD93bFED40466c9A9c3E7381ab335a08807318a1b";
const BNB_BRIDGE_EXPLOITER = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";
const BUSD_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

// Interest rate model with no interest, for testing purposes
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

forking(34258500, async () => {
  testVip("VIP-215", await vip215());
});

// Ressetting the fork to prevent oracle prices from getting stale
forking(34258500, () => {
  let comptroller: Contract;
  let busd: Contract;
  let usdc: Contract;
  let usdt: Contract;
  let vBUSD: Contract;
  let vUSDC: Contract;
  let vUSDT: Contract;
  let moveDebtDelegate: Contract;
  let oracle: Contract;
  let busdHolder: SignerWithAddress;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    [vBUSD, vUSDC, vUSDT] = [VBUSD, VUSDC, VUSDT].map((address: string) => {
      return new ethers.Contract(address, VBEP20_DELEGATE_ABI, provider);
    });
    [busd, usdc, usdt] = await Promise.all(
      [vBUSD, vUSDC, vUSDT].map(async (vToken: Contract) => {
        const underlying = await vToken.underlying();
        return new ethers.Contract(underlying, IERC20_UPGRADABLE_ABI, provider);
      }),
    );
    const oracleAddress = await comptroller.oracle();
    oracle = new ethers.Contract(oracleAddress, PRICE_ORACLE_ABI, provider);
    moveDebtDelegate = new ethers.Contract(MOVE_DEBT_DELEGATE, MOVE_DEBT_DELEGATE_ABI, provider);
    busdHolder = await initMainnetUser(BUSD_HOLDER, parseEther("1"));
    await pretendExecutingVip(await vip215());
  });

  describe("Post-VIP contracts status", async () => {
    it("sets Comptroller implementation back to the diamond version", async () => {
      expect(await comptroller.comptrollerImplementation()).to.equal(DIAMOND_IMPL);
    });

    it("sets the delegate for BNB bridge exploiter", async () => {
      expect(await comptroller.approvedDelegates(BNB_BRIDGE_EXPLOITER, MOVE_DEBT_DELEGATE)).to.equal(true);
    });

    checkCorePoolComptroller();
  });

  ["USDT", "USDC"].map((symbol: string) => {
    describe(`Moving debt from BUSD to ${symbol}`, () => {
      const borrowerAddress = "0x8d655AAAA0ec224b17972df385e25325b9103332";
      const repayAmount = parseUnits("1000", 18);
      let vToken: Contract;
      let borrowedAsset: Contract;

      before(async () => {
        vToken = symbol === "USDT" ? vUSDT : vUSDC;
        borrowedAsset = symbol === "USDT" ? usdt : usdc;
        const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
        await vToken.connect(timelock)._setInterestRateModel(ZERO_RATE_MODEL);
      });

      beforeEach(async () => {
        await busd.connect(busdHolder).approve(moveDebtDelegate.address, repayAmount);
      });

      const convert = async (from: Contract, to: Contract, amount: BigNumber) => {
        const fromPrice = await oracle.getUnderlyingPrice(from.address);
        const toPrice = await oracle.getUnderlyingPrice(to.address);
        return amount.mul(fromPrice).div(toPrice);
      };

      it(`moves the BUSD debt of a shortfall account to ${symbol} debt of the BNB exploiter`, async () => {
        const [busdDebtBefore, exploiterDebtBefore] = await Promise.all([
          vBUSD.callStatic.borrowBalanceCurrent(borrowerAddress),
          vToken.callStatic.borrowBalanceCurrent(BNB_BRIDGE_EXPLOITER),
        ]);
        await moveDebtDelegate.connect(busdHolder).moveDebt(borrowerAddress, repayAmount, vToken.address);
        const [busdDebtAfter, exploiterDebtAfter] = await Promise.all([
          vBUSD.callStatic.borrowBalanceCurrent(borrowerAddress),
          vToken.callStatic.borrowBalanceCurrent(BNB_BRIDGE_EXPLOITER),
        ]);
        expect(busdDebtBefore.sub(busdDebtAfter)).to.equal(repayAmount);
        expect(exploiterDebtAfter.sub(exploiterDebtBefore)).to.equal(await convert(vBUSD, vToken, repayAmount));
      });

      it(`transfers BUSD from the sender and sends ${symbol} to the sender`, async () => {
        const [busdBalanceBefore, borrowedAssetBalanceBefore] = await Promise.all([
          busd.balanceOf(BUSD_HOLDER),
          borrowedAsset.balanceOf(BUSD_HOLDER),
        ]);
        await moveDebtDelegate.connect(busdHolder).moveDebt(borrowerAddress, repayAmount, vToken.address);
        const [busdBalanceAfter, borrowedAssetBalanceAfter] = await Promise.all([
          busd.balanceOf(BUSD_HOLDER),
          borrowedAsset.balanceOf(BUSD_HOLDER),
        ]);
        expect(busdBalanceBefore.sub(busdBalanceAfter)).to.equal(repayAmount);
        expect(borrowedAssetBalanceAfter.sub(borrowedAssetBalanceBefore)).to.equal(
          await convert(vBUSD, vToken, repayAmount),
        );
      });

      it("emits RepayBorrow and Borrow events", async () => {
        const tx = await moveDebtDelegate.connect(busdHolder).moveDebt(borrowerAddress, repayAmount, vToken.address);
        await expect(tx).to.emit(vBUSD, "RepayBorrow").withArgs(
          MOVE_DEBT_DELEGATE, // payer
          borrowerAddress, // old borrower
          repayAmount,
          anyValue,
          anyValue,
        );

        await expect(tx)
          .to.emit(vToken, "Borrow")
          .withArgs(
            BNB_BRIDGE_EXPLOITER, // new borrower
            await convert(vBUSD, vToken, repayAmount),
            anyValue,
            anyValue,
          );
      });
    });
  });
});
