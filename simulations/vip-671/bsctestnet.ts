import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip668, { AGGREGATOR, BATCHERS, TIMELOCKS, TIMELOCK_SIGNATURES } from "../../vips/vip-671/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import { checkBatchRoundTrip } from "./utils/checks";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bsctestnet;
const IMPLEMENTATION = "0x692353b70F30f857232b4A6C9164dB5Ac81F7F65";
const PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";

forking(136225835, async () => {
  const aggregator = new Contract(AGGREGATOR, AGGREGATOR_ABI, ethers.provider);
  const acm = new Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);

  const expectTimelockPermissions = async (allowed: boolean, timelocks: string[]) => {
    for (const signature of TIMELOCK_SIGNATURES) {
      for (const timelock of timelocks) {
        expect(
          await acm.isAllowedToCall(timelock, signature, { from: AGGREGATOR }),
          `${signature} ${timelock}`,
        ).to.equal(allowed);
      }
    }
  };

  describe("Pre-VIP behavior", () => {
    it("runs the proposed implementation, with the Normal Timelock as pending owner", async () => {
      const proxyAdmin = new Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
      expect(await proxyAdmin.getProxyImplementation(AGGREGATOR)).to.equal(IMPLEMENTATION);
      expect(await aggregator.owner()).to.not.equal(NORMAL_TIMELOCK);
      expect(await aggregator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });

    it("only the Normal Timelock is permitted so far", async () => {
      await expectTimelockPermissions(true, [NORMAL_TIMELOCK]);
      await expectTimelockPermissions(false, [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]);
    });
  });

  testVip("VIP-668", await vip668(), {
    callbackAfterExecution: async tx => {
      await expectEvents(
        tx,
        [AGGREGATOR_ABI],
        ["OwnershipTransferred", "AuthorizedBatcherUpdated"],
        [1, BATCHERS.length],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Normal Timelock owns the aggregator, every timelock is permitted and the batchers are set", async () => {
      expect(await aggregator.owner()).to.equal(NORMAL_TIMELOCK);
      await expectTimelockPermissions(true, TIMELOCKS);
      await expectTimelockPermissions(false, [CRITICAL_TIMELOCK]);
      for (const batcher of BATCHERS) {
        expect(await aggregator.authorizedBatchers(batcher), batcher).to.equal(true);
      }
    });

    checkBatchRoundTrip({ aggregator: AGGREGATOR, acm: ACCESS_CONTROL_MANAGER, timelock: NORMAL_TIMELOCK });
  });
});
