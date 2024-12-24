import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip500, { AMOUNT1, AMOUNT2, USER1, USER2 } from "../../vips/vip-500/bscmainnet";
import XVSAbi from "./abi/ERC20.json";
import XVSOFTProxySrcAbi from "./abi/XVSOFTProxySrcAbi";

const XVSProxyOFT = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

forking(45153610, async () => {
  let prevOutboundAmount: BigNumber;
  let user1PrevXVSBalance: BigNumber;
  let user2PrevXVSBalance: BigNumber;
  let prevBridgeBalance: BigNumber;

  let bridge: Contract;
  let xvs: Contract;
  before(async () => {
    bridge = new ethers.Contract(XVSProxyOFT, XVSOFTProxySrcAbi, ethers.provider);
    xvs = new ethers.Contract(NETWORK_ADDRESSES.bscmainnet.XVS, XVSAbi, ethers.provider);
  });
  describe("Pre-VIP behaviour", () => {
    it("Should have outbound amount", async () => {
      user1PrevXVSBalance = await xvs.balanceOf(USER1);
      user2PrevXVSBalance = await xvs.balanceOf(USER2);
      prevBridgeBalance = await xvs.balanceOf(XVSProxyOFT);
      prevOutboundAmount = await bridge.outboundAmount();
      expect(prevOutboundAmount).equals("1069490327649400000000000");
    });
  });

  testVip("VIP-500 Refund XVS", await vip500(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVSOFTProxySrcAbi], ["FallbackWithdraw"], [2]);
    },
  });

  describe("Post VIP Execution", () => {
    it("should decrease outbound amount", async () => {
      const outboundAmount = await bridge.outboundAmount();
      expect(prevOutboundAmount.sub(outboundAmount)).equals(BigNumber.from(AMOUNT1).add(BigNumber.from(AMOUNT2)));
    });
    it("should decrease bridge balance", async () => {
      const bridgeBalance = await xvs.balanceOf(XVSProxyOFT);
      expect(bridgeBalance).equals(prevBridgeBalance.sub(BigNumber.from(AMOUNT1).add(BigNumber.from(AMOUNT2))));
    });
    it("should increase user XVS balance on BNB", async () => {
      const user1XVSBalance = await xvs.balanceOf(USER1);
      const user2XVSBalance = await xvs.balanceOf(USER2);

      expect(user1XVSBalance).equals(user1PrevXVSBalance.add(AMOUNT1));
      expect(user2XVSBalance).equals(user2PrevXVSBalance.add(AMOUNT2));
    });
  });
});
