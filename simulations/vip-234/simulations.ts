import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip234 } from "../../vips/vip-234";
import XVS_VAULT_ABI from "./abi/xvsVault.json";

const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";

forking(35128529, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;

  before(async () => {
    xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("has reward amount set to 1440 XVS/day", async () => {
      const rewardAmount = await xvsVault.rewardTokenAmountsPerBlock(XVS);
      expect(rewardAmount).to.equal("50000000000000000"); // 1440 XVS per day
    });
  });

  testVip("VIP-234", await vip234(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have updated the reward amount to 1630 XVS/day", async () => {
      const rewardAmount = await xvsVault.rewardTokenAmountsPerBlock(XVS);
      const blocksPerDay = ethers.BigNumber.from("28800");
      const expectedXvsPerDay = ethers.utils.parseUnits("1630", 18);
      const expectedXvsPerBlock = expectedXvsPerDay.div(blocksPerDay);
      expect(rewardAmount).to.equal(expectedXvsPerBlock); // 1630 XVS per day
    });
  });
});
