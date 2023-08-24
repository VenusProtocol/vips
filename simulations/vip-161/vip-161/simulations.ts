import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { Actions, vip160 } from "../../../vips/vip-161/vip-161";
import COMPTROLLER_ABI from "./abi/COMPTROLLER_ABI.json";
import INTEREST_RATE_MODEL_ABI from "./abi/INTEREST_RATE_MODEL_ABI.json";
import VBEP20_ABI from "./abi/VBEP20_ABI.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const DEFI_POOL = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VANKRBNB_DEFI = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";
const VTUSDOLD_INTEREST_RATE_MODEL = "0x574f056c1751Ed5F3aa30ba04e550f4E6090c992";
const OLD_VTUSDOLD_INTEREST_RATE_MODEL = "0x84645E886E6e8192921C2d9bFf9882B55c6E7830";

forking(31110871, () => {
  let comptroller: ethers.Contract;
  let defi_comptroller: ethers.Contract;
  let rateModel: ethers.Contract;
  let vbusd: ethers.Contract;
  let vtusdold: ethers.Contract;
  const provider = ethers.provider;

  const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
    const BLOCKS_PER_YEAR = BigNumber.from("10512000");
    return ratePerYear.div(BLOCKS_PER_YEAR);
  };

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    vbusd = new ethers.Contract(VBUSD, VBEP20_ABI, provider);
    defi_comptroller = new ethers.Contract(DEFI_POOL, COMPTROLLER_ABI, provider);
    vtusdold = new ethers.Contract(VTUSDOLD, VBEP20_ABI, provider);
  });
  describe("Pre-VIP behavior", async () => {
    describe("BUSD market", async () => {
      it("supply cap of VBUSD equals 680,800,000 ", async () => {
        const oldCap = await comptroller.supplyCaps(VBUSD);
        expect(oldCap).to.equal(parseUnits("680800000", 18));
      });

      it("borrow cap of VBUSD equals 80,000,000", async () => {
        const oldCap = await comptroller.borrowCaps(VBUSD);
        expect(oldCap).to.equal(parseUnits("80000000", 18));
      });

      it("reserve factor of BUSD equals 10%", async () => {
        expect(await vbusd.reserveFactorMantissa()).to.equal(parseUnits("0.1", 18));
      });
    });

    describe("TUSDOLD market", async () => {
      before(async () => {
        rateModel = new ethers.Contract(OLD_VTUSDOLD_INTEREST_RATE_MODEL, INTEREST_RATE_MODEL_ABI, ethers.provider);
      });

      it("has base=0", async () => {
        expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0", 18)));
      });

      it("has kink=40%", async () => {
        expect(await rateModel.kink()).to.equal(parseUnits("0.4", 18));
      });

      it("has multiplier=5%", async () => {
        expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("5", 16)));
      });

      it("has jumpMultiplier=250%", async () => {
        expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
      });

      it("get old interestRateModel", async () => {
        expect(await vtusdold.interestRateModel()).to.equal(OLD_VTUSDOLD_INTEREST_RATE_MODEL);
      });
    });

    describe("ankrBNB (DeFi)", async () => {
      it("supply cap of VANKRBNB_DEFI equals 5,000", async () => {
        const oldCap = await defi_comptroller.supplyCaps(VANKRBNB_DEFI);
        expect(oldCap).to.equal(parseUnits("5000", 18));
      });
    });
  });

  testVip("VIP-160 Risk Parameters Update", vip160(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VBEP20_ABI],
        [
          "NewBorrowCap",
          "NewSupplyCap",
          "NewMarketInterestRateModel",
          "NewReserveFactor",
          "ActionPausedMarket",
          "VenusBorrowSpeedUpdated",
          "VenusSupplySpeedUpdated",
          "Failure",
        ],
        [1, 2, 1, 1, 3, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("BUSD market", async () => {
      it("supply cap of BUSD equals 0", async () => {
        const newCap = await comptroller.supplyCaps(VBUSD);
        expect(newCap).to.equal(0);
      });

      it("borrow cap of BUSD equals 1", async () => {
        const newCap = await comptroller.borrowCaps(VBUSD);
        expect(newCap).to.equal(1);
      });

      it("reserve factor of BUSD equals 100%", async () => {
        expect(await vbusd.reserveFactorMantissa()).to.equal(parseUnits("1", 18));
      });
    });

    it("pauses TUSDOLD minting", async () => {
      const mintingPaused = await comptroller.actionPaused(VTUSDOLD, Actions.MINT);
      expect(mintingPaused).to.equal(true);
    });

    it("pauses TUSDOLD borrowing", async () => {
      const borrowingPaused = await comptroller.actionPaused(VTUSDOLD, Actions.BORROW);
      expect(borrowingPaused).to.equal(true);
    });

    it("pauses entering TUSDOLD market", async () => {
      const enteringMarketPaused = await comptroller.actionPaused(VTUSDOLD, Actions.ENTER_MARKETS);
      expect(enteringMarketPaused).to.equal(true);
    });

    describe("TUSDOLD market", async () => {
      before(async () => {
        rateModel = new ethers.Contract(VTUSDOLD_INTEREST_RATE_MODEL, INTEREST_RATE_MODEL_ABI, ethers.provider);
      });

      it("has base=0", async () => {
        expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0", 18)));
      });

      it("has kink=40%", async () => {
        expect(await rateModel.kink()).to.equal(parseUnits("0.4", 18));
      });

      it("has multiplier=5%", async () => {
        expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.049999999994064", 18)));
      });

      it("has jumpMultiplier=50%", async () => {
        expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.5", 18)));
      });

      it("set new interestRateModel", async () => {
        expect(await vtusdold.interestRateModel()).to.equal(VTUSDOLD_INTEREST_RATE_MODEL);
      });
    });

    describe("ankrBNB (DeFi)", async () => {
      it("supply cap of VANKRBNB_DEFI equals 10,000", async () => {
        const newCap = await defi_comptroller.supplyCaps(VANKRBNB_DEFI);
        expect(newCap).to.equal(parseUnits("10000", 18));
      });
    });
  });
});
