import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip003, {
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  SRC_CHAIN_ID,
  XVS_MINT_CAP,
} from "../../../proposals/opbnbtestnet/vip-003/addendum-1";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS_BRIDGE = "0xA03205bC635A772E533E7BE36b5701E331a70ea3";
const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";

forking(18417812, async () => {
  let xvs: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip003());
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

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE);
      expect(cap).equals(XVS_MINT_CAP);
    });
  });
});
