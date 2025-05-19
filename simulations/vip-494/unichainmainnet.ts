import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { setRedstonePrice } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip494, {
  COLLATERAL_FACTOR,
  COMPTROLLER_CORE,
  LIQUIDATION_THRESHOLD,
  UNI,
  UNICHAIN_vUNI_CORE,
  UNICHAIN_vUSDC_CORE,
} from "../../vips/vip-494/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment
const UNI_REDSTONE_FEED = "0xf1454949C6dEdfb500ae63Aa6c784Aa1Dde08A6c";

const Actions = {
  BORROW: 2,
};

forking(15922000, async () => {
  const vUNI = new ethers.Contract(UNICHAIN_vUNI_CORE, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, ethers.provider);

  before(async () => {
    await setRedstonePrice(unichainmainnet.REDSTONE_ORACLE, UNI, UNI_REDSTONE_FEED, unichainmainnet.NORMAL_TIMELOCK);
  });

  describe("Contracts setup", () => {
    checkVToken(UNICHAIN_vUNI_CORE, {
      name: "Venus UNI (Core)",
      symbol: "vUNI_Core",
      decimals: 8,
      underlying: UNI,
      exchangeRate: parseUnits("1.0000000111819070088746916836", 28),
      comptroller: COMPTROLLER_CORE,
    });
  });

  describe("Pre-Execution state", () => {
    it(`USDC supply cap is 10M`, async () => {
      expect(await comptroller.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("10000000", 6));
    });

    it(`USDC borrow cap is 8M`, async () => {
      expect(await comptroller.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("8000000", 6));
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
        [2, 2, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-Execution state", () => {
    describe("Risk parameters", () => {
      describe(`risk parameters`, () => {
        it(`should set reserve factor to 0.25`, async () => {
          expect(await vUNI.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
        });

        it(`should set collateral factor to 0.5`, async () => {
          const market = await comptroller.markets(UNICHAIN_vUNI_CORE);
          expect(market.collateralFactorMantissa).to.equal(COLLATERAL_FACTOR);
        });

        it(`should set liquidation threshold to 0.55`, async () => {
          const market = await comptroller.markets(UNICHAIN_vUNI_CORE);
          expect(market.liquidationThresholdMantissa).to.equal(LIQUIDATION_THRESHOLD);
        });

        it(`should set supply cap to 4000000`, async () => {
          expect(await comptroller.supplyCaps(UNICHAIN_vUNI_CORE)).to.equal(parseUnits("4000000", 18));
        });

        it(`should set borrow cap to 2000000`, async () => {
          expect(await comptroller.borrowCaps(UNICHAIN_vUNI_CORE)).to.equal(parseUnits("2000000", 18));
        });

        it("enter market not paused", async () => {
          const borrowPaused = await comptroller.actionPaused(UNICHAIN_vUNI_CORE, Actions.BORROW);
          expect(borrowPaused).to.equal(false);
        });
      });
    });

    describe("USDC caps", () => {
      it(`USDC supply cap is 15M`, async () => {
        expect(await comptroller.supplyCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("15000000", 6));
      });

      it(`USDC borrow cap is 12M`, async () => {
        expect(await comptroller.borrowCaps(UNICHAIN_vUSDC_CORE)).to.equal(parseUnits("12000000", 6));
      });
    });

    it("Interest rates", async () => {
      checkInterestRate(
        await vUNI.interestRateModel(),
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
      checkIsolatedPoolsComptrollers({
        [COMPTROLLER_CORE]: "0x9D5132Dd45CdaCd1De3a7b7f1f13da7F025fF726", // USDC holder
      });
    });
  });
});
