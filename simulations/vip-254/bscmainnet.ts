import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BRIDGE_ASSETS, OPBNB_BRIDGE, vip254 } from "../../vips/vip-254";
import BRIDGE_ABI from "./abi/bridgeAbi.json";

forking(36070082, () => {
  let prevDeposits: [BigNumber];
  let bridge: Contract;
  const provider = ethers.provider;

  before(async () => {
    bridge = new ethers.Contract(OPBNB_BRIDGE, BRIDGE_ABI, provider);
    BRIDGE_ASSETS.map(async market => {
      const val = await bridge.deposits(market.localAddress, market.remoteAddress);
      prevDeposits.push(val);
    });
  });
  testVip("VIP-254", vip254(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [BRIDGE_ABI], ["ERC20BridgeInitiated", "ETHBridgeInitiated"], [4, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase correct deposits", async () => {
      BRIDGE_ASSETS.map(async (market, i) => {
        const val = await bridge.deposits(market.localAddress, market.remoteAddress);
        expect(val).equals(prevDeposits[i].add(market.amount));
      });
    });
  });
});
