import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  vip372,
} from "../../vips/vip-372/bscmainnet";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

forking(42508132, async () => {
  let xvsBridge: Contract;

  before(async () => {
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
  });

  describe("Pre-Executing VIP", () => {
    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.zksyncmainnet)).to.equal(
        SINGLE_SEND_LIMIT.div(2),
      );
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.zksyncmainnet)).to.equal(
        SINGLE_RECEIVE_LIMIT.div(2),
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(LzChainId.zksyncmainnet)).to.equal(MAX_DAILY_SEND_LIMIT.div(2));
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.zksyncmainnet)).to.equal(
        MAX_DAILY_RECEIVE_LIMIT.div(2),
      );
    });
  });

  testVip("vip-372", await vip372(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [XVS_BRIDGE_ABI],
        [
          "SetMaxSingleTransactionLimit",
          "SetMaxDailyLimit",
          "SetMaxSingleReceiveTransactionLimit",
          "SetMaxDailyReceiveLimit",
        ],
        [1, 1, 1, 1],
      );
    },
  });
  describe("Post-Execution state", () => {
    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.zksyncmainnet)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.zksyncmainnet)).to.equal(
        SINGLE_RECEIVE_LIMIT,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(LzChainId.zksyncmainnet)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.zksyncmainnet)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });
  });
});
