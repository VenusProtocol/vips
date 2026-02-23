import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { vip600 as vip600a } from "../../vips/vip-592/bsctestnet";
import vip600, {
  ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  ARBITRUM_SEPOLIA_EID,
  BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  BASE_SEPOLIA_EID,
  COLLATERALFACTORS_STEWARD,
  FIVE_MINUTES,
  IRM_STEWARD,
  MARKETCAP_STEWARD,
  OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  OP_SEPOLIA_EID,
  RISK_ORACLE,
  RISK_PARAMETER_SENDER,
  RISK_STEWARD_RECEIVER,
  SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  SEPOLIA_EID,
  TEN_MINUTES,
  UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  UNICHAIN_SEPOLIA_EID,
  UPDATE_TYPES,
  WHITELISTED_EXECUTORS,
  ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  ZK_SEPOLIA_EID,
} from "../../vips/vip-592/bsctestnet-2";
import STEWARD_ABI from "./abi/MarketCapSteward.json";
import RISK_ORACLE_ABI from "./abi/RiskOracle.json";
import RSR_ABI from "./abi/RiskStewardReceiver.json";

forking(83235428, async () => {
  const provider = ethers.provider;
  const riskOracle = new ethers.Contract(RISK_ORACLE, RISK_ORACLE_ABI, provider);
  const riskStewardReceiver = new ethers.Contract(RISK_STEWARD_RECEIVER, RSR_ABI, provider);
  const marketCapSteward = new ethers.Contract(MARKETCAP_STEWARD, STEWARD_ABI, provider);
  const collateralFactorSteward = new ethers.Contract(COLLATERALFACTORS_STEWARD, STEWARD_ABI, provider);

  await pretendExecutingVip(await vip600a(), NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK);

  testVip("vip600 Phase-2 Configuring Risk Stewards", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [RISK_ORACLE_ABI, RSR_ABI, STEWARD_ABI],
        [
          "AuthorizedSenderAdded",
          "UpdateTypeAdded",
          "RiskParameterConfigUpdated",
          "ExecutorStatusUpdated",
          "SafeDeltaBpsUpdated",
        ],
        [1, 4, 4, 1, 2],
      );
    },
  });

  describe("Post-VIP Phase-2 behavior", () => {
    describe("Risk Oracle Configuration", () => {
      it("should add authorized senders to Risk Oracle", async () => {
        for (const sender of RISK_PARAMETER_SENDER) {
          expect(await riskOracle.authorizedSenders(sender)).to.be.true;
        }
      });

      it("should add all update types to Risk Oracle", async () => {
        expect(await riskOracle.getAllUpdateTypes()).to.deep.equal(UPDATE_TYPES);
      });
    });

    describe("Risk Steward Receiver Configuration", () => {
      it("should configure risk parameters for SupplyCap", async () => {
        const config = await riskStewardReceiver.getRiskParameterConfig(UPDATE_TYPES[0]);
        expect(config.riskSteward).to.equal(MARKETCAP_STEWARD);
        expect(config.debounce).to.equal(TEN_MINUTES);
        expect(config.timelock).to.equal(FIVE_MINUTES);
        expect(config.active).to.be.true;
      });

      it("should configure risk parameters for BorrowCap", async () => {
        const config = await riskStewardReceiver.getRiskParameterConfig(UPDATE_TYPES[1]);
        expect(config.riskSteward).to.equal(MARKETCAP_STEWARD);
        expect(config.debounce).to.equal(TEN_MINUTES);
        expect(config.timelock).to.equal(FIVE_MINUTES);
        expect(config.active).to.be.true;
      });

      it("should configure risk parameters for CollateralFactors", async () => {
        const config = await riskStewardReceiver.getRiskParameterConfig(UPDATE_TYPES[2]);
        expect(config.riskSteward).to.equal(COLLATERALFACTORS_STEWARD);
        expect(config.debounce).to.equal(TEN_MINUTES);
        expect(config.timelock).to.equal(FIVE_MINUTES);
        expect(config.active).to.be.true;
      });

      it("should configure risk parameters for IRM", async () => {
        const config = await riskStewardReceiver.getRiskParameterConfig(UPDATE_TYPES[3]);
        expect(config.riskSteward).to.equal(IRM_STEWARD);
        expect(config.debounce).to.equal(TEN_MINUTES);
        expect(config.timelock).to.equal(FIVE_MINUTES);
        expect(config.active).to.be.true;
      });

      it("should whitelist executors", async () => {
        for (const executor of WHITELISTED_EXECUTORS) {
          expect(await riskStewardReceiver.whitelistedExecutors(executor)).to.be.true;
        }
      });
    });

    describe("Steward Safe Delta Configuration", () => {
      it("should set safe delta BPS for Market Cap Steward to 40%", async () => {
        expect(await marketCapSteward.safeDeltaBps()).to.equal(4000);
      });

      it("should set safe delta BPS for Collateral Factor Steward to 40%", async () => {
        expect(await collateralFactorSteward.safeDeltaBps()).to.equal(4000);
      });
    });

    describe("Cross-chain peer connections", () => {
      it("should set peer for RISK_STEWARD_RECEIVER (RSR) to SEPOLIA_DESTINATION_STEWARD_RECEIVER (DSR)", async () => {
        const expectedPeer = ethers.utils.hexZeroPad(SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32);
        expect(await riskStewardReceiver.peers(SEPOLIA_EID)).to.equal(expectedPeer.toLowerCase());
      });

      it("should set peer for RISK_STEWARD_RECEIVER (RSR) to ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER (DSR)", async () => {
        const expectedPeer = ethers.utils.hexZeroPad(ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32);
        expect(await riskStewardReceiver.peers(ARBITRUM_SEPOLIA_EID)).to.equal(expectedPeer.toLowerCase());
      });

      it("should set peer for RISK_STEWARD_RECEIVER (RSR) to BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER (DSR)", async () => {
        const expectedPeer = ethers.utils.hexZeroPad(BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32);
        expect(await riskStewardReceiver.peers(BASE_SEPOLIA_EID)).to.equal(expectedPeer.toLowerCase());
      });

      it("should set peer for RISK_STEWARD_RECEIVER (RSR) to OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER (DSR)", async () => {
        const expectedPeer = ethers.utils.hexZeroPad(OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32);
        expect(await riskStewardReceiver.peers(OP_SEPOLIA_EID)).to.equal(expectedPeer.toLowerCase());
      });

      it("should set peer for RISK_STEWARD_RECEIVER (RSR) to UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER (DSR)", async () => {
        const expectedPeer = ethers.utils.hexZeroPad(UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32);
        expect(await riskStewardReceiver.peers(UNICHAIN_SEPOLIA_EID)).to.equal(expectedPeer.toLowerCase());
      });

      it("should set peer for RISK_STEWARD_RECEIVER (RSR) to ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER (DSR)", async () => {
        const expectedPeer = ethers.utils.hexZeroPad(ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32);
        expect(await riskStewardReceiver.peers(ZK_SEPOLIA_EID)).to.equal(expectedPeer.toLowerCase());
      });
    });
  });
});
