import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriodInBinanceOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip150 } from "../../vips/vip-150";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VBEP20_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VTRXOLD = "0x61edcfe8dd6ba3c891cb9bec2dc7657b3b422e93";
const VTRXOLD_RATE_MODEL = "0x6b7C3d1ced49604c66e2C8125989E78B1E5356F5";
const VTUSDOLD_RATE_MODEL = "0x84645E886E6e8192921C2d9bFf9882B55c6E7830";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const VSXP_RATE_MODEL = "0x91475A3f288841bce074Ec7edF27ec3fE58e18d1";
const VankrBNB_LST = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
const VBNBx_LST = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const LST_COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const TRON_COMPTROLLER = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";
const VUSDD_TRON = "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7";
const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

forking(30354172, async () => {
  let rateModel: Contract;
  let vTusdOld: Contract;
  let vTrxOld: Contract;
  let vSxp: Contract;
  let lstComptroller: Contract;
  let tronComptroller: Contract;
  let coreComptroller: Contract;
  const provider = ethers.provider;

  const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
    const BLOCKS_PER_YEAR = BigNumber.from("10512000");
    return ratePerYear.div(BLOCKS_PER_YEAR);
  };

  before(async () => {
    vTusdOld = new ethers.Contract(VTUSDOLD, VBEP20_ABI, provider);
    vTrxOld = new ethers.Contract(VTRXOLD, VBEP20_ABI, provider);
    vSxp = new ethers.Contract(VSXP, VBEP20_ABI, provider);
    lstComptroller = new ethers.Contract(LST_COMPTROLLER, COMPTROLLER_ABI, provider);
    tronComptroller = new ethers.Contract(TRON_COMPTROLLER, COMPTROLLER_ABI, provider);
    coreComptroller = new ethers.Contract(CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "WBETH");
  });

  testVip("VIP-150 Risk Parameters Update", await vip150(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VBEP20_ABI],
        ["NewCollateralFactor", "NewBorrowCap", "NewSupplyCap", "NewMarketInterestRateModel", "Failure"],
        [1, 3, 1, 3, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should match new interest rate model after VIP", async () => {
      expect(await vTrxOld.interestRateModel()).to.equal(VTRXOLD_RATE_MODEL);
      expect(await vTusdOld.interestRateModel()).to.equal(VTUSDOLD_RATE_MODEL);
      expect(await vSxp.interestRateModel()).to.equal(VSXP_RATE_MODEL);
    });
  });

  describe("TRX (old) rate model parameters", async () => {
    before(async () => {
      rateModel = new ethers.Contract(VTRXOLD_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=2%", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
    });

    it("has kink=1%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.01", 18));
    });

    it("has multiplier=100%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("1", 18)));
    });

    it("has jumpMultiplier=300%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("3", 18)));
    });
  });

  describe("TUSD (old) rate model parameters", async () => {
    before(async () => {
      rateModel = new ethers.Contract(VTUSDOLD_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=0", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(0);
    });

    it("has kink=40%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.40", 18));
    });

    it("has multiplier=5%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.05", 18)));
    });

    it("has jumpMultiplier=250%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2.5", 18)));
    });
  });

  describe("SXP rate model parameters", async () => {
    before(async () => {
      rateModel = new ethers.Contract(VSXP_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=50%", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.5", 18)));
    });

    it("has kink=60%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.60", 18));
    });

    it("has multiplier=30%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.3", 18)));
    });

    it("has jumpMultiplier=300%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("3", 18)));
    });
  });

  describe("Caps Check", async () => {
    it("collateral factor of WBETH equals 70%", async () => {
      const collateralFactor = (await coreComptroller.markets(VWBETH)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.70", 18));
    });

    it("supply cap of USDD equals 2,700,000", async () => {
      const newCap = await tronComptroller.supplyCaps(VUSDD_TRON);
      expect(newCap).to.equal(parseUnits("2700000", 18));
    });

    it("borrow cap of USDD equals 1,800,000", async () => {
      const newCap = await tronComptroller.borrowCaps(VUSDD_TRON);
      expect(newCap).to.equal(parseUnits("1800000", 18));
    });

    it("borrow cap of ankrBNB equals 1,600", async () => {
      const newCap = await lstComptroller.borrowCaps(VankrBNB_LST);
      expect(newCap).to.equal(parseUnits("1600", 18));
    });

    it("borrow cap of USDD equals 1,920", async () => {
      const newCap = await lstComptroller.borrowCaps(VBNBx_LST);
      expect(newCap).to.equal(parseUnits("1920", 18));
    });
  });
});
