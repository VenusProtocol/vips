import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip197 } from "../../vips/vip-197";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
const CAKE_FEED = "0xb6064ed41d4f67e353768aa239ca86f4f73665a1";

forking(33133129, async () => {
  let comptroller: Contract;

  const provider = ethers.provider;
  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, CAKE, CAKE_FEED, NORMAL_TIMELOCK);
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "WBETH");
  });

  describe("Pre-VIP behavior", async () => {
    it("WBETH collateral factor equals 70%", async () => {
      const market = await comptroller.markets(VWBETH);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.7", 18));
    });

    it("CAKE supply cap equals 7,000,000", async () => {
      const oldCap = await comptroller.supplyCaps(VCAKE);
      expect(oldCap).to.equal(parseUnits("7000000", 18));
    });
  });
  testVip("VIP-197 Chaos labs recommendations for the week October 31st, 2023", await vip197());

  describe("Post-VIP behavior", async () => {
    it("Increase WBETH collateral factor to 80%", async () => {
      const market = await comptroller.markets(VWBETH);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.8", 18));
    });

    it("Increase CAKE supply cap to 14,000,000", async () => {
      const newCap = await comptroller.supplyCaps(VCAKE);
      expect(newCap).to.equal(parseUnits("14000000", 18));
    });
  });
});
