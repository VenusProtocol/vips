import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip014, {
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
} from "../../../proposals/arbitrumone/vip-014";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS_BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

forking(256537654, async () => {
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

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip014());
    });

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
