import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { Actions, ETHEREUM_COMPTROLLER, ETHEREUM_VTOKENS, vip510 } from "../../vips/vip-510/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

forking(22593783, async () => {
  let comptroller_core: Contract;
  let comptroller_curve: Contract;
  let comptroller_liquid_staked_eth: Contract;

  before(async () => {
    comptroller_core = await ethers.getContractAt(COMPTROLLER_ABI, ETHEREUM_COMPTROLLER.Core);
    comptroller_curve = await ethers.getContractAt(COMPTROLLER_ABI, ETHEREUM_COMPTROLLER.Curve);
    comptroller_liquid_staked_eth = await ethers.getContractAt(COMPTROLLER_ABI, ETHEREUM_COMPTROLLER.LiquidStakedETH);
  });

  describe("Pre-VIP behavior", async () => {
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
        [27, 9, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
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
