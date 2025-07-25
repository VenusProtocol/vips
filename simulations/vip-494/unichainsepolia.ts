import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip494, {
  COLLATERAL_FACTOR,
  COMPTROLLER_CORE,
  LIQUIDATION_THRESHOLD,
  UNI,
  VUNI_CORE,
} from "../../vips/vip-494/bsctestnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

const Actions = {
  BORROW: 2,
};

forking(19816317, async () => {
  describe("Contracts setup", () => {
    checkVToken(VUNI_CORE, {
      name: "Venus UNI (Core)",
      symbol: "vUNI_Core",
      decimals: 8,
      underlying: UNI,
      exchangeRate: parseUnits("1.0000000000062514598763279060", 28),
      comptroller: COMPTROLLER_CORE,
    });
  });

  testForkedNetworkVipCommands("update UNI market", await vip494(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        [
          "NewSupplyCap",
          "NewBorrowCap",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "ActionPausedMarket",
          "NewMarketInterestRateModel",
        ],
        [1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-Execution state", () => {
    let interestRateModelAddresses: string;
    let vToken: Contract;

    before(async () => {
      vToken = await ethers.getContractAt(VTOKEN_ABI, VUNI_CORE);
      interestRateModelAddresses = await vToken.interestRateModel();
    });

    describe("Risk parameters", () => {
      describe(`risk parameters`, () => {
        let vToken: Contract;
        let comptroller: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, VUNI_CORE);
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set reserve factor to 0.25`, async () => {
          expect(await vToken.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
        });

        it(`should set collateral factor to 0.5`, async () => {
          const market = await comptroller.markets(VUNI_CORE);
          expect(market.collateralFactorMantissa).to.equal(COLLATERAL_FACTOR);
        });

        it(`should set liquidation threshold to 0.55`, async () => {
          const market = await comptroller.markets(VUNI_CORE);
          expect(market.liquidationThresholdMantissa).to.equal(LIQUIDATION_THRESHOLD);
        });

        it(`should set supply cap to 4000000`, async () => {
          expect(await comptroller.supplyCaps(VUNI_CORE)).to.equal(parseUnits("4000000", 18));
        });

        it(`should set borrow cap to 2000000`, async () => {
          expect(await comptroller.borrowCaps(VUNI_CORE)).to.equal(parseUnits("2000000", 18));
        });

        it("enter market not paused", async () => {
          const borrowPaused = await comptroller.actionPaused(VUNI_CORE, Actions.BORROW);
          expect(borrowPaused).to.equal(false);
        });
      });
    });

    it("Interest rates", async () => {
      checkInterestRate(
        interestRateModelAddresses,
        "VUNI",
        {
          base: "0",
          multiplier: "0.15",
          jump: "3",
          kink: "0.45",
        },
        BLOCKS_PER_YEAR,
      );
    });

    it("check isolated pools", async () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
