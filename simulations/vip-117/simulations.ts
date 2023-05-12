import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip117 } from "../../vips/vip-117";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VSXP_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const SXP = "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

forking(28148357, () => {
  let comptroller: ethers.Contract;
  let sxpContract: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    sxpContract = await ethers.getContractAt(IERC20_ABI, SXP);
    await setMaxStalePeriodInOracle(COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("collateral factor of TRX (new) equals 50%", async () => {
      const collateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.50", 18));
    });

    it("collateral factor of SXP equals 12.5%", async () => {
      const collateralFactor = (await comptroller.markets(VSXP)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.125", 18));
    });

    it("balance of SXP in the treasury", async () => {
      const sxpTreasuryBalance = await sxpContract.balanceOf(TREASURY);
      expect(sxpTreasuryBalance).to.equal("25610823482588636519545");
    });
  });

  testVip("VIP-117 Risk Parameters Update", vip117(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VSXP_ABI],
        ["NewCollateralFactor", "ReservesReduced", "Failure"],
        [2, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor of TRX (new) equals 52.5%", async () => {
      const collateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.525", 18));
    });

    it("collateral factor of SXP  equals 0%", async () => {
      const collateralFactor = (await comptroller.markets(VSXP)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(0);
    });

    it("balance of SXP in the treasury", async () => {
      const sxpTreasuryBalance = await sxpContract.balanceOf(TREASURY);
      expect(sxpTreasuryBalance).to.equal("26137012855296712152656"); // 25610823482588636519545 + 526189372708075633111
    });
  });
});
