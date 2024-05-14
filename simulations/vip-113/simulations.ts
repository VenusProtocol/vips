import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip113 } from "../../vips/vip-113";
import XVS_VAULT_ABI from "./abi/xvsVault.json";
import XVS_VAULT_PROXY_ABI from "./abi/xvsVaultProxy.json";

const CURRENT_ADMIN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
const TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";

forking(27865000, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;

  before(async () => {
    xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("has multisig as admin", async () => {
      const admin = await xvsVault.admin();
      expect(admin).to.equal(CURRENT_ADMIN);
    });

    it("has reward amount set to 1700 XVS/day", async () => {
      const rewardAmount = await xvsVault.rewardTokenAmountsPerBlock(XVS);
      expect(rewardAmount).to.equal("59027777777777777"); // 1700 XVS per day
    });
  });

  testVip("VIP-113", await vip113(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_PROXY_ABI], ["NewAdmin"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have updated the admin", async () => {
      const admin = await xvsVault.admin();
      expect(admin).to.equal(TIMELOCK);
    });

    it("should have updated the reward amount to 1100 XVS/day", async () => {
      const rewardAmount = await xvsVault.rewardTokenAmountsPerBlock(XVS);
      const blocksPerDay = ethers.BigNumber.from("28800");
      const expectedXvsPerDay = ethers.utils.parseUnits("1100", 18);
      const expectedXvsPerBlock = expectedXvsPerDay.div(blocksPerDay).add(1); // rounding up
      expect(rewardAmount).to.equal(expectedXvsPerBlock); // 1100 XVS per day
    });
  });
});
