import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { Actions, vip161Testnet } from "../../../vips/vip-161/vip-161-testnet";
import COMPTROLLER_ABI from "./abi/COMPTROLLER_ABI.json";
import INTEREST_RATE_MODEL_ABI from "./abi/INTEREST_RATE_MODEL_ABI.json";
import VBEP20_ABI from "./abi/VBEP20_ABI.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const VTUSDOLD = "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0";
const DEFI_POOL = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const VANKRBNB_DEFI = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";
const OLD_VTUSDOLD_INTEREST_RATE_MODEL = "0x7bDDFe540e86f1A6Da69D5d94240c6Cd67243C15";
const VTUSDOLD_INTEREST_RATE_MODEL = "0xfB14Dd85A26e41E4fD62b3B142b17f279c7Bb8B0";

forking(32697381, () => {
  let comptroller: Contract;
  let defi_comptroller: Contract;
  let rateModel: Contract;
  let vbusd: Contract;
  let vtusdold: Contract;
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
  describe("Pre-VIP behaviour", async () => {
    describe("BUSD market", async () => {
      it("supply cap of VBUSD equals ", async () => {
        const oldCap = await comptroller.supplyCaps(VBUSD);
        expect(oldCap).to.equal(
          BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935"),
        );
      });

      it("borrow cap of VBUSD equals 0", async () => {
        const oldCap = await comptroller.borrowCaps(VBUSD);
        expect(oldCap).to.equal(parseUnits("0", 18));
      });

      it("reserve factor of BUSD equals", async () => {
        expect(await vbusd.reserveFactorMantissa()).to.equal(parseUnits("0", 18));
      });
    });

    describe("TUSDOLD market", async () => {
      before(async () => {
        rateModel = new ethers.Contract(OLD_VTUSDOLD_INTEREST_RATE_MODEL, INTEREST_RATE_MODEL_ABI, ethers.provider);
      });

      it("has base=0", async () => {
        expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0", 18)));
      });

      it("has kink=80%", async () => {
        expect(await rateModel.kink()).to.equal(parseUnits("0.8", 18));
      });

      it("has multiplier=5%", async () => {
        expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.05", 18)));
      });

      it("has jumpMultiplier=109%", async () => {
        expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("1.09", 18)));
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

  testVip("VIP-161 Risk Parameters Update", vip161Testnet(), {
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

      it("has kink=80%", async () => {
        expect(await rateModel.kink()).to.equal(parseUnits("0.8", 18));
      });

      it("has multiplier=5%", async () => {
        expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.05", 18)));
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
