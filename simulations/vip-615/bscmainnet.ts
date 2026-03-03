import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip615, {
  BORROW_CAP_CONFIG,
  COLLATERAL_FACTORS_CONFIG,
  IRM_CONFIG,
  MARKETCAP_STEWARD,
  MARKETCAP_STEWARD_SAFE_DELTA,
  RISK_STEWARD_RECEIVER,
  SUPPLY_CAP_CONFIG,
} from "../../vips/vip-615/bscmainnet";
import STEWARD_ABI from "./abi/MarketCapSteward.json";
import RSR_ABI from "./abi/RiskStewardReceiver.json";

const BLOCK_NUMBER = 84228546;

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  const rsr = new ethers.Contract(RISK_STEWARD_RECEIVER, RSR_ABI, provider);
  const cfSteward = new ethers.Contract(COLLATERAL_FACTORS_CONFIG.steward, STEWARD_ABI, provider);
  const mcSteward = new ethers.Contract(MARKETCAP_STEWARD, STEWARD_ABI, provider);

  describe("Pre-VIP state", () => {
    it("supplyCap has old config", async () => {
      const config = await rsr.getRiskParameterConfig(SUPPLY_CAP_CONFIG.updateType);
      expect(config.riskSteward).to.equal(SUPPLY_CAP_CONFIG.steward);
      expect(config.debounce).to.equal(SUPPLY_CAP_CONFIG.old.debounce);
      expect(config.timelock).to.equal(SUPPLY_CAP_CONFIG.old.timelock);
      expect(config.active).to.be.true;
    });

    it("borrowCap has old config", async () => {
      const config = await rsr.getRiskParameterConfig(BORROW_CAP_CONFIG.updateType);
      expect(config.riskSteward).to.equal(BORROW_CAP_CONFIG.steward);
      expect(config.debounce).to.equal(BORROW_CAP_CONFIG.old.debounce);
      expect(config.timelock).to.equal(BORROW_CAP_CONFIG.old.timelock);
      expect(config.active).to.be.true;
    });

    it("collateralFactors has old config", async () => {
      const config = await rsr.getRiskParameterConfig(COLLATERAL_FACTORS_CONFIG.updateType);
      expect(config.riskSteward).to.equal(COLLATERAL_FACTORS_CONFIG.steward);
      expect(config.debounce).to.equal(COLLATERAL_FACTORS_CONFIG.old.debounce);
      expect(config.timelock).to.equal(COLLATERAL_FACTORS_CONFIG.old.timelock);
      expect(config.active).to.be.true;
      expect(await cfSteward.safeDeltaBps()).to.equal(COLLATERAL_FACTORS_CONFIG.old.safeDeltaBps);
    });

    it("interestRateModel config is unchanged", async () => {
      const config = await rsr.getRiskParameterConfig(IRM_CONFIG.updateType);
      expect(config.riskSteward).to.equal(IRM_CONFIG.steward);
      expect(config.debounce).to.equal(IRM_CONFIG.old.debounce);
      expect(config.timelock).to.equal(IRM_CONFIG.old.timelock);
      expect(config.active).to.be.true;
    });

    it("market cap steward safe delta is unchanged", async () => {
      expect(await mcSteward.safeDeltaBps()).to.equal(MARKETCAP_STEWARD_SAFE_DELTA);
    });
  });

  testVip("VIP-615 Risk Stewards Parameter Update", await vip615(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [RSR_ABI, STEWARD_ABI],
        ["RiskParameterConfigUpdated", "SafeDeltaBpsUpdated"],
        [3, 1], // 3 config updates (supplyCap, borrowCap, collateralFactors) + 1 delta update
      );
    },
  });

  describe("Post-VIP state", () => {
    it("supplyCap has new config", async () => {
      const config = await rsr.getRiskParameterConfig(SUPPLY_CAP_CONFIG.updateType);
      expect(config.riskSteward).to.equal(SUPPLY_CAP_CONFIG.steward);
      expect(config.debounce).to.equal(SUPPLY_CAP_CONFIG.new.debounce);
      expect(config.timelock).to.equal(SUPPLY_CAP_CONFIG.new.timelock);
      expect(config.active).to.be.true;
    });

    it("borrowCap has new config", async () => {
      const config = await rsr.getRiskParameterConfig(BORROW_CAP_CONFIG.updateType);
      expect(config.riskSteward).to.equal(BORROW_CAP_CONFIG.steward);
      expect(config.debounce).to.equal(BORROW_CAP_CONFIG.new.debounce);
      expect(config.timelock).to.equal(BORROW_CAP_CONFIG.new.timelock);
      expect(config.active).to.be.true;
    });

    it("collateralFactors has new config", async () => {
      const config = await rsr.getRiskParameterConfig(COLLATERAL_FACTORS_CONFIG.updateType);
      expect(config.riskSteward).to.equal(COLLATERAL_FACTORS_CONFIG.steward);
      expect(config.debounce).to.equal(COLLATERAL_FACTORS_CONFIG.new.debounce);
      expect(config.timelock).to.equal(COLLATERAL_FACTORS_CONFIG.new.timelock);
      expect(config.active).to.be.true;
      expect(await cfSteward.safeDeltaBps()).to.equal(COLLATERAL_FACTORS_CONFIG.new.safeDeltaBps);
    });

    it("interestRateModel config remains same as before", async () => {
      const config = await rsr.getRiskParameterConfig(IRM_CONFIG.updateType);
      expect(config.riskSteward).to.equal(IRM_CONFIG.steward);
      expect(config.debounce).to.equal(IRM_CONFIG.old.debounce);
      expect(config.timelock).to.equal(IRM_CONFIG.old.timelock);
      expect(config.active).to.be.true;
    });

    it("market cap steward safe delta is unchanged", async () => {
      expect(await mcSteward.safeDeltaBps()).to.equal(MARKETCAP_STEWARD_SAFE_DELTA);
    });
  });
});
