import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  Actions,
  Comptroller_Ethena,
  ETHEREUM_COMPTROLLER,
  ETHEREUM_VTOKENS,
  VToken_vPT_USDe_27MAR2025_Ethena,
  VToken_vPT_sUSDE_27MAR2025_Ethena,
  VToken_vUSDC_Ethena,
  VToken_vsUSDe_Ethena,
  vip510,
} from "../../vips/vip-510/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

forking(22593783, async () => {
  let comptrollerEthena: Contract;
  let comptroller_core: Contract;
  let comptroller_curve: Contract;
  let comptroller_liquid_staked_eth: Contract;

  before(async () => {
    comptrollerEthena = await ethers.getContractAt(COMPTROLLER_ABI, Comptroller_Ethena);
    comptroller_core = await ethers.getContractAt(COMPTROLLER_ABI, ETHEREUM_COMPTROLLER.Core);
    comptroller_curve = await ethers.getContractAt(COMPTROLLER_ABI, ETHEREUM_COMPTROLLER.Curve);
    comptroller_liquid_staked_eth = await ethers.getContractAt(COMPTROLLER_ABI, ETHEREUM_COMPTROLLER.LiquidStakedETH);
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

    describe("COMPTROLLER_CORE", async () => {
      it("unpaused actions for VToken_vFRAX_Core", async () => {
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vFRAX_Core, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vFRAX_Core, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vFRAX_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vsFRAX_Core", async () => {
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vsFRAX_Core, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vsFRAX_Core, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vsFRAX_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vyvWETH_1_Core", async () => {
        // BORROW already paused
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvWETH_1_Core, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvWETH_1_Core, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvWETH_1_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vyvUSDT_1_Core", async () => {
        // BORROW already paused
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDT_1_Core, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDT_1_Core, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDT_1_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vyvUSDS_1_Core", async () => {
        // BORROW already paused
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDS_1_Core, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDS_1_Core, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDS_1_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vyvUSDC_1_Core", async () => {
        // BORROW already paused
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDC_1_Core, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDC_1_Core, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDC_1_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });
    });

    describe("COMPTROLLER_CURVE", async () => {
      it("unpaused actions for VToken_vCRV_Curve", async () => {
        let paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vCRV_Curve, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vCRV_Curve, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vCRV_Curve, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vcrvUSD_Curve", async () => {
        let paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });
    });

    describe("COMPTROLLER_LIQUID_STAKED_ETH_SEPOLIA", async () => {
      it("unpaused actions for VToken_vsfrxETH_LiquidStakedETH", async () => {
        let paused = await comptroller_liquid_staked_eth.actionPaused(
          ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH,
          Actions.BORROW,
        );
        expect(paused).to.be.false;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH,
          Actions.MINT,
        );
        expect(paused).to.be.false;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.false;
      });
    });
  });

  testForkedNetworkVipCommands("VIP-510", await vip510(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["ActionPausedMarket", "NewCollateralFactor", "NewLiquidationThreshold"],
        [39, 12, 0],
      );
    },
  });

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

    describe("COMPTROLLER_CORE", async () => {
      it("paused actions for VToken_vFRAX_Core", async () => {
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vFRAX_Core, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vFRAX_Core, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vFRAX_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vsFRAX_Core", async () => {
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vsFRAX_Core, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vsFRAX_Core, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vsFRAX_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vyvWETH_1_Core", async () => {
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvWETH_1_Core, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvWETH_1_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vyvUSDT_1_Core", async () => {
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDT_1_Core, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDT_1_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vyvUSDS_1_Core", async () => {
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDS_1_Core, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDS_1_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vyvUSDC_1_Core", async () => {
        let paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDC_1_Core, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_core.actionPaused(ETHEREUM_VTOKENS.Core.vyvUSDC_1_Core, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      for (const [name, address] of Object.entries(ETHEREUM_VTOKENS.Core)) {
        it(`should set ${name} collateral factor to 0`, async () => {
          const market = await comptroller_core.markets(address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });
      }
    });

    describe("COMPTROLLER_CURVE", async () => {
      it("paused actions for VToken_vCRV_Curve", async () => {
        let paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vCRV_Curve, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vCRV_Curve, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vCRV_Curve, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vcrvUSD_Curve", async () => {
        let paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_curve.actionPaused(ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      for (const [name, address] of Object.entries(ETHEREUM_VTOKENS.Curve)) {
        it(`should set ${name} collateral factor to 0`, async () => {
          const market = await comptroller_curve.markets(address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });
      }
    });

    describe("COMPTROLLER_LIQUID_STAKED_ETH", async () => {
      it("paused actions for VToken_vsfrxETH_LiquidStakedETH", async () => {
        let paused = await comptroller_liquid_staked_eth.actionPaused(
          ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH,
          Actions.MINT,
        );
        expect(paused).to.be.true;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it(`should set vsfrxETH_LiquidStakedETH collateral factor to 0`, async () => {
        const market = await comptroller_liquid_staked_eth.markets(
          ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH,
        );
        expect(market.collateralFactorMantissa).to.equal(0);
      });
    });
  });
});
