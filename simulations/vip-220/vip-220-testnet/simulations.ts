import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip220Testnet } from "../../../vips/vip-220/vip-220-testnet";
import COMPTROLLER_ABI from "./abi/Comproller_ABI.json";

const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const ASSET = "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47";
const FEED = "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa";
const ORACLE_ADMIN = "0xce10739590001705F7FF231611ba4A48B2820327";
const OLD_COLLATERAL_FACT0R = parseUnits("0.8", 18);
const NEW_COLLATERAL_FACTOR = parseUnits("0.72", 18);

forking(36057801, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, ASSET, FEED, ORACLE_ADMIN);
  });

  describe("Pre-VIP behavior", async () => {
    it("BUSD collateral factor equals 80%", async () => {
      const market = await comptroller.markets(VBUSD);
      expect(market.collateralFactorMantissa).to.equal(OLD_COLLATERAL_FACT0R);
    });
  });

  testVip("VIP-220Testnet Reduce CF of BUSD market", await vip220Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Reduces BUSD collateral factor to 72%", async () => {
      const market = await comptroller.markets(VBUSD);
      expect(market.collateralFactorMantissa).to.equal(NEW_COLLATERAL_FACTOR);
    });
  });
});
