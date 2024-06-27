import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip214 } from "../../vips/vip-214";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

const COMMUNITY_AMOUNT = parseUnits("300000", 18);

forking(34241740, async () => {
  let usdt: Contract;
  let prevBalanceCommunity: any;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalanceCommunity = await usdt.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-214", await vip214(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balance of Community wallet", async () => {
      const currentBalance = await usdt.balanceOf(COMMUNITY_WALLET);
      const delta = currentBalance.sub(prevBalanceCommunity);
      expect(delta).equals(COMMUNITY_AMOUNT);
    });
  });
});
