import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip190 } from "../../../vips/vip-190/vip-190-testnet";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const REDSTONE_ORACLE = "0x0Af51d1504ac5B711A9EAFe2fAC11A51d32029Ad";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";

const TRX = "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B";
const TRX_OLD = "0x19E7215abF8B2716EE807c9f4b83Af0e7f92653F";

const PRICE_LOWER_BOUND = parseUnits("0.99", 18);
const PRICE_UPPER_BOUND = parseUnits("1.01", 18);

forking(34366000, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let redStoneOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      redStoneOracle = new ethers.Contract(REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });

    it("Validate pivot oracle is not set for TRX_OLD", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(TRX_OLD);
      expect(tokenConfig.oracles[1]).to.equal(ethers.constants.AddressZero);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(false);
    });
    it("Validate pivot oracle is not set for TRX", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(TRX);
      expect(tokenConfig.oracles[1]).to.equal(ethers.constants.AddressZero);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(false);
    });
    it("Pending owner of RedStone oracle is Normal Timelock ", async () => {
      const pendingOwner = await redStoneOracle.pendingOwner();
      expect(pendingOwner).to.equal(NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-190 Enable RedStone oracle as the Pivot oracle for TRX", await vip190(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [2]);
      await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [2]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["OracleSet"], [2]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["OracleEnabled"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Owner of RedStone oracle is Normal Timelock ", async () => {
      const owner = await redStoneOracle.owner();
      expect(owner).to.equal(NORMAL_TIMELOCK);
    });
    it("Validate pivot oracle is set for TRX_OLD", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(TRX_OLD);
      expect(tokenConfig.oracles[1]).to.equal(REDSTONE_ORACLE);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(true);
    });
    it("Validate pivot oracle is set for TRX", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(TRX);
      expect(tokenConfig.oracles[1]).to.equal(REDSTONE_ORACLE);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(true);
    });
    it("Validate upper and lower bounds for TRX", async () => {
      const validateConfig = await boundValidator.validateConfigs(TRX);
      expect(validateConfig.upperBoundRatio).to.equal(PRICE_UPPER_BOUND);
      expect(validateConfig.lowerBoundRatio).to.equal(PRICE_LOWER_BOUND);
    });
    it("Validate upper and lower bounds for TRX_OLD", async () => {
      const validateConfig = await boundValidator.validateConfigs(TRX_OLD);
      expect(validateConfig.upperBoundRatio).to.equal(PRICE_UPPER_BOUND);
      expect(validateConfig.lowerBoundRatio).to.equal(PRICE_LOWER_BOUND);
    });
    it("Should return prices for TRX and TRX_OLD", async () => {
      expect(await resilientOracle.getPrice(TRX)).to.not.equal(0);
      expect(await resilientOracle.getPrice(TRX_OLD)).to.not.equal(0);
    });
  });
});
