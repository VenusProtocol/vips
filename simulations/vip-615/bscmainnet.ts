import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip615, {
  ALLEZ_LABS,
  BORROW_CAP_CONFIG,
  COLLATERAL_FACTORS_CONFIG,
  IRM_CONFIG,
  MARKETCAP_STEWARD,
  MARKETCAP_STEWARD_SAFE_DELTA,
  RISK_ORACLE,
  RISK_STEWARD_RECEIVER,
  SUPPLY_CAP_CONFIG,
} from "../../vips/vip-615/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import STEWARD_ABI from "./abi/MarketCapSteward.json";
import RISK_ORACLE_ABI from "./abi/RiskOracle.json";
import RSR_ABI from "./abi/RiskStewardReceiver.json";

const BLOCK_NUMBER = 84424323;

// Risk Steward infra deployed by VIP-592
const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const AUTHORIZED_SENDER = "0x83f426233B358A36953F6951161E76FB7c866a7A";
const WHITELISTED_EXECUTOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

// Each test uses a unique (updateType, market) pair to avoid debounce conflicts
const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";

const ONE_DAY = 86400;
const OLD_DEBOUNCE = 259200; // 3 days — used to clear any pre-existing debounce

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  const rsr = new ethers.Contract(RISK_STEWARD_RECEIVER, RSR_ABI, provider);
  const cfSteward = new ethers.Contract(COLLATERAL_FACTORS_CONFIG.steward, STEWARD_ABI, provider);
  const mcSteward = new ethers.Contract(MARKETCAP_STEWARD, STEWARD_ABI, provider);
  const riskOracle = new ethers.Contract(RISK_ORACLE, RISK_ORACLE_ABI, provider);
  const comptroller = new ethers.Contract(CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

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

    it("interestRateModel has current config", async () => {
      const config = await rsr.getRiskParameterConfig(IRM_CONFIG.updateType);
      expect(config.riskSteward).to.equal(IRM_CONFIG.steward);
      expect(config.debounce).to.equal(IRM_CONFIG.old.debounce);
      expect(config.timelock).to.equal(IRM_CONFIG.old.timelock);
      expect(config.active).to.be.true;
    });

    it("market cap steward safe delta is 50%", async () => {
      expect(await mcSteward.safeDeltaBps()).to.equal(MARKETCAP_STEWARD_SAFE_DELTA);
    });

    it("Allez Labs is NOT an authorized sender", async () => {
      expect(await riskOracle.authorizedSenders(ALLEZ_LABS)).to.be.false;
    });
  });

  testVip("VIP-615 Risk Stewards Parameter Update", await vip615(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [RSR_ABI, STEWARD_ABI, RISK_ORACLE_ABI],
        ["RiskParameterConfigUpdated", "SafeDeltaBpsUpdated", "AuthorizedSenderAdded"],
        [3, 1, 1],
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

    it("interestRateModel config remains unchanged", async () => {
      const config = await rsr.getRiskParameterConfig(IRM_CONFIG.updateType);
      expect(config.riskSteward).to.equal(IRM_CONFIG.steward);
      expect(config.debounce).to.equal(IRM_CONFIG.old.debounce);
      expect(config.timelock).to.equal(IRM_CONFIG.old.timelock);
      expect(config.active).to.be.true;
    });

    it("market cap steward safe delta remains unchanged", async () => {
      expect(await mcSteward.safeDeltaBps()).to.equal(MARKETCAP_STEWARD_SAFE_DELTA);
    });

    it("Allez Labs is an authorized sender on Risk Oracle", async () => {
      expect(await riskOracle.authorizedSenders(ALLEZ_LABS)).to.be.true;
    });
  });

  describe("Post-VIP behavioral verification", () => {
    let sender: Signer;
    let exec: Signer;

    async function publishUpdate(updateType: string, market: string, value: string): Promise<BigNumber> {
      const counter = await riskOracle.updateCounter();
      await riskOracle
        .connect(sender)
        .publishRiskParameterUpdate("ref-615-test", value, updateType, market, 0, 0, "0x");
      return counter.add(1);
    }

    before(async () => {
      sender = await initMainnetUser(AUTHORIZED_SENDER, parseUnits("5"));
      exec = await initMainnetUser(WHITELISTED_EXECUTOR, parseUnits("5"));

      // Clear any pre-existing debounce from real-world risk steward activity
      await ethers.provider.send("evm_increaseTime", [OLD_DEBOUNCE + 1]);
      await ethers.provider.send("evm_mine", []);
    });

    describe("Supply Cap — 24h debounce (was 3 days)", () => {
      it("rejects second update within 24h, accepts after 24h", async () => {
        const cap = await comptroller.supplyCaps(vBTC);
        expect(cap).to.be.gt(0);

        // First update — within 50% safe delta → direct execution
        const cap1 = cap.mul(120).div(100);
        const id1 = await publishUpdate("supplyCap", vBTC, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap1]));
        await expect(rsr.connect(exec).processUpdate(id1)).to.emit(rsr, "UpdateExecuted").withArgs(id1);
        expect(await comptroller.supplyCaps(vBTC)).to.equal(cap1);

        // Immediately after → blocked by debounce
        const cap2 = cap1.mul(110).div(100);
        const id2 = await publishUpdate("supplyCap", vBTC, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap2]));
        await expect(rsr.connect(exec).processUpdate(id2)).to.be.revertedWithCustomError(rsr, "UpdateTooFrequent");

        // After 24h + 1s → succeeds
        await ethers.provider.send("evm_increaseTime", [ONE_DAY + 1]);
        await ethers.provider.send("evm_mine", []);

        const cap3 = cap1.mul(110).div(100);
        const id3 = await publishUpdate("supplyCap", vBTC, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap3]));
        await expect(rsr.connect(exec).processUpdate(id3)).to.emit(rsr, "UpdateExecuted").withArgs(id3);
        expect(await comptroller.supplyCaps(vBTC)).to.equal(cap3);
      });
    });

    describe("Borrow Cap — 24h debounce (was 3 days)", () => {
      it("allows second borrow cap update after 24h", async () => {
        const cap = await comptroller.borrowCaps(vETH);
        expect(cap).to.be.gt(0);

        // First update — within 50% delta → direct execution
        const cap1 = cap.mul(120).div(100);
        const id1 = await publishUpdate("borrowCap", vETH, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap1]));
        await expect(rsr.connect(exec).processUpdate(id1)).to.emit(rsr, "UpdateExecuted").withArgs(id1);
        expect(await comptroller.borrowCaps(vETH)).to.equal(cap1);

        // After 24h + 1s → second update succeeds
        await ethers.provider.send("evm_increaseTime", [ONE_DAY + 1]);
        await ethers.provider.send("evm_mine", []);

        const cap2 = cap1.mul(110).div(100);
        const id2 = await publishUpdate("borrowCap", vETH, ethers.utils.defaultAbiCoder.encode(["uint256"], [cap2]));
        await expect(rsr.connect(exec).processUpdate(id2)).to.emit(rsr, "UpdateExecuted").withArgs(id2);
        expect(await comptroller.borrowCaps(vETH)).to.equal(cap2);
      });
    });

    describe("Allez Labs — can publish, cannot execute timelocked updates", () => {
      it("Allez Labs publishes update, but only whitelisted executor can executeRegisteredUpdate", async () => {
        const allezSender = await initMainnetUser(ALLEZ_LABS, parseUnits("5"));
        const SIX_HOURS = 21600;

        const cap = await comptroller.supplyCaps(vUSDT);
        expect(cap).to.be.gt(0);

        // Allez Labs publishes update outside safe delta (>50%) → will be timelocked
        const newCap = cap.mul(3);
        const counter = await riskOracle.updateCounter();
        await riskOracle
          .connect(allezSender)
          .publishRiskParameterUpdate(
            "ref-allez",
            ethers.utils.defaultAbiCoder.encode(["uint256"], [newCap]),
            "supplyCap",
            vUSDT,
            0,
            0,
            "0x",
          );
        const updateId = counter.add(1);

        // processUpdate is open — anyone can call it; this registers the timelocked update
        await expect(rsr.connect(allezSender).processUpdate(updateId)).to.emit(rsr, "UpdateRegistered");

        // Advance past timelock
        await ethers.provider.send("evm_increaseTime", [SIX_HOURS + 1]);
        await ethers.provider.send("evm_mine", []);

        // Allez Labs tries executeRegisteredUpdate → reverts (not whitelisted executor)
        await expect(rsr.connect(allezSender).executeRegisteredUpdate(updateId)).to.be.revertedWithCustomError(
          rsr,
          "NotAnExecutor",
        );

        // Original whitelisted executor can execute it
        await expect(rsr.connect(exec).executeRegisteredUpdate(updateId))
          .to.emit(rsr, "UpdateExecuted")
          .withArgs(updateId);
        expect(await comptroller.supplyCaps(vUSDT)).to.equal(newCap);
      });
    });

    describe("Collateral Factors — 5% safe delta (was 10%)", () => {
      it("4% change is safe for direct execution (within new 5% delta)", async () => {
        const info = await comptroller.markets(vUSDT);
        const cf = info.collateralFactorMantissa;
        const lt = info.liquidationThresholdMantissa;

        // 4% decrease — within new 5% safe delta
        const newCF = cf.mul(96).div(100);
        const newLT = lt.mul(96).div(100);
        const encoded = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [newCF, newLT]);

        const id = await publishUpdate("collateralFactors", vUSDT, encoded);
        const update = await riskOracle.getUpdateById(id);
        expect(await cfSteward.isSafeForDirectExecution(update)).to.be.true;
      });

      it("7% change requires timelock (outside new 5% delta, was within old 10%)", async () => {
        const info = await comptroller.markets(vLINK);
        const cf = info.collateralFactorMantissa;
        const lt = info.liquidationThresholdMantissa;

        // 7% decrease — outside new 5% delta → no longer safe
        const newCF = cf.mul(93).div(100);
        const newLT = lt.mul(93).div(100);
        const encoded = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [newCF, newLT]);

        const id = await publishUpdate("collateralFactors", vLINK, encoded);
        const update = await riskOracle.getUpdateById(id);
        expect(await cfSteward.isSafeForDirectExecution(update)).to.be.false;
      });
    });
  });
});
