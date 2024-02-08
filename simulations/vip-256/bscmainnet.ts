import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { NORMAL_TIMELOCK, vip256, vBNB, TREASURY } from "../../vips/vip-256/bscmainnet";
import vBNB_ABI from "./abi/vBNB.json";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

forking(35949601, () => {
  let vBNBContract: ethers.Contract;

  before(async () => {
    impersonateAccount(NORMAL_TIMELOCK)
    vBNBContract = new ethers.Contract(vBNB, vBNB_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
  });

  describe("Pre-VIP behavior", async () => {
    it("should have the correct BNB balance", async () => {
      const balance = await ethers.provider.getBalance(NORMAL_TIMELOCK);
      console.log(await ethers.provider.getBalance(TREASURY))
  })
  });

  testVip("VIP-256", vip256(), {
    callbackAfterExecution: async txResponse => {
    //   await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have the correct BNB balance", async () => {
        const balance = await ethers.provider.getBalance(NORMAL_TIMELOCK);
        console.log(await ethers.provider.getBalance(TREASURY))
    })
  });
});
