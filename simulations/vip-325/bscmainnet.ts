import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import {
  COMMUNITY_WALLET,
  LAST_REWARD_BLOCK,
  REWARDS_DISTRIBUTOR,
  USDT,
  VBABYDOGE,
  vip325,
} from "../../vips/vip-325/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";

const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);

const EXPECTED_COMMUNITY_USDT = parseUnits("9672.988055366700105059", 18);

forking(39692520, async () => {
  let rewardDistributor: Contract;
  let communityWalletBalanceBefore: BigNumber;

  before(async () => {
    rewardDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR);
    communityWalletBalanceBefore = await usdt.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-325", await vip325());

  describe("Post-VIP behavior", async () => {
    it(`transfers ${formatUnits(EXPECTED_COMMUNITY_USDT, 18)} USDT to community wallet`, async () => {
      const communityWalletBalanceAfter = await usdt.balanceOf(COMMUNITY_WALLET);
      expect(communityWalletBalanceAfter.sub(communityWalletBalanceBefore)).to.equal(EXPECTED_COMMUNITY_USDT);
    });

    it("sets last reward block", async () => {
      const supplyState = await rewardDistributor.rewardTokenSupplyState(VBABYDOGE);
      expect(supplyState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);

      const borrowState = await rewardDistributor.rewardTokenBorrowState(VBABYDOGE);
      expect(borrowState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);
    });
  });
});
