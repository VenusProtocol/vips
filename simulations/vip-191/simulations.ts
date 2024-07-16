import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser, setMaxStaleCoreAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { vip191 } from "../../vips/vip-191";
import BUSD_LIQUIDATOR_ABI from "./abi/BUSDLiquidator.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import VTOKEN_CORE_ABI from "./abi/VToken_core.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const BUSD_LIQUIDATOR = "0x3f033c0827acb54a791EaaaE90d820f223Acf8e3";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

enum Actions {
  MINT = 0,
  REDEEM = 1,
  BORROW = 2,
  REPAY = 3,
  SEIZE = 4,
  LIQUIDATE = 5,
  TRANSFER = 6,
  ENTER_MARKET = 7,
  EXIT_MARKET = 8,
}

forking(32738700, async () => {
  let busdLiquidator: Contract;
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    busdLiquidator = await ethers.getContractAt(BUSD_LIQUIDATOR_ABI, BUSD_LIQUIDATOR);
    await setMaxStaleCoreAssets(CHAINLINK_ORACLE, TIMELOCK);
  });

  describe("Pre-VIP behavior", () => {
    describe("BUSD Liquidator", () => {
      it("should have owner = 0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D", async () => {
        expect(await busdLiquidator.owner()).to.equal("0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D");
      });
    });
  });

  testVip("VIP-191 BUSD Liquidator", await vip191(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_CORE_ABI], ["NewMarketInterestRateModel", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("BUSD Liquidator", () => {
      it("should have owner = Timelock", async () => {
        expect(await busdLiquidator.owner()).to.equal(TIMELOCK);
      });

      it("should have liquidatorShareMantissa = 101%", async () => {
        expect(await busdLiquidator.liquidatorShareMantissa()).to.equal(parseUnits("1.01", 18));
      });
    });

    describe("vBUSD", () => {
      it("should have a zero interest rate model", async () => {
        await checkInterestRate(VBUSD, "vBUSD", { base: "0", multiplier: "0" });
      });

      it("should have minting paused", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.MINT)).to.equal(true);
      });

      it("should have redemptions enabled", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.REDEEM)).to.equal(false);
      });

      it("should have borrows paused", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.BORROW)).to.equal(true);
      });

      it("should have repayments enabled", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.REPAY)).to.equal(false);
      });

      it("should have seizing enabled", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.SEIZE)).to.equal(false);
      });

      it("should have liquidations paused", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.LIQUIDATE)).to.equal(true);
      });

      it("should have transferring enabled", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.TRANSFER)).to.equal(false);
      });

      it("should have collateralizing paused", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.ENTER_MARKET)).to.equal(true);
      });

      it("should allow to exit market", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.EXIT_MARKET)).to.equal(false);
      });
    });

    describe("BUSD liquidation", async () => {
      const borrower = "0x3DfF5d227b187086A44465FF1963917d84Da8b1c";
      const busdHolderAddress = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
      let busdHolder: SignerWithAddress;
      let busd: Contract;
      let btc: Contract;
      let vBUSD: Contract;
      let vBTC: Contract;

      before(async () => {
        busd = await ethers.getContractAt(ERC20_ABI, BUSD);
        btc = await ethers.getContractAt(ERC20_ABI, BTC);
        busdHolder = await initMainnetUser(busdHolderAddress, parseEther("1"));
        vBUSD = await ethers.getContractAt(VTOKEN_CORE_ABI, VBUSD);
        vBTC = await ethers.getContractAt(VTOKEN_CORE_ABI, VBTC);
        await busd.connect(busdHolder).approve(busdLiquidator.address, ethers.constants.MaxUint256);
      });

      it("should liquidate the entire borrow", async () => {
        await busdLiquidator.connect(busdHolder).liquidateEntireBorrow(borrower, VBTC);
        expect(await vBUSD.borrowBalanceStored(borrower)).to.equal(0);
      });

      it("should transfer 101% of the borrow in seized vTokens to the liquidator", async () => {
        expect(await busd.balanceOf(busdHolder.address)).to.not.equal(0);
        const tx = await vBTC.connect(busdHolder).redeem(await vBTC.balanceOf(busdHolder.address));
        await expect(tx).to.changeTokenBalance(btc, busdHolder, parseUnits("3.066387722497615441", 18));
      });

      it("should set liquidations back to paused state", async () => {
        expect(await comptroller.actionPaused(VBUSD, Actions.LIQUIDATE)).to.equal(true);
      });
    });
  });
});
