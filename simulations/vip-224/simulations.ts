import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import { vip224 } from "../../vips/vip-224";
import IERC20_UPGRADABLE_ABI from "./abi/IERC20UpgradableAbi.json";
import VBEP20_DELEGATE_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOVE_DEBT_DELEGATE_ABI from "./abi/moveDebtDelegate.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";
const BUSD_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const BNB_CHAIN_RECEIVER = "0x6657911F7411765979Da0794840D671Be55bA273";

const EXPECTED_RESERVES_TRANSFER = parseUnits("2373087.553409498607767042", 18);
const EXPECTED_LIQUIDATION_REVENUE_VTOKENS = parseUnits("6944693.44741659", 8);

forking(34703300, () => {
  let comptroller: Contract;
  let busd: Contract;
  let vBUSD: Contract;
  let moveDebtDelegate: Contract;
  let oracle: Contract;
  let busdHolder: SignerWithAddress;
  let bnbChainWalletBalanceBefore: BigNumber;
  let vBUSDBalanceBefore: BigNumber;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    vBUSD = new ethers.Contract(VBUSD, VBEP20_DELEGATE_ABI, provider);
    busd = new ethers.Contract(await vBUSD.underlying(), IERC20_UPGRADABLE_ABI, provider);
    const oracleAddress = await comptroller.oracle();
    oracle = new ethers.Contract(oracleAddress, PRICE_ORACLE_ABI, provider);
    moveDebtDelegate = new ethers.Contract(MOVE_DEBT_DELEGATE, MOVE_DEBT_DELEGATE_ABI, provider);
    busdHolder = await initMainnetUser(BUSD_HOLDER, parseEther("1"));

    bnbChainWalletBalanceBefore = await busd.balanceOf(BNB_CHAIN_RECEIVER);
    vBUSDBalanceBefore = await busd.balanceOf(VBUSD);
  });

  testVip("VIP-224", vip224());

  describe(`Moving debt from BUSD`, () => {
    const borrowerAddress = "0x8d655AAAA0ec224b17972df385e25325b9103332";
    const repayAmount = parseUnits("1", 18);

    it(`disables moving debt to USDC`, async () => {
      expect(await moveDebtDelegate.borrowAllowed(VUSDC)).to.be.false;
    });

    it(`disables moving debt to USDC`, async () => {
      expect(await moveDebtDelegate.borrowAllowed(VUSDT)).to.be.false;
    });

    it(`fails to move debt to USDC`, async () => {
      await expect(
        moveDebtDelegate.connect(busdHolder).moveDebt(borrowerAddress, repayAmount, VUSDC),
      ).to.be.revertedWithCustomError(moveDebtDelegate, "BorrowNotAllowed");
    });

    it(`fails to move debt to USDT`, async () => {
      await expect(
        moveDebtDelegate.connect(busdHolder).moveDebt(borrowerAddress, repayAmount, VUSDT),
      ).to.be.revertedWithCustomError(moveDebtDelegate, "BorrowNotAllowed");
    });
  });

  describe("Oracle price", () => {
    it("sets BUSD price to fixed $1", async () => {
      expect(await oracle.getPrice(busd.address)).to.equal(parseUnits("1", 18));
    });

    it("sets vBUSD underlying price to fixed $1", async () => {
      expect(await oracle.getUnderlyingPrice(VBUSD)).to.equal(parseUnits("1", 18));
    });
  });

  describe("Reserves & liquidation revenue withdrawal", () => {
    let expectedBUSDTransfer: BigNumber;

    before(async () => {
      const rate = await vBUSD.callStatic.exchangeRateCurrent();
      const expectedLiquidationRevenue = EXPECTED_LIQUIDATION_REVENUE_VTOKENS.mul(rate).div(parseUnits("1", 18));
      expectedBUSDTransfer = expectedLiquidationRevenue.add(EXPECTED_RESERVES_TRANSFER);
    });

    it("leaves no reserves on vBUSD", async () => {
      expect(await vBUSD.totalReserves()).to.equal(0);
    });

    it("leaves no vBUSD in treasury", async () => {
      expect(await vBUSD.balanceOf(TREASURY)).to.equal(0);
    });

    it("leaves no vBUSD in the timelock", async () => {
      expect(await vBUSD.balanceOf(NORMAL_TIMELOCK)).to.equal(0);
    });

    it("leaves no BUSD in the timelock", async () => {
      expect(await busd.balanceOf(NORMAL_TIMELOCK)).to.equal(0);
    });

    it(`transfers reserves and liquidation revenue from vBUSD`, async () => {
      const vBUSDBalanceAfter = await busd.balanceOf(VBUSD);
      expect(vBUSDBalanceBefore.sub(vBUSDBalanceAfter)).to.equal(expectedBUSDTransfer);
    });

    it(`transfers reserves and liquidation revenue to BNB chain`, async () => {
      const bnbChainWalletBalanceAfter = await busd.balanceOf(BNB_CHAIN_RECEIVER);
      expect(bnbChainWalletBalanceAfter.sub(bnbChainWalletBalanceBefore)).to.equal(expectedBUSDTransfer);
    });
  });
});
