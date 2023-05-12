import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip117 } from "../../vips/vip-117";
import VBEP20_ABI from "./abi/VBep20Abi.json";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const BORROWER = "0x24e77e5b74b30b026e9996e4bc3329c881e24968";

forking(28140349, () => {
  testVip("VIP-117 Repay ETH debt on behalf debt", vip117());
});

// Testing the execution of a VIP in this framework spans about 200k blocks, which
// would require about 2.5 ETH tolerance due to the accumulated interest. Here we
// reset the fork to reduce the required tolerance.
forking(28140349, () => {
  describe("Post-VIP behavior", async () => {
    let vToken: ethers.Contract;
    let prevBalance: BigNumber;

    before(async () => {
      vToken = new ethers.Contract(vETH, VBEP20_ABI, ethers.provider);
      prevBalance = await vToken.callStatic.borrowBalanceCurrent(BORROWER);
      await pretendExecutingVip(vip117());
    });

    it("Should decrese Borrow Balance Stored", async () => {
      const currentBalance = await vToken.callStatic.borrowBalanceCurrent(BORROWER);
      const delta = prevBalance.sub(currentBalance);
      expect(delta).to.be.closeTo(parseUnits("1437.5", 18), parseUnits("0.00005", 18));
    });
  });
});
