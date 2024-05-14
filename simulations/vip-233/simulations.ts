import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip233 } from "../../vips/vip-233";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const DESTINATION_ADDRESS = "0x48e9d2128321cbf75cd108321459865357c00f15";
const WITDRAW_AMOUNT = "2100253000000000000000000";

forking(34977135, async () => {
  let usdt: Contract;
  let prevBalance: any;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalance = await usdt.balanceOf(DESTINATION_ADDRESS);
  });

  testVip("VIP-233", await vip233(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balance of the destination wallet", async () => {
      const currentBalance = await usdt.balanceOf(DESTINATION_ADDRESS);
      const delta = currentBalance.sub(prevBalance);
      expect(delta).equals(WITDRAW_AMOUNT);
    });
  });
});
