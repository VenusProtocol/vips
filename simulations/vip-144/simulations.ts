import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip144 } from "../../vips/vip-144";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import XVS_VAULT_ABI from "./abi/xvsVault.json";

const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const COMMUNITY_WALLET_AMOUNT = parseUnits("9216", 18);

forking(30077578, () => {
  const provider = ethers.provider;
  let xvsVault: Contract;
  let usdt: Contract;
  let prevBalanceCommunityWallet: BigNumber;

  before(async () => {
    xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, provider);
    prevBalanceCommunityWallet = await usdt.balanceOf(COMMUNITY_WALLET);
  });

  describe("Pre-VIP behavior", async () => {
    it("has reward amount set to 1100 XVS/day", async () => {
      const rewardAmount = await xvsVault.rewardTokenAmountsPerBlock(XVS);
      expect(rewardAmount).to.equal("38194444444444445"); // 1100 XVS per day
    });
  });

  testVip("VIP-144", vip144(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have updated the reward amount to 1780 XVS/day", async () => {
      const rewardAmount = await xvsVault.rewardTokenAmountsPerBlock(XVS);
      const blocksPerDay = ethers.BigNumber.from("28800");
      const expectedXvsPerDay = ethers.utils.parseUnits("1780", 18);
      const expectedXvsPerBlock = expectedXvsPerDay.div(blocksPerDay);
      expect(rewardAmount).to.equal(expectedXvsPerBlock); // 1780 XVS per day
    });

    it("Should increase balances of Community wallet", async () => {
      const currentBalance = await usdt.balanceOf(COMMUNITY_WALLET);
      const delta = currentBalance.sub(prevBalanceCommunityWallet);
      expect(delta).equals(COMMUNITY_WALLET_AMOUNT);
    });
  });
});
