import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip526, {
  Actions,
  Comptroller_LiquidStakedETH,
  PT_weETH_26DEC2024_LiquidStakedETH,
  PT_weETH_26DEC2024_expected,
  Timelock_Ethereum,
  VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
  VTreasury_Ethereum,
} from "../../vips/vip-526/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vtoken.json";
import VTREASURY_ABI from "./abi/vtreasury.json";

const provider = ethers.provider;
const VTREASURY_BALANCE_vPtTokenWeETH = parseUnits("1.79961879", 8);

forking(22815830, async () => {
  let comptrollerLSETH: Contract;
  let vPtTokenWeETH: Contract;
  let ptTokenWeETH: Contract;

  before(async () => {
    comptrollerLSETH = new ethers.Contract(Comptroller_LiquidStakedETH, COMPTROLLER_ABI, provider);
    vPtTokenWeETH = new ethers.Contract(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, VTOKEN_ABI, provider);
    ptTokenWeETH = new ethers.Contract(PT_weETH_26DEC2024_LiquidStakedETH, ERC20_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    describe("Liquid Staked ETH Market", () => {
      it("Check weETH market CF is not zero", async () => {
        const market = await comptrollerLSETH.markets(VToken_vPT_weETH_26DEC2024_LiquidStakedETH);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check weth market actions are not paused", async () => {
        for (const [actionName, actionId] of Object.entries(Actions)) {
          if (actionId !== 2) {
            const isPaused = await comptrollerLSETH.actionPaused(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, actionId);
            expect(isPaused, `${actionName} should be paused`).to.be.false;
          }
        }
      });

      it("Check treasury vToken balance", async () => {
        const balance = await vPtTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(balance).to.equal(VTREASURY_BALANCE_vPtTokenWeETH);
      });
    });
  });

  testForkedNetworkVipCommands("VIP-526 ethereum", await vip526(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, VTREASURY_ABI],
        [
          "ActionPausedMarket",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "WithdrawTreasuryToken",
          "Redeem",
          "NewBorrowCap",
          "NewBorrowCap",
          "MarketUnlisted",
          "Transfer",
        ],
        [8, 1, 1, 1, 1, 1, 1, 1, 4],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("Liquid Staked ETH Market", () => {
      it("Check PT_weETH_26DEC2024 market CF and LT is zero", async () => {
        const market = await comptrollerLSETH.markets(VToken_vPT_weETH_26DEC2024_LiquidStakedETH);
        expect(market.collateralFactorMantissa).to.equal(0);
        expect(market.liquidationThresholdMantissa).to.equal(0);
      });

      it("Check PT_weETH_26DEC2024 market actions are paused", async () => {
        for (const [actionName, actionId] of Object.entries(Actions)) {
          const isPaused = await comptrollerLSETH.actionPaused(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, actionId);
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        }
      });

      it("Check treasury holds no vPT tokens after redemption", async () => {
        const vptBalance = await vPtTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(vptBalance).to.equal(0);
      });

      it("Check Normal Timelock holds no vPT tokens after redeem", async () => {
        const vptBalance = await vPtTokenWeETH.balanceOf(Timelock_Ethereum);
        expect(vptBalance).to.equal(0);
      });

      it("Check Normal Timelock holds no PT tokens after redeem", async () => {
        const treasuryBalance = await ptTokenWeETH.balanceOf(Timelock_Ethereum);
        expect(treasuryBalance).to.equal(0);
      });

      it("Verify treasury received weETH", async () => {
        const treasuryBalance = await ptTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(treasuryBalance).to.equal(PT_weETH_26DEC2024_expected);
      });
    });
  });
});
