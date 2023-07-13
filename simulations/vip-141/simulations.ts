import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip141 } from "../../vips/vip-141";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const OLD_VTUSD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
const VBETH = "0x972207A639CC1B374B893cc33Fa251b55CEB7c07";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const BETH = "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B";
const OLD_TUSD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
const XVS_FEED = "0xbf63f430a79d4036a5900c19818aff1fa710f206";
const BETH_FEED = "0x2a3796273d47c4ed363b361d3aefb7f7e2a13782";
const OLD_TUSD_FEED = "0xa3334a9762090e827413a7495afece76f41dfc06";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(29835855, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, XVS, XVS_FEED, NORMAL_TIMELOCK);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, BETH, BETH_FEED, NORMAL_TIMELOCK);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, OLD_TUSD, OLD_TUSD_FEED, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", async () => {
    it("collateral factor of XVS equals 55%", async () => {
      const collateralFactor = (await comptroller.markets(VXVS)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.55", 18));
    });

    it("collateral factor of BETH equals 50%", async () => {
      const collateralFactor = (await comptroller.markets(VBETH)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.50", 18));
    });

    it("collateral factor of TUSD (old) equals 55%", async () => {
      const collateralFactor = (await comptroller.markets(OLD_VTUSD)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.55", 18));
    });

    it("borrow cap of TUSD (old) equals 11810000", async () => {
      const oldCap = await comptroller.borrowCaps(OLD_VTUSD);
      expect(oldCap).to.equal(parseUnits("11810000", 18));
    });

    it("supply cap of TUSD (old) equals 21130000", async () => {
      const oldCap = await comptroller.supplyCaps(OLD_VTUSD);
      expect(oldCap).to.equal(parseUnits("21130000", 18));
    });
  });

  testVip("VIP-141 Risk Parameters Update", vip141(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewBorrowCap", "NewSupplyCap", "Failure"],
        [3, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor of XVS equals 60%", async () => {
      const collateralFactor = (await comptroller.markets(VXVS)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("collateral factor of BETH equals 40%", async () => {
      const collateralFactor = (await comptroller.markets(VBETH)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.40", 18));
    });

    it("collateral factor of TUSD (old) equals 0%", async () => {
      const collateralFactor = (await comptroller.markets(OLD_VTUSD)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(0);
    });

    it("borrow cap of TUSD (olf) equals 1", async () => {
      const oldCap = await comptroller.borrowCaps(OLD_VTUSD);
      expect(oldCap).to.equal(1);
    });

    it("supply cap of TUSD (old) equals 0", async () => {
      const oldCap = await comptroller.supplyCaps(OLD_VTUSD);
      expect(oldCap).to.equal(0);
    });
  });
});
