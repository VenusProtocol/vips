import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import { vip205 } from "../../vips/vip-205";
import ILIR_ABI from "./abi/ILInterestRateModelABI.json";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20DelegatorAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const VTUSD_OLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VUSDT_Stablecoins_IR = "0x7dc969122450749A8B0777c0e324522d67737988";
const COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VPLANET_DEFI = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const VPLANET_NEW_SUPPLY_CAP = parseUnits("2000000000", 18);
const VPLANET_NEW_BORROW_CAP = parseUnits("1000000000", 18);

const RATE_MODEL_CURRENT_CORE_POOL = "0x8612b1330575d3f2f792329C5c16d55f22433c3F";
const RATE_MODE_TUSD_OLD = "0x574f056c1751Ed5F3aa30ba04e550f4E6090c992";
const RATE_MODEL_NEW_CORE_POOL = "0x8c2651590ECE4FFe8E722ef6F80cc7407f537bBa";
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

forking(33570600, () => {
  let comptroller: ethers.Contract;
  let vUSDT: ethers.Contract;
  let vUSDC: ethers.Contract;
  let vDAI: ethers.Contract;
  let vTUSD: ethers.Contract;
  let vTUSD_OLD: ethers.Contract;
  let vPLANET_DEFI: ethers.Contract;
  let vUSDT_Stablecoins_IR: ethers.Contract;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Address checks", async () => {
    before(async () => {
      vUSDT = new ethers.Contract(VUSDT, VBEP20_DELEGATOR_ABI, ethers.provider);
      vUSDC = new ethers.Contract(VUSDC, VBEP20_DELEGATOR_ABI, ethers.provider);
      vDAI = new ethers.Contract(VDAI, VBEP20_DELEGATOR_ABI, ethers.provider);
      vTUSD = new ethers.Contract(VTUSD, VBEP20_DELEGATOR_ABI, ethers.provider);
      vTUSD_OLD = new ethers.Contract(VTUSD_OLD, VBEP20_DELEGATOR_ABI, ethers.provider);
      vUSDT = new ethers.Contract(VUSDT, VBEP20_DELEGATOR_ABI, ethers.provider);
      vPLANET_DEFI = new ethers.Contract(VPLANET_DEFI, VBEP20_DELEGATOR_ABI, ethers.provider);
      vUSDT_Stablecoins_IR = new ethers.Contract(VUSDT_Stablecoins_IR, RATE_MODEL_ABI, ethers.provider);
    });

    it("Should match current interest rate model", async () => {
      expect(await vUSDT.interestRateModel()).to.equal(RATE_MODEL_CURRENT_CORE_POOL);
      expect(await vUSDC.interestRateModel()).to.equal(RATE_MODEL_CURRENT_CORE_POOL);
      expect(await vDAI.interestRateModel()).to.equal(RATE_MODEL_CURRENT_CORE_POOL);
      expect(await vTUSD.interestRateModel()).to.equal(RATE_MODEL_CURRENT_CORE_POOL);
      expect(await vTUSD_OLD.interestRateModel()).to.equal(RATE_MODE_TUSD_OLD);
    });
    it("Rate Model Params should match the current settings for USDT (Stablecoin)", async () => {
      // Assert current Rate model config for USDT in Stablecoin Pool
      expect(await vUSDT_Stablecoins_IR.jumpMultiplierPerBlock()).to.equal("237823439878");
      expect(await vUSDT_Stablecoins_IR.kink()).to.equal(parseUnits("0.8", 18));
      expect(await vUSDT_Stablecoins_IR.multiplierPerBlock()).to.equal("4756468797");
    });
  });

  describe("Caps Check", async () => {
    it("supply cap of vPLANET (DEFI) equals 1,000,000,000", async () => {
      const oldCap = await comptroller.supplyCaps(VPLANET_DEFI);
      expect(oldCap).to.equal(parseUnits("1000000000", 18));
    });
    it("borrow cap of vPLANET (DEFI) equals 500,000,000", async () => {
      const oldCap = await comptroller.borrowCaps(VPLANET_DEFI);
      expect(oldCap).to.equal(parseUnits("500000000", 18));
    });
  });

  testVip("VIP-130 Risk Parameters Update", vip205(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VBEP20_DELEGATOR_ABI, ILIR_ABI],
        ["NewSupplyCap", "NewBorrowCap", "NewMarketInterestRateModel", "NewInterestParams", "Failure"],
        [1, 1, 5, 1, 0],
      );
    },
  });
  describe("Post-VIP behaviour", async () => {
    it("sets new InterestRateModel", async () => {
      expect(await vUSDC.interestRateModel()).to.equal(RATE_MODEL_NEW_CORE_POOL);
    });

    it("sets new InterestRateModel", async () => {
      expect(await vUSDT.interestRateModel()).to.equal(RATE_MODEL_NEW_CORE_POOL);
    });

    it("sets new InterestRateModel", async () => {
      expect(await vDAI.interestRateModel()).to.equal(RATE_MODEL_NEW_CORE_POOL);
    });

    it("sets new InterestRateModel", async () => {
      expect(await vTUSD.interestRateModel()).to.equal(RATE_MODEL_NEW_CORE_POOL);
    });

    it("sets new InterestRateModel", async () => {
      expect(await vTUSD_OLD.interestRateModel()).to.equal(ZERO_RATE_MODEL);
    });

    it("increases supply rate to 2,000,000,000", async () => {
      expect(await comptroller.supplyCaps(VPLANET_DEFI)).to.equal(VPLANET_NEW_SUPPLY_CAP);
    });

    it("increases borrow rate to 1,000,000,000", async () => {
      expect(await comptroller.borrowCaps(VPLANET_DEFI)).to.equal(VPLANET_NEW_BORROW_CAP);
    });

    checkInterestRate(VUSDT_Stablecoins_IR, "VUSDT (STABLECOINS)", {
      base: "0",
      multiplier: "0.06875",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate(RATE_MODEL_NEW_CORE_POOL, "VUSDT (CORE)", {
      base: "0",
      multiplier: "0.06875",
      jump: "2.5",
      kink: "0.8",
    });
  });
});
