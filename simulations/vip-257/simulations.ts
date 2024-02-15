import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip257 } from "../../vips/vip-257/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const PESSIMISTIC_AMOUNT = parseUnits("5000", 18);
const FAIRYPROOF_AMOUNT = parseUnits("15000", 18);
const PESSIMISTIC_RECEIVER = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";

forking(36156965, () => {
  let usdt: ethers.Contract;
  let prevBalancePessimistic: BigNumber;
  let prevBalanceFairyproof: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalancePessimistic = await usdt.balanceOf(PESSIMISTIC_RECEIVER);
    prevBalanceFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
  });

  testVip("VIP-257 Payments Issuance for audits", vip257(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Pessimistic receiver", async () => {
      const currentBalance = await usdt.balanceOf(PESSIMISTIC_RECEIVER);
      const delta = currentBalance.sub(prevBalancePessimistic);
      expect(delta).equals(PESSIMISTIC_AMOUNT);
    });

    it("Should increase balances of Fairyproof receiver", async () => {
      const currentBalance = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
      const delta = currentBalance.sub(prevBalanceFairyproof);
      expect(delta).equals(FAIRYPROOF_AMOUNT);
    });
  });
});
