import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip199 } from "../../vips/vip-199";
import TREASURY_ABI from "./abi/VTreasury.json";

const RECEIVER = "0x6657911f7411765979da0794840d671be55ba273";
const BNB_AMOUNT = parseUnits("26438.868831443265017372", 18);

forking(33276563, () => {
  let preBalance: BigNumber;
  before(async () => {
    preBalance = await ethers.provider.getBalance(RECEIVER);
  });

  testVip("VIP-200 Transfer BNB reserves to swap them", vip199(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [TREASURY_ABI], ["WithdrawTreasuryBNB"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase receiver BNB balance", async () => {
      const postBalance = await ethers.provider.getBalance(RECEIVER);
      expect(BNB_AMOUNT).to.be.equal(postBalance.sub(preBalance));
    });
  });
});
