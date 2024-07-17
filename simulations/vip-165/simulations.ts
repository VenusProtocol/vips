import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStaleCoreAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip165 } from "../../vips/vip-165";
import COMPTROLLER_ABI from "./abi/COMPTROLLER_ABI.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
const VDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
const VLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
const VFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
const VDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";
const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const CHAINLINKADDRESS = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(31358000, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStaleCoreAssets(CHAINLINKADDRESS, TIMELOCK);
  });

  describe("Pre-VIP behaviour", async () => {
    it("collateral factor of MATIC equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VMATIC)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("collateral factor of DOGE equals 40%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VDOGE)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.40", 18));
    });

    it("collateral factor of LTC equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VLTC)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("collateral factor of FIL equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VFIL)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("collateral factor of DAI equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VDAI)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("collateral factor of LINK equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VLINK)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("collateral factor of DOT equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VDOT)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("collateral factor of TUSD equals 0", async () => {
      const oldCollateralFactor = (await comptroller.markets(VTUSD)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(0);
    });

    it("Supply cap of WBETH equals 16,000", async () => {
      const oldSupplyCap = await comptroller.supplyCaps(VWBETH);
      expect(oldSupplyCap).to.equal(parseUnits("16000", 18));
    });
  });

  testVip("VIP-165 Risk Parameters Update", await vip165(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor", "NewSupplyCap", "Failure"], [8, 1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor of MATIC equals 65%", async () => {
      const newCollateralFactor = (await comptroller.markets(VMATIC)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.65", 18));
    });

    it("collateral factor of DOGE equals 43%", async () => {
      const newCollateralFactor = (await comptroller.markets(VDOGE)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.43", 18));
    });

    it("collateral factor of LTC equals 62%", async () => {
      const newCollateralFactor = (await comptroller.markets(VLTC)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.62", 18));
    });

    it("collateral factor of FIL equals 61%", async () => {
      const newCollateralFactor = (await comptroller.markets(VFIL)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.61", 18));
    });

    it("collateral factor of DAI equals 75%", async () => {
      const newCollateralFactor = (await comptroller.markets(VDAI)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.75", 18));
    });

    it("collateral factor of LINK equals 63%", async () => {
      const newCollateralFactor = (await comptroller.markets(VLINK)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.63", 18));
    });

    it("collateral factor of DOT equals 65%", async () => {
      const newCollateralFactor = (await comptroller.markets(VDOT)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.65", 18));
    });

    it("collateral factor of TUSD equals 75%", async () => {
      const newCollateralFactor = (await comptroller.markets(VTUSD)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.75", 18));
    });

    it("Supply cap of WBETH equals 27,000", async () => {
      const newSupplyCap = await comptroller.supplyCaps(VWBETH);
      expect(newSupplyCap).to.equal(parseUnits("27000", 18));
    });
  });
});
