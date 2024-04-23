import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip122 } from "../../vips/vip-122";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VBEP20_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const vLINK = "0x650b940a1033b8a1b1873f78730fcfc73ec11f1f";
const vLTC = "0x57a5297f2cb2c0aac9d554660acd6d385ab50c6b";
const vMATIC = "0x5c9476fcd6a4f9a3654139721c949c2233bbbbc8";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const vBTC = "0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b";
const vXRP = "0xb248a295732e0225acd3337607cc01068e3b9c10";

const ETH_BTC_RATE_MODEL = "0xAA69D9B80B5b303F66227932489669538027783F";
const LINK_LTC_MATIC_XRP_RATE_MODEL = "0xda6cdE1F47AE792FA40Aa85C9F6901d5E64a6769";
const BNB_RATE_MODEL = "0x8B5351D0568CEEFa9BfC71C7a11C01179B736d99";

const ETH_BTC_RATE_MODEL_CURR = "0x8683B97aA8eA1f5a0d65CDBA6FA78782Aa77C193";
const LINK_LTC_XRP_RATE_MODEL_CURR = "0x32450305D6c692269B3cBf9730d99104f80fce23";
const BNB_RATE_MODEL_CURR = "0x1B047f9717154EA5EC59674273d50a137212cBb4";
const MATIC_RATE_MODEL_CURR = "0xC6F3f4D5421E70CB6C32C7402E51C8894A40F29a";

forking(28541594, () => {
  let comptroller: Contract;
  let rateModel: Contract;
  let vEth: Contract;
  let vBtc: Contract;
  let vLink: Contract;
  let vLtc: Contract;
  let vMatic: Contract;
  let vXrp: Contract;
  let vBnb: Contract;
  const provider = ethers.provider;

  const toBlockRate = (ratePerYear: BigNumber): BigNumber => {
    const BLOCKS_PER_YEAR = BigNumber.from("10512000");
    return ratePerYear.div(BLOCKS_PER_YEAR);
  };

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Address checks", async () => {
    before(async () => {
      vEth = new ethers.Contract(vETH, VBEP20_ABI, ethers.provider);
      vBtc = new ethers.Contract(vBTC, VBEP20_ABI, ethers.provider);
      vLink = new ethers.Contract(vLINK, VBEP20_ABI, ethers.provider);
      vLtc = new ethers.Contract(vLTC, VBEP20_ABI, ethers.provider);
      vMatic = new ethers.Contract(vMATIC, VBEP20_ABI, ethers.provider);
      vXrp = new ethers.Contract(vXRP, VBEP20_ABI, ethers.provider);
      vBnb = new ethers.Contract(vBNB, VBEP20_ABI, ethers.provider);
    });

    it("Should match current interest rate model", async () => {
      expect(await vEth.interestRateModel()).to.equal(ETH_BTC_RATE_MODEL_CURR);
      expect(await vBtc.interestRateModel()).to.equal(ETH_BTC_RATE_MODEL_CURR);
      expect(await vLink.interestRateModel()).to.equal(LINK_LTC_XRP_RATE_MODEL_CURR);
      expect(await vLtc.interestRateModel()).to.equal(LINK_LTC_XRP_RATE_MODEL_CURR);
      expect(await vMatic.interestRateModel()).to.equal(MATIC_RATE_MODEL_CURR);
      expect(await vXrp.interestRateModel()).to.equal(LINK_LTC_XRP_RATE_MODEL_CURR);
      expect(await vBnb.interestRateModel()).to.equal(BNB_RATE_MODEL_CURR);
    });
  });

  describe("ETH & BTC rate model", async () => {
    before(async () => {
      rateModel = new ethers.Contract(ETH_BTC_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=0", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0", 18)));
    });

    it("has kink=75%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.75", 18));
    });

    it("has multiplier=9%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.09", 18)));
    });

    it("has jumpMultiplier=200%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("2", 18)));
    });
  });

  describe("LINK, LTC, MATIC & XRP rate model", async () => {
    before(async () => {
      rateModel = new ethers.Contract(LINK_LTC_MATIC_XRP_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=2%", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0.02", 18)));
    });

    it("has kink=60%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.6", 18));
    });

    it("has multiplier=12%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.12", 18)));
    });

    it("has jumpMultiplier=300%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("3", 18)));
    });
  });

  describe("BNB rate model", async () => {
    before(async () => {
      rateModel = new ethers.Contract(BNB_RATE_MODEL, RATE_MODEL_ABI, ethers.provider);
    });

    it("has base=0", async () => {
      expect(await rateModel.baseRatePerBlock()).to.equal(toBlockRate(parseUnits("0", 18)));
    });

    it("has kink=60%", async () => {
      expect(await rateModel.kink()).to.equal(parseUnits("0.6", 18));
    });

    it("has multiplier=15%", async () => {
      expect(await rateModel.multiplierPerBlock()).to.equal(toBlockRate(parseUnits("0.15", 18)));
    });

    it("has jumpMultiplier=400%", async () => {
      expect(await rateModel.jumpMultiplierPerBlock()).to.equal(toBlockRate(parseUnits("4", 18)));
    });
  });

  describe("Caps Check", async () => {
    it("supply cap of TRX (old) equals 81207000000000000000", async () => {
      const oldCap = await comptroller.supplyCaps(OLD_VTRX);
      expect(oldCap).to.equal(parseUnits("81207000000000000000", 6));
    });

    it("borrow cap of TRX (old) equals 18853000000000000000", async () => {
      const oldCap = await comptroller.borrowCaps(OLD_VTRX);
      expect(oldCap).to.equal(parseUnits("18853000000000000000", 6));
    });

    it("supply cap of SXP equals 55052000", async () => {
      const oldCap = await comptroller.supplyCaps(VSXP);
      expect(oldCap).to.equal(parseUnits("55052000", 18));
    });

    it("borrow cap of SXP equals 8100000", async () => {
      const oldCap = await comptroller.borrowCaps(VSXP);
      expect(oldCap).to.equal(parseUnits("8100000", 18));
    });
  });

  testVip("VIP-122 Risk Parameters Update", vip122(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "NewSupplyCap", "Failure"], [2, 2, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("supply cap of TRX (old) equals 0", async () => {
      const newCap = await comptroller.supplyCaps(OLD_VTRX);
      expect(newCap).to.equal(0);
    });

    it("borrow cap of TRX (old) equals 0", async () => {
      const newCap = await comptroller.borrowCaps(OLD_VTRX);
      expect(newCap).to.equal(0);
    });

    it("supply cap of SXP equals 0", async () => {
      const newCap = await comptroller.supplyCaps(VSXP);
      expect(newCap).to.equal(0);
    });

    it("borrow cap of SXP equals 0", async () => {
      const newCap = await comptroller.borrowCaps(VSXP);
      expect(newCap).to.equal(0);
    });

    it("Should match new interest rate model after VIP", async () => {
      expect(await vEth.interestRateModel()).to.equal(ETH_BTC_RATE_MODEL);
      expect(await vBtc.interestRateModel()).to.equal(ETH_BTC_RATE_MODEL);
      expect(await vLink.interestRateModel()).to.equal(LINK_LTC_MATIC_XRP_RATE_MODEL);
      expect(await vLtc.interestRateModel()).to.equal(LINK_LTC_MATIC_XRP_RATE_MODEL);
      expect(await vMatic.interestRateModel()).to.equal(LINK_LTC_MATIC_XRP_RATE_MODEL);
      expect(await vXrp.interestRateModel()).to.equal(LINK_LTC_MATIC_XRP_RATE_MODEL);
      expect(await vBnb.interestRateModel()).to.equal(BNB_RATE_MODEL);
    });
  });
});
