import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip99 } from "../../vips/vip-99";
import IERC20_UPGRADABLE_ABI from "./abi/IERC20UpgradableAbi.json";
import VBEP20_DELEGATE_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/priceOracleAbi.json";
import SWAP_DEBT_DELEGATE_ABI from "./abi/swapDebtDelegate.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const BNB_BRIDGE_EXPLOITER = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const NEW_COMPTROLLER_IMPL = "0x909dd16b24CEf96c7be13065a9a0EAF8A126FFa5";
const NEW_VTOKEN_IMPL = "0x10FB44C481F87cb4F3ce8DE11fFd16e00EC5B670";
const SWAP_DEBT_DELEGATE = "0x2B16DB59c6f20672C0DB46b80361E9Ca1CD8a43a";
const BINANCE_MULTISIG = "0x6d46692f809d485A033dA95B19b556E3Ff0ACb12";

forking(25918391, () => {
  testVip("VIP-99 Delegate borrowing", vip99(), {
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
  });
});

// Ressetting the fork to prevent oracle prices from getting stale
forking(25918391, () => {
  let comptroller: ethers.Contract;
  let busd: ethers.Contract;
  let usdt: ethers.Contract;
  let btc: ethers.Contract;
  let vBUSD: ethers.Contract;
  let vUSDC: ethers.Contract;
  let vUSDT: ethers.Contract;
  let vBTC: ethers.Contract;
  let vETH: ethers.Contract;
  let swapDebtDelegate: ethers.Contract;
  let oracle: ethers.Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    [vBUSD, vUSDC, vUSDT, vBTC, vETH] = await Promise.all(
      [VBUSD, VUSDC, VUSDT, VBTC, VETH].map((address: string) => {
        return new ethers.Contract(address, VBEP20_DELEGATE_ABI, provider);
      }),
    );
    [busd, , usdt, btc] = await Promise.all(
      [vBUSD, vUSDC, vUSDT, vBTC, vETH].map(async (vToken: ethers.Contract) => {
        const underlying = await vToken.underlying();
        return new ethers.Contract(underlying, IERC20_UPGRADABLE_ABI, provider);
      }),
    );
    const oracleAddress = await comptroller.oracle();
    oracle = new ethers.Contract(oracleAddress, PRICE_ORACLE_ABI, provider);
    swapDebtDelegate = new ethers.Contract(SWAP_DEBT_DELEGATE, SWAP_DEBT_DELEGATE_ABI, provider);
    await pretendExecutingVip(vip99());
  });

  describe("Post-VIP contracts status", async () => {
    it("updates vBUSD, vUSDC, vUSDT, vBTC, vETH implementation to the new version", async () => {
      for (const vToken of [vBUSD, vUSDC, vUSDT, vBTC, vETH]) {
        expect(await vToken.implementation()).to.equal(NEW_VTOKEN_IMPL);
      }
    });

    it("sets Comptroller implementation to the new version", async () => {
      expect(await comptroller.comptrollerImplementation()).to.equal(NEW_COMPTROLLER_IMPL);
    });

    it("sets the delegate for BNB bridge exploiter", async () => {
      expect(await comptroller.approvedDelegates(BNB_BRIDGE_EXPLOITER, SWAP_DEBT_DELEGATE)).to.equal(true);
    });
  });

  describe("BNB bridge exploiter debt swap", async () => {
    let binanceMultisig: SignerWithAddress;
    let repayAmount: BigNumber;

    before(async () => {
      binanceMultisig = await initMainnetUser(BINANCE_MULTISIG, parseEther("1"));
      await swapDebtDelegate.connect(binanceMultisig).acceptOwnership();
    });

    beforeEach(async () => {
      const busdHolder = await initMainnetUser(BNB_BRIDGE_EXPLOITER, parseEther("1"));
      repayAmount = parseUnits("1000000", 18); // one million BUSD
      await busd.connect(busdHolder).transfer(BINANCE_MULTISIG, repayAmount);
      await busd.connect(binanceMultisig).approve(swapDebtDelegate.address, repayAmount);
    });

    it("swaps BUSD debt to USDT debt", async () => {
      const tx = await swapDebtDelegate
        .connect(binanceMultisig)
        .swapDebt(BNB_BRIDGE_EXPLOITER, vBUSD.address, vUSDT.address, repayAmount);
      const busdPrice = await oracle.getUnderlyingPrice(VBUSD);
      const usdtPrice = await oracle.getUnderlyingPrice(VUSDT);
      const borrowedAmount = repayAmount.mul(busdPrice).div(usdtPrice);
      expect(borrowedAmount).to.equal(parseUnits("999880.752177709989496153", 18));
      await expect(tx).to.emit(vBUSD, "RepayBorrow").withArgs(
        SWAP_DEBT_DELEGATE, // payer
        BNB_BRIDGE_EXPLOITER, // borrower
        repayAmount,
        parseUnits("62570837.271361800039742166", 18),
        parseUnits("118656538.075710219424628656", 18),
      );

      await expect(tx).to.emit(vUSDT, "Borrow").withArgs(
        BNB_BRIDGE_EXPLOITER, // borrower
        borrowedAmount,
        parseUnits("51791626.908005102781624591", 18), // account's borrows
        parseUnits("146773356.517479562888182714", 18), // total market borrows
      );

      expect(await busd.balanceOf(BINANCE_MULTISIG)).to.equal(0);
      expect(await usdt.balanceOf(BINANCE_MULTISIG)).to.equal(parseUnits("999880.752177709989496153"));
    });

    it("swaps BUSD debt to BTC debt", async () => {
      const tx = await swapDebtDelegate
        .connect(binanceMultisig)
        .swapDebt(BNB_BRIDGE_EXPLOITER, vBUSD.address, vBTC.address, repayAmount);
      const busdPrice = await oracle.getUnderlyingPrice(VBUSD);
      const btcPrice = await oracle.getUnderlyingPrice(VBTC);
      const borrowedAmount = repayAmount.mul(busdPrice).div(btcPrice);
      expect(borrowedAmount).to.equal(parseUnits("41.467723055552676044", 18));
      await expect(tx).to.emit(vBUSD, "RepayBorrow").withArgs(
        SWAP_DEBT_DELEGATE, // payer
        BNB_BRIDGE_EXPLOITER, // borrower
        repayAmount,
        parseUnits("61570838.645557291459272559", 18), // account's borrows
        parseUnits("117656540.681673105060252768", 18), // total market borrows
      );

      await expect(tx).to.emit(vBTC, "Borrow").withArgs(
        BNB_BRIDGE_EXPLOITER, // borrower
        borrowedAmount,
        borrowedAmount, // there were no Bitcoin borrows before
        parseUnits("2115.100441504922154141", 18), // total market borrows
      );

      expect(await busd.balanceOf(BINANCE_MULTISIG)).to.equal(0);
      expect(await btc.balanceOf(BINANCE_MULTISIG)).to.equal(parseUnits("41.467723055552676044"));
    });
  });
});
