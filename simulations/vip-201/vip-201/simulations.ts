import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkInterestRate } from "../../../src/vip-framework/checks/interestRateModel";
import { vip201 } from "../../../vips/vip-201";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";
import DeFi_Pool_ABI from "./abi/DefiPoolAbi.json";
import ILIR_ABI from "./abi/ILInterestRateModelABI.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20DelegatorAbi.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";

const OLD_INTEREST_RATE_MODEL = "0x8612b1330575d3f2f792329C5c16d55f22433c3F";
const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const vTUSD_OLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const NEW_INTEREST_RATE_MODEL = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";
const USDT_StableCoins_IR = "0x7dc969122450749A8B0777c0e324522d67737988";
const vPLANET_DeFi = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const DeFi_Pool = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";

forking(33568508, () => {
  let comptroller: ethers.Contract;
  let defiPool: ethers.Contract;
  let vTusd: ethers.Contract;
  let vUsdt: ethers.Contract;
  let vUsdc: ethers.Contract;
  let vDai: ethers.Contract;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    defiPool = new ethers.Contract(DeFi_Pool, DeFi_Pool_ABI, provider);
    vUsdt = new ethers.Contract(vUSDT, VBEP20_DELEGATOR_ABI, provider);
    vUsdc = new ethers.Contract(vUSDC, VBEP20_DELEGATOR_ABI, provider);
    vDai = new ethers.Contract(vDAI, VBEP20_DELEGATOR_ABI, provider);
    vTusd = new ethers.Contract(vTUSD, VBEP20_DELEGATOR_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("has old InterestRateModel", async () => {
      expect(await vUsdc.interestRateModel()).to.equal(OLD_INTEREST_RATE_MODEL);
    });

    it("has old InterestRateModel", async () => {
      expect(await vUsdt.interestRateModel()).to.equal(OLD_INTEREST_RATE_MODEL);
    });

    it("has old InterestRateModel", async () => {
      expect(await vTusd.interestRateModel()).to.equal(OLD_INTEREST_RATE_MODEL);
    });

    it("has old InterestRateModel", async () => {
      expect(await vDai.interestRateModel()).to.equal(OLD_INTEREST_RATE_MODEL);
    });

    it("supply rate should be 1,000,000,000", async () => {
      expect(await defiPool.supplyCaps(vPLANET_DeFi)).to.equal("1000000000000000000000000000");
    });

    it("borrow rate should be  500,000,000", async () => {
      expect(await defiPool.borrowCaps(vPLANET_DeFi)).to.equal("500000000000000000000000000");
    });

    it("borrow rate should be 1", async () => {
      expect(await comptroller.borrowCaps(vTUSD_OLD)).to.equal(1);
    });
  });

  testVip("VIP-201 update interest rate and other risk parameters,", vip201(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VBEP20_DELEGATOR_ABI, ILIR_ABI],
        ["NewSupplyCap", "NewBorrowCap", "NewMarketInterestRateModel", "NewInterestParams", "Failure"],
        [1, 2, 4, 1, 0],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("sets new InterestRateModel", async () => {
      expect(await vUsdc.interestRateModel()).to.equal(NEW_INTEREST_RATE_MODEL);
    });

    it("sets new InterestRateModel", async () => {
      expect(await vUsdt.interestRateModel()).to.equal(NEW_INTEREST_RATE_MODEL);
    });

    it("sets new InterestRateModel", async () => {
      expect(await vTusd.interestRateModel()).to.equal(NEW_INTEREST_RATE_MODEL);
    });

    it("sets new InterestRateModel", async () => {
      expect(await vDai.interestRateModel()).to.equal(NEW_INTEREST_RATE_MODEL);
    });

    it("increases supply rate to 2,000,000,000", async () => {
      expect(await defiPool.supplyCaps(vPLANET_DeFi)).to.equal("2000000000000000000000000000");
    });

    it("increases borrow rate to 1,000,000,000", async () => {
      expect(await defiPool.borrowCaps(vPLANET_DeFi)).to.equal("1000000000000000000000000000");
    });

    it("borrow rate to 0", async () => {
      expect(await comptroller.borrowCaps(vTUSD_OLD)).to.equal(0);
    });

    checkInterestRate(NEW_INTEREST_RATE_MODEL, "VUSDT", { base: "0", multiplier: "0.06875", jump: "2.5", kink: "0.8" });
    checkInterestRate(USDT_StableCoins_IR, "VUSDT(StableCoins)", {
      base: "0",
      multiplier: "0.06875",
      jump: "2.5",
      kink: "0.8",
    });
  });
});
