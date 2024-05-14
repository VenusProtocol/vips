import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip118 } from "../../vips/vip-118";
import VBEP20_ABI from "./abi/VBep20Abi.json";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const BORROWER = "0x7589dd3355dae848fdbf75044a3495351655cb1a";

forking(28140349, async () => {
  testVip("VIP-118 Repay ETH debt on behalf debt", await vip118());
});

// Testing the execution of a VIP in this framework spans about 200k blocks, which
// would require about 2.5 ETH tolerance due to the accumulated interest. Here we
// reset the fork to reduce the required tolerance.
forking(28140349, () => {
  describe("Post-VIP behavior", async () => {
    let vToken: Contract;
    let prevBalance: BigNumber;

    before(async () => {
      vToken = new ethers.Contract(vETH, VBEP20_ABI, ethers.provider);
      prevBalance = await vToken.callStatic.borrowBalanceCurrent(BORROWER);
      await pretendExecutingVip(await vip118());
    });

    it("Should decrese Borrow Balance Stored", async () => {
      const currentBalance = await vToken.callStatic.borrowBalanceCurrent(BORROWER);
      const delta = prevBalance.sub(currentBalance);
      expect(delta).to.be.closeTo(parseUnits("1437.5", 18), parseUnits("0.00007", 18));
    });
  });
});
