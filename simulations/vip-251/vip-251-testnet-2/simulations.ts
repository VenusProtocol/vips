import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import {
  DEST_CHAIN_ID,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  vip251Testnet,
} from "../../../vips/vip-251/vip-251-testnet-2";
import XVSProxyOFTSrc_ABI from "./abi/XVSProxyOFTSrc.json";

const XVSProxyOFTSrc = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";

forking(36862380, async () => {
  const provider = ethers.provider;
  let bridge: Contract;

  beforeEach(async () => {
    bridge = new ethers.Contract(XVSProxyOFTSrc, XVSProxyOFTSrc_ABI, provider);
  });

  testVip("vip251Testnet-2", await vip251Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [XVSProxyOFTSrc_ABI],
        [
          "SetMaxSingleTransactionLimit",
          "SetMaxDailyLimit",
          "SetMaxSingleReceiveTransactionLimit",
          "SetMaxDailyReceiveLimit",
          "Failure",
        ],
        [1, 1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Should match single send transaction limit", async () => {
      expect(await bridge.chainIdToMaxSingleTransactionLimit(DEST_CHAIN_ID)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(DEST_CHAIN_ID)).to.equal(SINGLE_RECEIVE_LIMIT);
    });

    it("Should match max daily send limit", async () => {
      expect(await bridge.chainIdToMaxDailyLimit(DEST_CHAIN_ID)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await bridge.chainIdToMaxDailyReceiveLimit(DEST_CHAIN_ID)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });
  });
});
