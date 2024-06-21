import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip013, {
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  SRC_CHAIN_ID,
} from "../../../proposals/ethereum/vip-014";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS_BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";

const OLD_SINGLE_SEND_LIMIT = parseUnits("10000", 18);
const OLD_MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
const OLD_SINGLE_RECEIVE_LIMIT = parseUnits("10000", 18);
const OLD_MAX_DAILY_RECEIVE_LIMIT = parseUnits("50000", 18);

forking(19431701, async () => {
  let xvsBridge: Contract;

  before(async () => {
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
  });

  describe("Pre-Execution state", () => {
    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(SRC_CHAIN_ID)).to.equal(OLD_SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(SRC_CHAIN_ID)).to.equal(
        OLD_SINGLE_RECEIVE_LIMIT,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(SRC_CHAIN_ID)).to.equal(OLD_MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(SRC_CHAIN_ID)).to.equal(OLD_MAX_DAILY_RECEIVE_LIMIT);
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip013());
    });

    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(SRC_CHAIN_ID)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(SRC_CHAIN_ID)).to.equal(SINGLE_RECEIVE_LIMIT);
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(SRC_CHAIN_ID)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(SRC_CHAIN_ID)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });
  });
});
