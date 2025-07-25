import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip529, {
  Actions,
  ETHENA_POOL_COMPTROLLER_ETH,
  LIQUID_STAKED_COMPTROLLER_ETH,
  vPT_USDe_27MAR2025_Ethena,
  vPT_sUSDE_27MAR2025_Ethena,
  vUSDC_Ethena,
  vrsETH_LiquidStakedETH,
  vsUSDe_Ethena,
} from "../../vips/vip-530/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(22912233, async () => {
  const ethenaPoolComptroller = new ethers.Contract(ETHENA_POOL_COMPTROLLER_ETH, COMPTROLLER_ABI, ethers.provider);
  const liquidStakedComptroller = new ethers.Contract(LIQUID_STAKED_COMPTROLLER_ETH, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("Check vUSDC_Ethena market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await ethenaPoolComptroller.actionPaused(vUSDC_Ethena, actionId);
        if (actionId === 0 || actionId === 2 || actionId === 7) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should be paused`).to.be.false;
        }
      }
    });

    it("Check vUSDC_Ethena market CF is zero", async () => {
      const market = await ethenaPoolComptroller.markets(vUSDC_Ethena);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vUSDC_Ethena", async () => {
      const borrowCap = await ethenaPoolComptroller.borrowCaps(vUSDC_Ethena);
      const supplyCap = await ethenaPoolComptroller.supplyCaps(vUSDC_Ethena);
      expect(borrowCap).to.be.not.equal(0);
      expect(supplyCap).to.be.not.equal(0);
    });

    it("Check vUSDC_Ethena market is listed", async () => {
      const market = await ethenaPoolComptroller.markets(vUSDC_Ethena);
      expect(market.isListed).to.be.true;
    });

    it("Check vsUSDe_Ethena market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await ethenaPoolComptroller.actionPaused(vsUSDe_Ethena, actionId);
        if (actionId === 0 || actionId === 2 || actionId === 7) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should be paused`).to.be.false;
        }
      }
    });

    it("Check vsUSDe_Ethena market CF is zero", async () => {
      const market = await ethenaPoolComptroller.markets(vsUSDe_Ethena);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vsUSDe_Ethena", async () => {
      const borrowCap = await ethenaPoolComptroller.borrowCaps(vsUSDe_Ethena);
      const supplyCap = await ethenaPoolComptroller.supplyCaps(vsUSDe_Ethena);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.not.equal(0);
    });

    it("Check vsUSDe_Ethena market is listed", async () => {
      const market = await ethenaPoolComptroller.markets(vsUSDe_Ethena);
      expect(market.isListed).to.be.true;
    });

    it("Check vPT_USDe_27MAR2025_Ethena market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await ethenaPoolComptroller.actionPaused(vPT_USDe_27MAR2025_Ethena, actionId);
        if (actionId === 0 || actionId === 2 || actionId === 7) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should be paused`).to.be.false;
        }
      }
    });

    it("Check vPT_USDe_27MAR2025_Ethena market CF is zero", async () => {
      const market = await ethenaPoolComptroller.markets(vPT_USDe_27MAR2025_Ethena);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vPT_USDe_27MAR2025_Ethena", async () => {
      const borrowCap = await ethenaPoolComptroller.borrowCaps(vPT_USDe_27MAR2025_Ethena);
      const supplyCap = await ethenaPoolComptroller.supplyCaps(vPT_USDe_27MAR2025_Ethena);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.not.equal(0);
    });

    it("Check vPT_USDe_27MAR2025_Ethena is listed", async () => {
      const market = await ethenaPoolComptroller.markets(vPT_USDe_27MAR2025_Ethena);
      expect(market.isListed).to.be.true;
    });

    it("Check vPT_sUSDE_27MAR2025_Ethena market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await ethenaPoolComptroller.actionPaused(vPT_sUSDE_27MAR2025_Ethena, actionId);
        if (actionId === 0 || actionId === 2 || actionId === 7) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should be paused`).to.be.false;
        }
      }
    });

    it("Check vPT_sUSDE_27MAR2025_Ethena market CF is zero", async () => {
      const market = await ethenaPoolComptroller.markets(vPT_sUSDE_27MAR2025_Ethena);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vPT_sUSDE_27MAR2025_Ethena", async () => {
      const borrowCap = await ethenaPoolComptroller.borrowCaps(vPT_sUSDE_27MAR2025_Ethena);
      const supplyCap = await ethenaPoolComptroller.supplyCaps(vPT_sUSDE_27MAR2025_Ethena);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.not.equal(0);
    });

    it("Check vPT_sUSDE_27MAR2025_Ethena is listed", async () => {
      const market = await ethenaPoolComptroller.markets(vPT_sUSDE_27MAR2025_Ethena);
      expect(market.isListed).to.be.true;
    });

    it("Check vrsETH_LiquidStakedETH market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await liquidStakedComptroller.actionPaused(vrsETH_LiquidStakedETH, actionId);
        if (actionId === 0 || actionId === 2 || actionId === 7) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should be paused`).to.be.false;
        }
      }
    });

    it("Check vrsETH_LiquidStakedETH market CF is not zero", async () => {
      const market = await liquidStakedComptroller.markets(vrsETH_LiquidStakedETH);
      expect(market.collateralFactorMantissa).to.be.not.equal(0);
    });

    it("check borrow and supply caps for vrsETH_LiquidStakedETH", async () => {
      const borrowCap = await liquidStakedComptroller.borrowCaps(vrsETH_LiquidStakedETH);
      const supplyCap = await liquidStakedComptroller.supplyCaps(vrsETH_LiquidStakedETH);
      expect(borrowCap).to.be.not.equal(0);
      expect(supplyCap).to.be.not.equal(0);
    });

    it("Check vrsETH_LiquidStakedETH is listed", async () => {
      const market = await liquidStakedComptroller.markets(vrsETH_LiquidStakedETH);
      expect(market.isListed).to.be.true;
    });
  });

  testForkedNetworkVipCommands("VIP 529", await vip529(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "NewSupplyCap",
          "NewBorrowCap",
          "MarketUnlisted",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "ActionPausedMarket",
        ],
        [5, 2, 5, 1, 1, 32],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Check vvUSDC_Ethena market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await ethenaPoolComptroller.actionPaused(vUSDC_Ethena, actionId);
        expect(isPaused, `${actionName} should be paused`).to.be.true;
      }
    });

    it("Check vUSDC_Ethena market CF is zero", async () => {
      const market = await ethenaPoolComptroller.markets(vUSDC_Ethena);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vUSDC_Ethena", async () => {
      const borrowCap = await ethenaPoolComptroller.borrowCaps(vUSDC_Ethena);
      const supplyCap = await ethenaPoolComptroller.supplyCaps(vUSDC_Ethena);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.equal(0);
    });

    it("Check vUSDC_Ethena market is listed", async () => {
      const market = await ethenaPoolComptroller.markets(vUSDC_Ethena);
      expect(market.isListed).to.be.false;
    });

    it("Check vsUSDe_Ethena market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await ethenaPoolComptroller.actionPaused(vsUSDe_Ethena, actionId);
        expect(isPaused, `${actionName} should be paused`).to.be.true;
      }
    });

    it("Check vsUSDe_Ethena market CF is zero", async () => {
      const market = await ethenaPoolComptroller.markets(vsUSDe_Ethena);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vsUSDe_Ethena", async () => {
      const borrowCap = await ethenaPoolComptroller.borrowCaps(vsUSDe_Ethena);
      const supplyCap = await ethenaPoolComptroller.supplyCaps(vsUSDe_Ethena);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.equal(0);
    });

    it("Check vsUSDe_Ethena market is listed", async () => {
      const market = await ethenaPoolComptroller.markets(vsUSDe_Ethena);
      expect(market.isListed).to.be.false;
    });

    it("Check vPT_USDe_27MAR2025_Ethena market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await ethenaPoolComptroller.actionPaused(vPT_USDe_27MAR2025_Ethena, actionId);
        expect(isPaused, `${actionName} should be paused`).to.be.true;
      }
    });

    it("Check vPT_USDe_27MAR2025_Ethena market CF is zero", async () => {
      const market = await ethenaPoolComptroller.markets(vPT_USDe_27MAR2025_Ethena);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vPT_USDe_27MAR2025_Ethena", async () => {
      const borrowCap = await ethenaPoolComptroller.borrowCaps(vPT_USDe_27MAR2025_Ethena);
      const supplyCap = await ethenaPoolComptroller.supplyCaps(vPT_USDe_27MAR2025_Ethena);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.equal(0);
    });

    it("Check vPT_USDe_27MAR2025_Ethena market is listed", async () => {
      const market = await ethenaPoolComptroller.markets(vPT_USDe_27MAR2025_Ethena);
      expect(market.isListed).to.be.false;
    });

    it("Check vPT_sUSDE_27MAR2025_Ethena market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await ethenaPoolComptroller.actionPaused(vPT_sUSDE_27MAR2025_Ethena, actionId);
        expect(isPaused, `${actionName} should be paused`).to.be.true;
      }
    });

    it("Check vPT_sUSDE_27MAR2025_Ethena market CF is zero", async () => {
      const market = await ethenaPoolComptroller.markets(vPT_sUSDE_27MAR2025_Ethena);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vPT_sUSDE_27MAR2025_Ethena", async () => {
      const borrowCap = await ethenaPoolComptroller.borrowCaps(vPT_sUSDE_27MAR2025_Ethena);
      const supplyCap = await ethenaPoolComptroller.supplyCaps(vPT_sUSDE_27MAR2025_Ethena);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.equal(0);
    });

    it("Check vPT_sUSDE_27MAR2025_Ethena market is listed", async () => {
      const market = await ethenaPoolComptroller.markets(vPT_sUSDE_27MAR2025_Ethena);
      expect(market.isListed).to.be.false;
    });

    it("Check vrsETH_LiquidStakedETH market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await liquidStakedComptroller.actionPaused(vrsETH_LiquidStakedETH, actionId);
        expect(isPaused, `${actionName} should be paused`).to.be.true;
      }
    });

    it("Check vrsETH_LiquidStakedETH market CF is zero", async () => {
      const market = await liquidStakedComptroller.markets(vrsETH_LiquidStakedETH);
      expect(market.collateralFactorMantissa).to.be.equal(0);
    });

    it("check borrow and supply caps for vrsETH_LiquidStakedETH", async () => {
      const borrowCap = await liquidStakedComptroller.borrowCaps(vrsETH_LiquidStakedETH);
      const supplyCap = await liquidStakedComptroller.supplyCaps(vrsETH_LiquidStakedETH);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.equal(0);
    });

    it("Check vrsETH_LiquidStakedETH market is listed", async () => {
      const market = await liquidStakedComptroller.markets(vrsETH_LiquidStakedETH);
      expect(market.isListed).to.be.false;
    });
  });
});
