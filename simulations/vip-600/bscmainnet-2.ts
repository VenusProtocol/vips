import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip600, {
  COLLATERALFACTORS_STEWARD,
  CORE_COMPTROLLER,
  DEBOUNCE,
  RISK_ORACLE,
  RISK_PARAMETER_SENDER,
  RISK_STEWARD_RECEIVER,
  TIMELOCK,
  UPDATE_TYPES,
  WHITELISTED_EXECUTORS,
} from "../../vips/vip-600/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comproller.json";
import STEWARD_ABI from "./abi/MarketCapSteward.json";
import RISK_ORACLE_ABI from "./abi/RiskOracle.json";
import RSR_ABI from "./abi/RiskStewardReceiver.json";
import VToken_ABI from "./abi/VToken.json";

// Markets for testing (each scenario uses a different market to avoid debounce conflicts)
const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";

const SIX_HOURS = TIMELOCK; // 21600
const TWO_DAYS = 2 * 24 * 60 * 60; // 172800 - UPDATE_EXPIRATION_TIME
const THREE_DAYS = DEBOUNCE; // 259200

forking(80591637, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
  const riskOracle = new ethers.Contract(RISK_ORACLE, RISK_ORACLE_ABI, provider);
  const riskStewardReceiver = new ethers.Contract(RISK_STEWARD_RECEIVER, RSR_ABI, provider);

  let authorizedSender: Signer;
  let executor: Signer;

  testVip("VIP-600 Risk-Steward (setup for e2e)", await vip600(), {});

  describe("End-to-End Risk Steward Flow Tests", () => {
    before(async () => {
      // Impersonate the authorized sender and whitelisted executor (same address)
      authorizedSender = await initMainnetUser(RISK_PARAMETER_SENDER[0], parseUnits("5"));
      executor = await initMainnetUser(WHITELISTED_EXECUTORS[0], parseUnits("5"));
    });

    // Helper: publish an update to the Risk Oracle and return the updateId
    async function publishUpdate(
      updateType: string,
      market: string,
      newValue: string,
      poolId: number = 0,
    ): Promise<BigNumber> {
      const counterBefore = await riskOracle.updateCounter();
      await riskOracle
        .connect(authorizedSender)
        .publishRiskParameterUpdate("ref-e2e", newValue, updateType, market, poolId, 0, "0x");
      const updateId = counterBefore.add(1);
      return updateId;
    }

    describe("MarketCapsRiskSteward — Supply Cap", () => {
      it("within safe delta (50%): executes directly without timelock", async () => {
        const currentSupplyCap = await comptroller.supplyCaps(vBTC);
        expect(currentSupplyCap).to.be.gt(0); // Ensure non-zero for safe delta calc

        // Change within 50% — increase by 30%
        const newSupplyCap = currentSupplyCap.mul(130).div(100);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256"], [newSupplyCap]);

        const updateId = await publishUpdate(UPDATE_TYPES[0], vBTC, encodedValue);

        // processUpdate should execute directly (emit UpdateExecuted, not just UpdateRegistered)
        await expect(riskStewardReceiver.connect(executor).processUpdate(updateId))
          .to.emit(riskStewardReceiver, "UpdateExecuted")
          .withArgs(updateId);

        // Verify the supply cap was actually updated on-chain
        expect(await comptroller.supplyCaps(vBTC)).to.equal(newSupplyCap);
      });

      it("outside safe delta (>50%): registered with timelock, executable after 6 hours", async () => {
        const currentSupplyCap = await comptroller.supplyCaps(vETH);
        expect(currentSupplyCap).to.be.gt(0);

        // Change outside 50% — double it (100% increase)
        const newSupplyCap = currentSupplyCap.mul(2);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256"], [newSupplyCap]);

        const updateId = await publishUpdate(UPDATE_TYPES[0], vETH, encodedValue);

        // processUpdate should only register (not execute) — emit UpdateRegistered but NOT UpdateExecuted
        const tx = await riskStewardReceiver.connect(executor).processUpdate(updateId);
        const receipt = await tx.wait();

        // Check UpdateRegistered was emitted
        const registeredEvent = receipt.events?.find((e: { event: string }) => e.event === "UpdateRegistered");
        expect(registeredEvent).to.not.be.undefined;

        // Check UpdateExecuted was NOT emitted
        const executedEvent = receipt.events?.find((e: { event: string }) => e.event === "UpdateExecuted");
        expect(executedEvent).to.be.undefined;

        // Verify supply cap has NOT changed yet
        expect(await comptroller.supplyCaps(vETH)).to.not.equal(newSupplyCap);

        // Try to execute before timelock — should revert
        await expect(
          riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId),
        ).to.be.revertedWithCustomError(riskStewardReceiver, "UpdateNotUnlocked");

        // Advance time past the 6-hour timelock
        await ethers.provider.send("evm_increaseTime", [SIX_HOURS + 1]);
        await ethers.provider.send("evm_mine", []);

        // Now execute — should succeed
        await expect(riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId))
          .to.emit(riskStewardReceiver, "UpdateExecuted")
          .withArgs(updateId);

        // Verify the supply cap was updated
        expect(await comptroller.supplyCaps(vETH)).to.equal(newSupplyCap);
      });

      it("outside safe delta + expiration: update expires after 2 days and cannot be executed", async () => {
        const currentSupplyCap = await comptroller.supplyCaps(vUSDT);
        expect(currentSupplyCap).to.be.gt(0);

        // Change outside 50%
        const newSupplyCap = currentSupplyCap.mul(3);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256"], [newSupplyCap]);

        const updateId = await publishUpdate(UPDATE_TYPES[0], vUSDT, encodedValue);

        // Register with timelock
        await riskStewardReceiver.connect(executor).processUpdate(updateId);

        // Advance time past UPDATE_EXPIRATION_TIME (2 days) — well beyond the 6-hour timelock
        await ethers.provider.send("evm_increaseTime", [TWO_DAYS + 1]);
        await ethers.provider.send("evm_mine", []);

        // Try to execute — should revert with UpdateIsExpired
        await expect(
          riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId),
        ).to.be.revertedWithCustomError(riskStewardReceiver, "UpdateIsExpired");

        // Verify supply cap was NOT changed
        expect(await comptroller.supplyCaps(vUSDT)).to.not.equal(newSupplyCap);
      });
    });

    describe("MarketCapsRiskSteward — Borrow Cap", () => {
      it("within safe delta (50%): executes directly", async () => {
        const currentBorrowCap = await comptroller.borrowCaps(vBTC);
        expect(currentBorrowCap).to.be.gt(0);

        // Decrease by 20% (within 50% delta)
        const newBorrowCap = currentBorrowCap.mul(80).div(100);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256"], [newBorrowCap]);

        const updateId = await publishUpdate(UPDATE_TYPES[1], vBTC, encodedValue);

        await expect(riskStewardReceiver.connect(executor).processUpdate(updateId))
          .to.emit(riskStewardReceiver, "UpdateExecuted")
          .withArgs(updateId);

        expect(await comptroller.borrowCaps(vBTC)).to.equal(newBorrowCap);
      });

      it("outside safe delta (>50%): requires timelock", async () => {
        const currentBorrowCap = await comptroller.borrowCaps(vETH);
        expect(currentBorrowCap).to.be.gt(0);

        // Reduce by 70% (outside 50% delta)
        const newBorrowCap = currentBorrowCap.mul(30).div(100);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256"], [newBorrowCap]);

        const updateId = await publishUpdate(UPDATE_TYPES[1], vETH, encodedValue);

        const tx = await riskStewardReceiver.connect(executor).processUpdate(updateId);
        const receipt = await tx.wait();

        const executedEvent = receipt.events?.find((e: { event: string }) => e.event === "UpdateExecuted");
        expect(executedEvent).to.be.undefined; // NOT directly executed

        // Advance past timelock, then execute
        await ethers.provider.send("evm_increaseTime", [SIX_HOURS + 1]);
        await ethers.provider.send("evm_mine", []);

        await expect(riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId))
          .to.emit(riskStewardReceiver, "UpdateExecuted")
          .withArgs(updateId);

        expect(await comptroller.borrowCaps(vETH)).to.equal(newBorrowCap);
      });
    });

    describe("CollateralFactorsRiskSteward", () => {
      it("within safe delta (10%): isSafeForDirectExecution returns true", async () => {
        const cfSteward = new ethers.Contract(COLLATERALFACTORS_STEWARD, STEWARD_ABI, provider);

        // Read current collateral factor and liquidation threshold for vETH
        const marketInfo = await comptroller.markets(vETH);
        const currentCF = marketInfo.collateralFactorMantissa;
        const currentLT = marketInfo.liquidationThresholdMantissa;
        expect(currentCF).to.be.gt(0);
        expect(currentLT).to.be.gt(0);

        // Change within 10% — adjust by 5%
        const newCF = currentCF.mul(95).div(100);
        const newLT = currentLT.mul(95).div(100);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [newCF, newLT]);

        const updateId = await publishUpdate(UPDATE_TYPES[2], vETH, encodedValue);
        const update = await riskOracle.getUpdateById(updateId);

        // Verify that isSafeForDirectExecution returns true
        const isSafe = await cfSteward.isSafeForDirectExecution(update);
        expect(isSafe).to.be.true;
      });

      it("outside safe delta (>10%): registered with timelock", async () => {
        const marketInfo = await comptroller.markets(vBTC);
        const currentCF = marketInfo.collateralFactorMantissa;
        const currentLT = marketInfo.liquidationThresholdMantissa;
        expect(currentCF).to.be.gt(0);

        // Change outside 10% — reduce by 25%
        const newCF = currentCF.mul(75).div(100);
        const newLT = currentLT.mul(75).div(100);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [newCF, newLT]);

        const updateId = await publishUpdate(UPDATE_TYPES[2], vBTC, encodedValue);

        const tx = await riskStewardReceiver.connect(executor).processUpdate(updateId);
        const receipt = await tx.wait();

        // Should be registered but NOT executed (outside delta → timelock)
        const executedEvent = receipt.events?.find((e: { event: string }) => e.event === "UpdateExecuted");
        expect(executedEvent).to.be.undefined;

        const registeredEvent = receipt.events?.find((e: { event: string }) => e.event === "UpdateRegistered");
        expect(registeredEvent).to.not.be.undefined;

        // Verify the update is in Pending status
        const registeredUpdate = await riskStewardReceiver.updates(updateId);
        expect(registeredUpdate.status).to.equal(1); // 1 = Pending
      });

      it("outside safe delta + expiration: cannot execute after 2 days", async () => {
        const marketInfo = await comptroller.markets(vUSDT);
        const currentCF = marketInfo.collateralFactorMantissa;
        const currentLT = marketInfo.liquidationThresholdMantissa;

        // Change outside 10%
        const newCF = currentCF.mul(75).div(100);
        const newLT = currentLT.mul(75).div(100);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [newCF, newLT]);

        const updateId = await publishUpdate(UPDATE_TYPES[2], vUSDT, encodedValue);
        await riskStewardReceiver.connect(executor).processUpdate(updateId);

        // Advance past 2-day expiration
        await ethers.provider.send("evm_increaseTime", [TWO_DAYS + 1]);
        await ethers.provider.send("evm_mine", []);

        await expect(
          riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId),
        ).to.be.revertedWithCustomError(riskStewardReceiver, "UpdateIsExpired");
      });
    });

    describe("IRMRiskSteward", () => {
      // Use an existing IRM on mainnet as the "new" IRM for testing
      const EXISTING_IRM = "0x38Dd273fE7590403f554F350a7c3c592e8227EB7";

      it("always requires timelock: registered, executable after 6 hours", async () => {
        const vBtcContract = new ethers.Contract(vBTC, VToken_ABI, provider);
        const currentIRM = await vBtcContract.interestRateModel();
        expect(currentIRM).to.not.equal(EXISTING_IRM); // Ensure it's actually a change

        const encodedValue = ethers.utils.defaultAbiCoder.encode(["address"], [EXISTING_IRM]);

        const updateId = await publishUpdate(UPDATE_TYPES[3], vBTC, encodedValue);

        // processUpdate should only register, NEVER execute directly for IRM
        const tx = await riskStewardReceiver.connect(executor).processUpdate(updateId);
        const receipt = await tx.wait();

        const executedEvent = receipt.events?.find((e: { event: string }) => e.event === "UpdateExecuted");
        expect(executedEvent).to.be.undefined; // IRM is never safe for direct execution

        const registeredEvent = receipt.events?.find((e: { event: string }) => e.event === "UpdateRegistered");
        expect(registeredEvent).to.not.be.undefined;

        // Verify IRM has NOT changed yet
        expect(await vBtcContract.interestRateModel()).to.equal(currentIRM);

        // Try before timelock — should fail
        await expect(
          riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId),
        ).to.be.revertedWithCustomError(riskStewardReceiver, "UpdateNotUnlocked");

        // Advance past timelock
        await ethers.provider.send("evm_increaseTime", [SIX_HOURS + 1]);
        await ethers.provider.send("evm_mine", []);

        // Execute — should succeed
        await expect(riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId))
          .to.emit(riskStewardReceiver, "UpdateExecuted")
          .withArgs(updateId);

        // Verify IRM was updated
        expect(await vBtcContract.interestRateModel()).to.equal(EXISTING_IRM);
      });

      it("expired after 2 days: cannot execute", async () => {
        const vEthContract = new ethers.Contract(vETH, VToken_ABI, provider);
        const currentIRM = await vEthContract.interestRateModel();

        // Use a different IRM address for this test
        const OTHER_IRM = "0x6b3BAd0f2E2e3C8c1E2e81d0926479e97F72B930";
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["address"], [OTHER_IRM]);

        const updateId = await publishUpdate(UPDATE_TYPES[3], vETH, encodedValue);
        await riskStewardReceiver.connect(executor).processUpdate(updateId);

        // Advance past 2-day expiration
        await ethers.provider.send("evm_increaseTime", [TWO_DAYS + 1]);
        await ethers.provider.send("evm_mine", []);

        await expect(
          riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId),
        ).to.be.revertedWithCustomError(riskStewardReceiver, "UpdateIsExpired");

        // Verify IRM was NOT changed
        expect(await vEthContract.interestRateModel()).to.equal(currentIRM);
      });
    });

    describe("Debounce enforcement", () => {
      it("should reject a second update for the same (type, market) within debounce period", async () => {
        // Use vUSDT borrow cap — not used by other tests for this update type
        const currentBorrowCap = await comptroller.borrowCaps(vUSDT);
        expect(currentBorrowCap).to.be.gt(0);

        // First update — within delta, executes directly
        const firstCap = currentBorrowCap.mul(110).div(100);
        const firstEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [firstCap]);
        const firstUpdateId = await publishUpdate(UPDATE_TYPES[1], vUSDT, firstEncoded);
        await riskStewardReceiver.connect(executor).processUpdate(firstUpdateId);
        expect(await comptroller.borrowCaps(vUSDT)).to.equal(firstCap);

        // Second update immediately — should fail due to debounce (3 days)
        const secondCap = firstCap.mul(110).div(100);
        const secondEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [secondCap]);
        const secondUpdateId = await publishUpdate(UPDATE_TYPES[1], vUSDT, secondEncoded);
        await expect(riskStewardReceiver.connect(executor).processUpdate(secondUpdateId)).to.be.revertedWithCustomError(
          riskStewardReceiver,
          "UpdateTooFrequent",
        );

        // Advance past debounce period (3 days)
        await ethers.provider.send("evm_increaseTime", [THREE_DAYS + 1]);
        await ethers.provider.send("evm_mine", []);

        // Now the second update should succeed
        // Need to publish a new update since the oracle checks for latest update
        const thirdCap = firstCap.mul(110).div(100);
        const thirdEncoded = ethers.utils.defaultAbiCoder.encode(["uint256"], [thirdCap]);
        const thirdUpdateId = await publishUpdate(UPDATE_TYPES[1], vUSDT, thirdEncoded);
        await expect(riskStewardReceiver.connect(executor).processUpdate(thirdUpdateId))
          .to.emit(riskStewardReceiver, "UpdateExecuted")
          .withArgs(thirdUpdateId);

        expect(await comptroller.borrowCaps(vUSDT)).to.equal(thirdCap);
      });
    });

    describe("Reject update flow", () => {
      it("executor can reject a timelocked update before it executes", async () => {
        // Use vLINK supply cap — a fresh market with no prior pending updates
        const currentSupplyCap = await comptroller.supplyCaps(vLINK);

        // Outside delta → will be timelocked
        const newSupplyCap = currentSupplyCap.mul(3);
        const encodedValue = ethers.utils.defaultAbiCoder.encode(["uint256"], [newSupplyCap]);

        const updateId = await publishUpdate(UPDATE_TYPES[0], vLINK, encodedValue);
        await riskStewardReceiver.connect(executor).processUpdate(updateId);

        // Reject the update
        await expect(riskStewardReceiver.connect(executor).rejectUpdate(updateId))
          .to.emit(riskStewardReceiver, "UpdateRejected")
          .withArgs(updateId);

        // Verify update status is Rejected (3)
        const registeredUpdate = await riskStewardReceiver.updates(updateId);
        expect(registeredUpdate.status).to.equal(3); // 3 = Rejected

        // Advance past timelock — still should not be executable (rejected)
        await ethers.provider.send("evm_increaseTime", [SIX_HOURS + 1]);
        await ethers.provider.send("evm_mine", []);

        await expect(
          riskStewardReceiver.connect(executor).executeRegisteredUpdate(updateId),
        ).to.be.revertedWithCustomError(riskStewardReceiver, "UpdateAlreadyResolved");

        // Supply cap should remain unchanged
        expect(await comptroller.supplyCaps(vLINK)).to.equal(currentSupplyCap);
      });
    });
  });
});
