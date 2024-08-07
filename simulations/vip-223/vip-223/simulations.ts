import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip223 } from "../../../vips/vip-223/vip-223";
import COMPTROLLER_ABI from "./abi/Comproller_ABI.json";

const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const ASSET = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const FEED = "0xcBb98864Ef56E9042e7d2efef76141f15731B82f";
const ORACLE_ADMIN = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const NEW_BUSD_COLLATERAL_FACTOR = BigNumber.from("0");
const OLD_BUSD_COLLATERAL_FACT0R = parseUnits("0.3", 18);

forking(34576200, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, ASSET, FEED, ORACLE_ADMIN);
  });

  describe("Pre-VIP behavior", async () => {
    it("BUSD collateral factor equals 30%", async () => {
      const market = await comptroller.markets(VBUSD);
      expect(market.collateralFactorMantissa).to.equal(OLD_BUSD_COLLATERAL_FACT0R);
    });
  });

  testVip("VIP-223 Risk Parameters Adjustments (BUSD)", await vip223(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Reduces BUSD collateral factor to 0", async () => {
      const market = await comptroller.markets(VBUSD);
      expect(market.collateralFactorMantissa).to.equal(NEW_BUSD_COLLATERAL_FACTOR);
    });
  });
});
