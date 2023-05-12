import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip117 } from "../../vips/vip-117";
import VBEP20_ABI from "./abi/VBep20Abi.json";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const BORROWER = "0x24e77e5b74b30b026e9996e4bc3329c881e24968";

forking(28140349, () => {
  let vToken: ethers.Contract;
  let prevBalance: number;
  const provider = ethers.provider;

  before(async () => {
    vToken = new ethers.Contract(vETH, VBEP20_ABI, provider);
    prevBalance = await vToken.borrowBalanceStored(BORROWER);
  });

  testVip("VIP-117 Repay ETH debt on behalf debt", vip117());
  describe("Post-VIP behavior", async () => {
    it("Should decrese Borrow Balance Stored", async () => {
      const currentBalance = await vToken.borrowBalanceStored(BORROWER);
      expect(currentBalance).lessThan(prevBalance);
    });
  });
});
