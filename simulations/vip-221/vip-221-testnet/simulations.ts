import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip221Testnet } from "../../../vips/vip-221/vip-221-testnet";
import COMPTROLLER_ABI from "./abi/Comproller_ABI.json";

const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const VXVS = "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const ASSET = "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47";
const FEED = "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa";
const ORACLE_ADMIN = "0xce10739590001705F7FF231611ba4A48B2820327";
const NEW_BUSD_COLLATERAL_FACTOR = parseUnits("0.3", 18);
const OLD_BUSD_COLLATERAL_FACT0R = parseUnits("0.72", 18);
const NEW_XVS_SUPPLY_CAP = parseUnits("3750000", 18);
const OLD_XVS_SUPPLY_CAP = ethers.BigNumber.from("2").pow(256).sub(1); // max uint256

forking(36119257, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, ASSET, FEED, ORACLE_ADMIN);
  });

  describe("Pre-VIP behavior", async () => {
    it("BUSD collateral factor equals 72%", async () => {
      const market = await comptroller.markets(VBUSD);
      expect(market.collateralFactorMantissa).to.equal(OLD_BUSD_COLLATERAL_FACT0R);
    });

    it("supply cap of XVS equals 0 (Uncapped)", async () => {
      const oldCap = await comptroller.supplyCaps(VXVS);
      expect(oldCap).to.equal(OLD_XVS_SUPPLY_CAP);
    });
  });

  testVip("VIP-221Testnet Risk Parameters Adjustments (BUSD, XVS)", vip221Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor", "NewSupplyCap", "Failure"], [1, 1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Reduces BUSD collateral factor to 30%", async () => {
      const market = await comptroller.markets(VBUSD);
      expect(market.collateralFactorMantissa).to.equal(NEW_BUSD_COLLATERAL_FACTOR);
    });

    it("supply cap of XVS equals 3,750,000", async () => {
      const newCap = await comptroller.supplyCaps(VXVS);
      expect(newCap).to.equal(NEW_XVS_SUPPLY_CAP);
    });
  });
});
