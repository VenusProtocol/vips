import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  Actions,
  Comptroller_Ethena,
  Comptroller_LiquidStakedETH,
  PT_weETH_26DEC2024_LiquidStakedETH,
  Pendle_Router,
  Timelock_Ethereum,
  VToken_vPT_USDe_27MAR2025_Ethena,
  VToken_vPT_sUSDE_27MAR2025_Ethena,
  VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
  VToken_vUSDC_Ethena,
  VToken_vsUSDe_Ethena,
  VTreasury_Ethereum,
  vip491,
  weETH_Address,
} from "../../vips/vip-491/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vtoken.json";

const provider = ethers.provider;

forking(22380370, async () => {
  let comptrollerEthena: Contract;
  let comptrollerLSETH: Contract;
  let vPtTokenWeETH: Contract;
  let ptTokenWeETH: Contract;
  let weETH: Contract;
  let weEthBefore: BigNumber;

  before(async () => {
    comptrollerEthena = new ethers.Contract(Comptroller_Ethena, COMPTROLLER_ABI, provider);
    comptrollerLSETH = new ethers.Contract(Comptroller_LiquidStakedETH, COMPTROLLER_ABI, provider);
    vPtTokenWeETH = new ethers.Contract(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, VTOKEN_ABI, provider);
    ptTokenWeETH = new ethers.Contract(PT_weETH_26DEC2024_LiquidStakedETH, ERC20_ABI, provider);

    weETH = new ethers.Contract(weETH_Address, ERC20_ABI, provider);
    weEthBefore = await weETH.balanceOf(VTreasury_Ethereum);
  });

  describe("Pre-VIP behavior", async () => {
    describe("Ethena Markets", () => {
      it("Check PT_USDe market CF is not zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vPT_USDe_27MAR2025_Ethena);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check PT_USDE market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_USDe_27MAR2025_Ethena, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check PT_USDE enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_USDe_27MAR2025_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.false;
      });

      it("Check PT_sUSDE market CF is not zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vPT_sUSDE_27MAR2025_Ethena);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check PT_sUSDE market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_sUSDE_27MAR2025_Ethena, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check PT_sUSDE enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_sUSDE_27MAR2025_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.false;
      });

      it("Check sUSDE market CF is not zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vsUSDe_Ethena);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check sUSDE market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vsUSDe_Ethena, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check sUSDE enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vsUSDe_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.false;
      });

      it("Check USDC market CF is not zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vUSDC_Ethena);
        expect(market.collateralFactorMantissa).equal(0);
      });

      it("Check USDC market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vUSDC_Ethena, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check USDC enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vUSDC_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.false;
      });
    });

    describe("Liquid Staked ETH Market", () => {
      it("Check weETH market CF is not zero", async () => {
        const market = await comptrollerLSETH.markets(VToken_vPT_weETH_26DEC2024_LiquidStakedETH);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check weth market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check weth enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(
          VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
          Actions.ENTER_MARKET,
        ); // Enter market action
        expect(isPaused).to.be.false;
      });

      it("Check PT token approval is zero", async () => {
        const allowance = await ptTokenWeETH.allowance(Timelock_Ethereum, Pendle_Router);
        expect(allowance).to.equal(0);
      });

      it("Check treasury vToken balance", async () => {
        const balance = await vPtTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(balance).to.be.gt(0);
      });
    });
  });

  testForkedNetworkVipCommands("VIP-491", await vip491(), {});

  describe("Post-VIP behavior", async () => {
    describe("Ethena Markets", () => {
      it("Check PT_USDe market CF is zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vPT_USDe_27MAR2025_Ethena);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check PT_USDe market mint is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_USDe_27MAR2025_Ethena, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check PT_USDe enter market action is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_USDe_27MAR2025_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.true;
      });

      it("Check PT_sUSDE market CF is zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vPT_sUSDE_27MAR2025_Ethena);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check PT_sUSDE market mint is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_sUSDE_27MAR2025_Ethena, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check PT_sUSDE enter market action is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_sUSDE_27MAR2025_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.true;
      });

      it("Check sUSDE market CF is zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vsUSDe_Ethena);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check sUSDE market mint is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vsUSDe_Ethena, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check sUSDE enter market action is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vsUSDe_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.true;
      });

      it("Check USDC market CF is zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vUSDC_Ethena);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check USDC market mint is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vUSDC_Ethena, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check USDC enter market action is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vUSDC_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.true;
      });
    });

    describe("Liquid Staked ETH Market", () => {
      it("Check weETH market CF is zero", async () => {
        const market = await comptrollerLSETH.markets(VToken_vPT_weETH_26DEC2024_LiquidStakedETH);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check weETH market mint is paused", async () => {
        const isPaused = await comptrollerLSETH.actionPaused(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check weETH enter market action is paused", async () => {
        const isPaused = await comptrollerLSETH.actionPaused(
          VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
          Actions.ENTER_MARKET,
        ); // Enter market action
        expect(isPaused).to.be.true;
      });

      it("Check treasury holds no vPT tokens after redemption", async () => {
        const vptBalance = await vPtTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(vptBalance).to.equal(0);
      });

      it("Verify Pendle redemption occurred", async () => {
        const treasuryBalance = await ptTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(treasuryBalance).to.equal(0);
      });

      it("Verify treasury received weEth after Pendle redemption", async () => {
        const weEthAfter = await weETH.balanceOf(VTreasury_Ethereum);
        expect(weEthAfter).to.be.gt(weEthBefore);
      });
    });
  });
});
