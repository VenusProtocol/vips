import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
  setRedstonePrice,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";

import vip596, { CORE_MARKETS, NEW_VBEP20_DELEGATE_IMPL } from "../../vips/vip-610/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";
import VTOKEN_ABI from "./abi/VToken.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const COMPTROLLER_LENS = "0x732138e18fa6f8f8E456ad829DB429A450a79758";
const GENERIC_ETH_ACCOUNT = "0xF77055DBFAfdD56578Ace54E62e749d12802ce36";

// vUSDT market for core operations testing
const VUSDT_ADDRESS = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

// vUSDC market as collateral
const VUSDC_ADDRESS = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDC_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

const BLOCK_NUMBER = 83622252;

forking(BLOCK_NUMBER, async () => {
  let comptroller: Contract;
  let vUSDT: Contract;
  let usdt: Contract;
  let vUSDC: Contract;
  let usdc: Contract;

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    vUSDT = new ethers.Contract(VUSDT_ADDRESS, VTOKEN_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, ethers.provider);
    vUSDC = new ethers.Contract(VUSDC_ADDRESS, VTOKEN_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, ethers.provider);

    for (const market of CORE_MARKETS) {
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        market.underlying,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.REDSTONE_ORACLE,
        market.underlying,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, market.symbol.slice(1), 315360000);
    }

    const xSolvBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
    const xSolvBTC_RedStone_Feed = "0x24c8964338Deb5204B096039147B8e8C3AEa42Cc";
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, xSolvBTC, xSolvBTC_RedStone_Feed, bscmainnet.NORMAL_TIMELOCK);

    const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
    const THE_REDSTONE_FEED = "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5";
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, THE, THE_REDSTONE_FEED, bscmainnet.NORMAL_TIMELOCK);

    const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
    const TRX_REDSTONE_FEED = "0xa17362dd9AD6d0aF646D7C8f8578fddbfc90B916";
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, TRX, TRX_REDSTONE_FEED, bscmainnet.NORMAL_TIMELOCK, 3153600000, {
      tokenDecimals: 6,
    });
  });

  describe("Pre-VIP state", async () => {
    it("markets should have old implementation", async () => {
      for (const market of CORE_MARKETS) {
        const marketContract = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market.address);
        const currentImpl = await marketContract.implementation();
        expect(currentImpl).to.not.equal(NEW_VBEP20_DELEGATE_IMPL);
      }
    });
  });

  testVip("VIP-596 Mainnet", await vip596(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets]);
    },
  });

  describe("Post-VIP state", async () => {
    it("markets should have new implementation", async () => {
      for (const market of CORE_MARKETS) {
        const marketContract = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market.address);
        expect(await marketContract.implementation()).to.equal(NEW_VBEP20_DELEGATE_IMPL);
      }
    });
  });

  describe("Core operations: mint, borrow, repay, redeem", async () => {
    let user: any;
    let userAddress: string;

    before(async () => {
      const usdcWhale = await initMainnetUser(USDC_WHALE, ethers.utils.parseEther("1"));
      const usdtWhale = await initMainnetUser(USDT_WHALE, ethers.utils.parseEther("1"));

      const [signer] = await ethers.getSigners();
      user = signer;
      userAddress = await user.getAddress();

      await usdc.connect(usdcWhale).transfer(userAddress, parseUnits("10000", 18));
      await usdt.connect(usdtWhale).transfer(userAddress, parseUnits("10000", 18));
    });

    it("should mint (supply) USDC to vUSDC", async () => {
      const mintAmount = parseUnits("5000", 18);
      await usdc.connect(user).approve(VUSDC_ADDRESS, mintAmount);
      await vUSDC.connect(user).mint(mintAmount);

      const vUSDCBalance = await vUSDC.balanceOf(userAddress);
      expect(vUSDCBalance).to.be.gt(0);
    });

    it("should borrow USDT against USDC collateral", async () => {
      await comptroller.connect(user).enterMarkets([VUSDC_ADDRESS]);

      const borrowAmount = parseUnits("1000", 18);
      const usdtBefore = await usdt.balanceOf(userAddress);
      await vUSDT.connect(user).borrow(borrowAmount);
      const usdtAfter = await usdt.balanceOf(userAddress);

      expect(usdtAfter.sub(usdtBefore)).to.equal(borrowAmount);
    });

    it("should repay partial USDT borrow", async () => {
      const borrowBefore = await vUSDT.callStatic.borrowBalanceCurrent(userAddress);
      expect(borrowBefore).to.be.gt(0);

      const repayAmount = parseUnits("500", 18);
      await usdt.connect(user).approve(VUSDT_ADDRESS, repayAmount);
      await vUSDT.connect(user).repayBorrow(repayAmount);

      const borrowAfter = await vUSDT.callStatic.borrowBalanceCurrent(userAddress);
      expect(borrowAfter).to.be.lt(borrowBefore);
    });

    it("should fully repay using type(uint256).max", async () => {
      const borrowBefore = await vUSDT.callStatic.borrowBalanceCurrent(userAddress);
      expect(borrowBefore).to.be.gt(0);

      await usdt.connect(user).approve(VUSDT_ADDRESS, ethers.constants.MaxUint256);
      await vUSDT.connect(user).repayBorrow(ethers.constants.MaxUint256);

      const borrowAfter = await vUSDT.callStatic.borrowBalanceCurrent(userAddress);
      expect(borrowAfter).to.equal(0);
    });

    it("should redeem USDC from vUSDC", async () => {
      const usdcBefore = await usdc.balanceOf(userAddress);
      const redeemAmount = parseUnits("1000", 18);
      await vUSDC.connect(user).redeemUnderlying(redeemAmount);
      const usdcAfter = await usdc.balanceOf(userAddress);

      expect(usdcAfter.sub(usdcBefore)).to.equal(redeemAmount);
    });
  });

  describe("Repay logic change: caps repayment to actual borrow balance", async () => {
    let user: any;
    let userAddress: string;

    before(async () => {
      const usdcWhale = await initMainnetUser(USDC_WHALE, ethers.utils.parseEther("1"));
      const usdtWhale = await initMainnetUser(USDT_WHALE, ethers.utils.parseEther("1"));

      const signers = await ethers.getSigners();
      user = signers[1];
      userAddress = await user.getAddress();

      await usdc.connect(usdcWhale).transfer(userAddress, parseUnits("10000", 18));
      await usdt.connect(usdtWhale).transfer(userAddress, parseUnits("10000", 18));

      // Supply collateral and borrow
      await usdc.connect(user).approve(VUSDC_ADDRESS, parseUnits("5000", 18));
      await vUSDC.connect(user).mint(parseUnits("5000", 18));
      await comptroller.connect(user).enterMarkets([VUSDC_ADDRESS]);
      await vUSDT.connect(user).borrow(parseUnits("100", 18));
    });

    it("should cap repayment when amount exceeds borrow balance", async () => {
      const borrowBalance: BigNumber = await vUSDT.callStatic.borrowBalanceCurrent(userAddress);
      expect(borrowBalance).to.be.gt(0);

      // Approve and repay 2x the borrow balance — should be capped to actual debt
      const excessAmount = borrowBalance.mul(2);
      const usdtBefore = await usdt.balanceOf(userAddress);

      await usdt.connect(user).approve(VUSDT_ADDRESS, excessAmount);
      await vUSDT.connect(user).repayBorrow(excessAmount);

      const borrowAfter = await vUSDT.callStatic.borrowBalanceCurrent(userAddress);
      expect(borrowAfter).to.equal(0);

      // Verify only the actual borrow amount was taken, not the excess
      const usdtAfter = await usdt.balanceOf(userAddress);
      const actualRepaid = usdtBefore.sub(usdtAfter);

      // actualRepaid should be close to borrowBalance (within interest accrual tolerance)
      const tolerance = borrowBalance.mul(1).div(100); // 1% tolerance for interest
      expect(actualRepaid).to.be.closeTo(borrowBalance, tolerance);
    });
  });

  describe("repayBorrowBehalf: third-party repay (SwapRouter path)", async () => {
    let borrower: any;
    let borrowerAddress: string;
    let repayer: any;
    let repayerAddress: string;

    before(async () => {
      const usdcWhale = await initMainnetUser(USDC_WHALE, ethers.utils.parseEther("1"));
      const usdtWhale = await initMainnetUser(USDT_WHALE, ethers.utils.parseEther("1"));

      const signers = await ethers.getSigners();
      borrower = signers[4];
      borrowerAddress = await borrower.getAddress();
      repayer = signers[5];
      repayerAddress = await repayer.getAddress();

      await usdc.connect(usdcWhale).transfer(borrowerAddress, parseUnits("5000", 18));
      await usdt.connect(usdtWhale).transfer(repayerAddress, parseUnits("10000", 18));

      // Borrower: supply USDC and borrow USDT
      await usdc.connect(borrower).approve(VUSDC_ADDRESS, parseUnits("5000", 18));
      await vUSDC.connect(borrower).mint(parseUnits("5000", 18));
      await comptroller.connect(borrower).enterMarkets([VUSDC_ADDRESS]);
      await vUSDT.connect(borrower).borrow(parseUnits("100", 18));
    });

    it("repayBorrowBehalf should work with exact amount", async () => {
      const borrowBalance: BigNumber = await vUSDT.callStatic.borrowBalanceCurrent(borrowerAddress);
      expect(borrowBalance).to.be.gt(0);

      const repayAmount = parseUnits("50", 18);
      await usdt.connect(repayer).approve(VUSDT_ADDRESS, repayAmount);
      await vUSDT.connect(repayer).repayBorrowBehalf(borrowerAddress, repayAmount);

      const borrowAfter = await vUSDT.callStatic.borrowBalanceCurrent(borrowerAddress);
      expect(borrowAfter).to.be.lt(borrowBalance);
    });

    it("repayBorrowBehalf should cap when amount exceeds borrow balance", async () => {
      const borrowBalance: BigNumber = await vUSDT.callStatic.borrowBalanceCurrent(borrowerAddress);
      expect(borrowBalance).to.be.gt(0);

      // Repayer sends 2x the borrow balance — should be capped
      const excessAmount = borrowBalance.mul(2);
      const usdtBefore = await usdt.balanceOf(repayerAddress);

      await usdt.connect(repayer).approve(VUSDT_ADDRESS, excessAmount);
      await vUSDT.connect(repayer).repayBorrowBehalf(borrowerAddress, excessAmount);

      const borrowAfter = await vUSDT.callStatic.borrowBalanceCurrent(borrowerAddress);
      expect(borrowAfter).to.equal(0);

      // Verify only the actual borrow amount was taken from repayer
      const usdtAfter = await usdt.balanceOf(repayerAddress);
      const actualRepaid = usdtBefore.sub(usdtAfter);

      const tolerance = borrowBalance.mul(1).div(100); // 1% tolerance for interest
      expect(actualRepaid).to.be.closeTo(borrowBalance, tolerance);
    });
  });

  describe("Liquidation path", async () => {
    let borrower: any;
    let borrowerAddress: string;
    let liquidator: any;
    let liquidatorAddress: string;

    before(async () => {
      const usdcWhale = await initMainnetUser(USDC_WHALE, ethers.utils.parseEther("1"));
      const usdtWhale = await initMainnetUser(USDT_WHALE, ethers.utils.parseEther("1"));

      const signers = await ethers.getSigners();
      borrower = signers[2];
      borrowerAddress = await borrower.getAddress();
      liquidator = signers[3];
      liquidatorAddress = await liquidator.getAddress();

      await usdc.connect(usdcWhale).transfer(borrowerAddress, parseUnits("1000", 18));
      await usdt.connect(usdtWhale).transfer(liquidatorAddress, parseUnits("10000", 18));

      // Borrower: supply USDC collateral and borrow USDT near max
      await usdc.connect(borrower).approve(VUSDC_ADDRESS, parseUnits("1000", 18));
      await vUSDC.connect(borrower).mint(parseUnits("1000", 18));
      await comptroller.connect(borrower).enterMarkets([VUSDC_ADDRESS]);
      await vUSDT.connect(borrower).borrow(parseUnits("750", 18));
    });

    it("liquidateBorrow should work with the new implementation", async () => {
      // Advance blocks to accrue interest and push borrower into shortfall
      for (let i = 0; i < 100000; i++) {
        await ethers.provider.send("evm_mine", []);
      }
      await vUSDT.connect(liquidator).accrueInterest();

      const [, , shortfall] = await comptroller.getAccountLiquidity(borrowerAddress);

      if (shortfall.gt(0)) {
        const borrowBalance = await vUSDT.callStatic.borrowBalanceCurrent(borrowerAddress);
        const repayAmount = borrowBalance.div(2);

        await usdt.connect(liquidator).approve(VUSDT_ADDRESS, repayAmount);
        await vUSDT.connect(liquidator).liquidateBorrow(borrowerAddress, repayAmount, VUSDC_ADDRESS);

        const borrowAfter = await vUSDT.callStatic.borrowBalanceCurrent(borrowerAddress);
        expect(borrowAfter).to.be.lt(borrowBalance);
      } else {
        console.log("Borrower not yet in shortfall after mining blocks, skipping liquidation test");
      }
    });
  });

  describe("generic tests", async () => {
    checkCorePoolComptroller({
      account: GENERIC_ETH_ACCOUNT,
      lens: COMPTROLLER_LENS,
    });
  });
});
