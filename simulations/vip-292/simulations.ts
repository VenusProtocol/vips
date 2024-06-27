import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import vip292, {
  BNB_TREASURY,
  ETHEREUM_ENDPOINT_ID,
  MAX_DAILY_RECEIVE_LIMIT_ETHEREUM,
  MAX_DAILY_RECEIVE_LIMIT_OP_BNB,
  OP_BNB_ENDPOINT_ID,
  SINGLE_RECEIVE_LIMIT_ETHEREUM,
  SINGLE_RECEIVE_LIMIT_OP_BNB,
} from "../../vips/vip-292/bscmainnet";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(37997157, async () => {
  let xvsBridge: Contract;
  testVip("VIP-292", await vip292(), {});
  describe("Post-Execution state", () => {
    before(async () => {
      xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(OP_BNB_ENDPOINT_ID)).to.equal(
        SINGLE_RECEIVE_LIMIT_OP_BNB,
      );
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(ETHEREUM_ENDPOINT_ID)).to.equal(
        SINGLE_RECEIVE_LIMIT_ETHEREUM,
      );
    });

    it("Should match max daily receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(OP_BNB_ENDPOINT_ID)).to.equal(
        MAX_DAILY_RECEIVE_LIMIT_OP_BNB,
      );
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(ETHEREUM_ENDPOINT_ID)).to.equal(
        MAX_DAILY_RECEIVE_LIMIT_ETHEREUM,
      );
    });

    it("Should whitelist TIMELOCK and TREASURY", async () => {
      let res = await xvsBridge.whitelist(NORMAL_TIMELOCK);
      expect(res).equals(true);
      res = await xvsBridge.whitelist(BNB_TREASURY);
      expect(res).equals(true);
    });
  });
});
