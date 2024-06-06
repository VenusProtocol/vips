import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip121 } from "../../vips/vip-121";
import VBEP20_ABI from "./abi/VBep20Abi.json";

const vBTC = "0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b";
const BORROWER = "0xef044206db68e40520bfa82d45419d498b4bc7bf";

forking(28538732, async () => {
  testVip("VIP-121 Repay BTC debt on behalf", await vip121(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VBEP20_ABI], ["RepayBorrow", "Failure"], [1, 0]);
    },
  });
});

forking(28538732, async () => {
  describe("Post-VIP behavior", async () => {
    let vToken: Contract;
    let prevBalance: BigNumber;

    before(async () => {
      vToken = new ethers.Contract(vBTC, VBEP20_ABI, ethers.provider);
      prevBalance = await vToken.callStatic.borrowBalanceCurrent(BORROWER);
      await pretendExecutingVip(await vip121());
    });

    it("Should decrese Borrow Balance Stored", async () => {
      const currentBalance = await vToken.callStatic.borrowBalanceCurrent(BORROWER);
      const delta = prevBalance.sub(currentBalance);
      expect(delta).to.be.closeTo(parseUnits("90.32999985", 18), parseUnits("0.000014", 18));
    });
  });
});
