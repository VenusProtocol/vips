import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  NORMAL_TIMELOCK,
  RISK_STEWARD_RECEIVER,
  MARKET_CAPS_RISK_STEWARD,
  ACM,
  BNB_CORE_COMPTROLLER,
  LIQUID_STAKING_BNB_COMPTROLLER,
  DEFI_COMPTROLLER,
  STABLECOIN_COMPTROLLER,
  GAMEFI_COMPTROLLER,
  BTC_COMPTROLLER,
  TRON_COMPTROLLER,
  LIQUID_STAKING_ETH_COMPTROLLER,
  MEME_COMPTROLLER,
  vipXXX,
} from "../../vips/vip-xxx/bsctestnet";
import { abi as ACM_ABI } from "./abi/AccessControlManager.json";
import { abi as RISK_STEWARD_RECEIVER_ABI } from "./abi/RiskStewardReceiver.json";

forking(47580309, async () => {
  const provider = ethers.provider;
  const accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);

  testVip("VIP-XXX", await vipXXX(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACM_ABI],
        ["RoleGranted"],
        [24],
      );
    },
  });


  describe("Post-VIP behavior", async () => {
    it("check risk steward receiver permissions", async () => {
      const allowedToSetRiskParameterConfig = await accessControlManager.hasPermission(NORMAL_TIMELOCK, RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)");

      expect(allowedToSetRiskParameterConfig).to.equal(true);

      const allowedToToggleConfigActive = await accessControlManager.hasPermission(NORMAL_TIMELOCK, RISK_STEWARD_RECEIVER, "toggleConfigActive(string)");

      expect(allowedToToggleConfigActive).to.equal(true);

      const allowedToPauseRiskStewardReceiver = await accessControlManager.hasPermission(NORMAL_TIMELOCK, RISK_STEWARD_RECEIVER, "pause()");

      expect(allowedToPauseRiskStewardReceiver).to.equal(true);

      const allowedToUnpauseRiskStewardReceiver = await accessControlManager.hasPermission(NORMAL_TIMELOCK, RISK_STEWARD_RECEIVER, "unpause()");

      expect(allowedToUnpauseRiskStewardReceiver).to.equal(true);
    });

    it("check market caps risk steward permissions", async () => {
      const allowedToProcessUpdate = await accessControlManager.hasPermission(RISK_STEWARD_RECEIVER, MARKET_CAPS_RISK_STEWARD, "processUpdate(RiskParameterUpdate)");

      expect(allowedToProcessUpdate).to.equal(true);

      const allowedToSetMaxIncreaseBps = await accessControlManager.hasPermission(NORMAL_TIMELOCK, MARKET_CAPS_RISK_STEWARD, "setMaxIncreaseBps(uint256)");

      expect(allowedToSetMaxIncreaseBps).to.equal(true);

      // Core Pool
      let allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, BNB_CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])");

      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      let allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, BNB_CORE_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])");

      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      // Isolated Pools

      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, LIQUID_STAKING_BNB_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])");
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, LIQUID_STAKING_BNB_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])");
      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, DEFI_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])");
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, DEFI_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])");
      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, STABLECOIN_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])");
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, STABLECOIN_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])");
      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, GAMEFI_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])");
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, GAMEFI_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])");
      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, BTC_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])");
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, BTC_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])");
      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, TRON_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])");
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, TRON_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])");
      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, LIQUID_STAKING_ETH_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])");
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, LIQUID_STAKING_ETH_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])");
      expect(allowedToSetMarketBorrowCaps).to.equal(true);

      allowedToSetMarketSupplyCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, MEME_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])");
      expect(allowedToSetMarketSupplyCaps).to.equal(true);

      allowedToSetMarketBorrowCaps = await accessControlManager.hasPermission(MARKET_CAPS_RISK_STEWARD, MEME_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])");
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
    })
  });
});
