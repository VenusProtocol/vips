import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import { vip600 as vip600a } from "../../vips/vip-600/bsctestnet";
import vip600, {
  BSCTESTNET_EID,
  DESTINATION_RECEIVER_STEWARD,
  FIVE_MINUTES,
  RISK_STEWARD_RECEIVER,
  SEPOLIA_CF_STEWARD,
  SEPOLIA_IRM_STEWARD,
  SEPOLIA_MC_STEWARD,
  TEN_MINUTES,
  UPDATE_TYPES,
  WHITELISTED_EXECUTORS,
} from "../../vips/vip-600/bsctestnet-2";
import DSR_ABI from "./abi/DestinationStewardReceiver.json";
import STEWARD_ABI from "./abi/MarketCapSteward.json";

forking(9965225, async () => {
  const provider = ethers.provider;
  const destinationReceiverSteward = new ethers.Contract(DESTINATION_RECEIVER_STEWARD, DSR_ABI, provider);
  const sepoliaMcSteward = new ethers.Contract(SEPOLIA_MC_STEWARD, STEWARD_ABI, provider);
  const sepoliaCfSteward = new ethers.Contract(SEPOLIA_CF_STEWARD, STEWARD_ABI, provider);

  testForkedNetworkVipCommands("vip600a Phase-1", await vip600a());

  testForkedNetworkVipCommands("vip600 Phase-2 Configuring Risk Stewards on Sepolia", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [DSR_ABI, STEWARD_ABI],
        ["RiskParameterConfigUpdated", "RemoteDelaySet", "ExecutorStatusUpdated", "SafeDeltaBpsUpdated"],
        [4, 1, 1, 2],
      );
    },
  });

  describe("Post-VIP Phase-2 behavior on Sepolia", () => {
    describe("Destination Receiver Steward Configuration", () => {
      it("should configure risk parameters for SupplyCap on remote chain", async () => {
        const config = await destinationReceiverSteward.getRiskParameterConfig(UPDATE_TYPES[0]);
        expect(config.riskSteward).to.equal(SEPOLIA_MC_STEWARD);
        expect(config.debounce).to.equal(TEN_MINUTES);
        expect(config.active).to.be.true;
      });

      it("should configure risk parameters for BorrowCap on remote chain", async () => {
        const config = await destinationReceiverSteward.getRiskParameterConfig(UPDATE_TYPES[1]);
        expect(config.riskSteward).to.equal(SEPOLIA_MC_STEWARD);
        expect(config.debounce).to.equal(TEN_MINUTES);
        expect(config.active).to.be.true;
      });

      it("should configure risk parameters for CollateralFactors on remote chain", async () => {
        const config = await destinationReceiverSteward.getRiskParameterConfig(UPDATE_TYPES[2]);
        expect(config.riskSteward).to.equal(SEPOLIA_CF_STEWARD);
        expect(config.debounce).to.equal(TEN_MINUTES);
        expect(config.active).to.be.true;
      });

      it("should configure risk parameters for IRM on remote chain", async () => {
        const config = await destinationReceiverSteward.getRiskParameterConfig(UPDATE_TYPES[3]);
        expect(config.riskSteward).to.equal(SEPOLIA_IRM_STEWARD);
        expect(config.debounce).to.equal(TEN_MINUTES);
        expect(config.active).to.be.true;
      });

      it("should set remote delay to 5 minutes", async () => {
        expect(await destinationReceiverSteward.remoteDelay()).to.equal(FIVE_MINUTES);
      });

      it("should whitelist executors on remote chain", async () => {
        for (const executor of WHITELISTED_EXECUTORS) {
          expect(await destinationReceiverSteward.whitelistedExecutors(executor)).to.be.true;
        }
      });
    });

    describe("Remote Steward Safe Delta Configuration", () => {
      it("should set safe delta BPS for Sepolia Market Cap Steward to 40%", async () => {
        expect(await sepoliaMcSteward.safeDeltaBps()).to.equal(4000);
      });

      it("should set safe delta BPS for Sepolia Collateral Factor Steward to 40%", async () => {
        expect(await sepoliaCfSteward.safeDeltaBps()).to.equal(4000);
      });
    });

    describe("Cross-chain peer connections", () => {
      it("should set peer for DESTINATION_RECEIVER_STEWARD (DSR) to RISK_STEWARD_RECEIVER (RSR)", async () => {
        const expectedPeer = ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32);
        expect(await destinationReceiverSteward.peers(BSCTESTNET_EID)).to.equal(expectedPeer.toLowerCase());
      });
    });
  });
});
