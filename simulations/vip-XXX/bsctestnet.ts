import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  WILDCARD_ROLE,
  ACM,
  BNB_CORE_COMPTROLLER,
  CRITICAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  MARKET_CAPS_RISK_STEWARD,
  NORMAL_TIMELOCK,
  RISK_STEWARD_RECEIVER,
  vipXXX,
} from "../../vips/vip-xxx/bsctestnet";
import { abi as ACM_ABI } from "./abi/AccessControlManager.json";
import { abi as RISK_STEWARD_RECEIVER_ABI } from "./abi/RiskStewardReceiver.json";

forking(47591824, async () => {
  const provider = ethers.provider;
  const accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);

  testVip("VIP-XXX", await vipXXX(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [18]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check risk steward receiver permissions", async () => {
      const allowedToSetRiskParameterConfig = await accessControlManager.hasPermission(
        NORMAL_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "setRiskParameterConfig(string,address,uint256)",
      );

      expect(allowedToSetRiskParameterConfig).to.equal(true);

      const normalTimeLockAllowedToToggleConfigActive = await accessControlManager.hasPermission(
        NORMAL_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "toggleConfigActive(string)",
      );

      expect(normalTimeLockAllowedToToggleConfigActive).to.equal(true);

      const criticalTimelockAllowedToToggleConfigActive = await accessControlManager.hasPermission(
        CRITICAL_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "toggleConfigActive(string)",
      );

      expect(criticalTimelockAllowedToToggleConfigActive).to.equal(true);

      const fastTrackTimelockAllowedToToggleConfigActive = await accessControlManager.hasPermission(
        FAST_TRACK_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "toggleConfigActive(string)",
      );

      expect(fastTrackTimelockAllowedToToggleConfigActive).to.equal(true);

      const normalTimelockAllowedToPauseRiskStewardReceiver = await accessControlManager.hasPermission(
        NORMAL_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "pause()",
      );

      expect(normalTimelockAllowedToPauseRiskStewardReceiver).to.equal(true);

      const fastTrackTimelockAllowedToPauseRiskStewardReceiver = await accessControlManager.hasPermission(
        FAST_TRACK_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "pause()",
      );

      expect(fastTrackTimelockAllowedToPauseRiskStewardReceiver).to.equal(true);

      const criticalTimelockAllowedToPauseRiskStewardReceiver = await accessControlManager.hasPermission(
        CRITICAL_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "pause()",
      );

      expect(criticalTimelockAllowedToPauseRiskStewardReceiver).to.equal(true);

      const normalTimelockAllowedToUnpauseRiskStewardReceiver = await accessControlManager.hasPermission(
        NORMAL_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "unpause()",
      );

      expect(normalTimelockAllowedToUnpauseRiskStewardReceiver).to.equal(true);

      const criticalTimelockAllowedToUnpauseRiskStewardReceiver = await accessControlManager.hasPermission(
        CRITICAL_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "unpause()",
      );

      expect(criticalTimelockAllowedToUnpauseRiskStewardReceiver).to.equal(true);

      const fastTrackTimelockAllowedToUnpauseRiskStewardReceiver = await accessControlManager.hasPermission(
        FAST_TRACK_TIMELOCK,
        RISK_STEWARD_RECEIVER,
        "unpause()",
      );

      expect(fastTrackTimelockAllowedToUnpauseRiskStewardReceiver).to.equal(true);
    });

    it("check market caps risk steward permissions", async () => {
      const allowedToProcessUpdate = await accessControlManager.hasPermission(
        RISK_STEWARD_RECEIVER,
        MARKET_CAPS_RISK_STEWARD,
        "processUpdate(RiskParameterUpdate)",
      );

      expect(allowedToProcessUpdate).to.equal(true);

      const normalTimelockAllowedToSetMaxIncreaseBps = await accessControlManager.hasPermission(
        NORMAL_TIMELOCK,
        MARKET_CAPS_RISK_STEWARD,
        "setMaxIncreaseBps(uint256)",
      );

      expect(normalTimelockAllowedToSetMaxIncreaseBps).to.equal(true);

      const criticalTimelockAllowedToSetMaxIncreaseBps = await accessControlManager.hasPermission(
        CRITICAL_TIMELOCK,
        MARKET_CAPS_RISK_STEWARD,
        "setMaxIncreaseBps(uint256)",
      );

      expect(criticalTimelockAllowedToSetMaxIncreaseBps).to.equal(true);

      const fastTrackTimelockAllowedToSetMaxIncreaseBps = await accessControlManager.hasPermission(
        FAST_TRACK_TIMELOCK,
        MARKET_CAPS_RISK_STEWARD,
        "setMaxIncreaseBps(uint256)",
      );

      expect(fastTrackTimelockAllowedToSetMaxIncreaseBps).to.equal(true);

      // Core Pool
      let allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(
        MARKET_CAPS_RISK_STEWARD,
        BNB_CORE_COMPTROLLER,
        "_setMarketSupplyCaps(address[],uint256[])",
      );

      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      let allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(
        MARKET_CAPS_RISK_STEWARD,
        BNB_CORE_COMPTROLLER,
        "_setMarketBorrowCaps(address[],uint256[])",
      );

      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      // Isolated Pools
      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(
        MARKET_CAPS_RISK_STEWARD,
        WILDCARD_ROLE,
        "setMarketSupplyCaps(address[],uint256[])",
      );
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(
        MARKET_CAPS_RISK_STEWARD,
        WILDCARD_ROLE,
        "setMarketBorrowCaps(address[],uint256[])",
      );
      expect(allowedToSetMarketBorrowCaps).to.equal(true);
    });

    it("should set risk parameter config", async () => {
      const riskStewardReceiver = new ethers.Contract(RISK_STEWARD_RECEIVER, RISK_STEWARD_RECEIVER_ABI, provider);

      const supplyConfig = await riskStewardReceiver.getRiskParameterConfig("supplyCap");

      const TEN_MINUTES = 60 * 10;
      expect(supplyConfig.riskSteward).to.equal(MARKET_CAPS_RISK_STEWARD);
      expect(supplyConfig.debounce).to.equal(TEN_MINUTES);
      expect(supplyConfig.active).to.equal(true);

      const borrowConfig = await riskStewardReceiver.getRiskParameterConfig("borrowCap");
      expect(borrowConfig.riskSteward).to.equal(MARKET_CAPS_RISK_STEWARD);
      expect(borrowConfig.debounce).to.equal(TEN_MINUTES);
      expect(borrowConfig.active).to.equal(true);
    });
  });
});
