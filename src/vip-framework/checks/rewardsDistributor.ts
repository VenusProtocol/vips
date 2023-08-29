import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NORMAL_TIMELOCK } from "..";
import ERC20_ABI from "../abi/erc20.json";
import COMPTROLLER_ABI from "../abi/il_comptroller.json";
import REWARDS_DISTRIBUTOR_ABI from "../abi/rewardsDistributor.json";

export interface RewardsDistributorConfig {
  pool: string;
  address: string;
  token: string;
  vToken: string;
  borrowSpeed: BigNumberish;
  supplySpeed: BigNumberish;
  totalRewardsToDistribute: BigNumberish;
}

export const checkRewardsDistributor = (id: RewardsDistributorId, reward: RewardsDistributorConfig) => {
  describe(id, () => {
    let rewardsDistributor: Contract;

    before(async () => {
      rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, reward.address);
    });

    it(`should have rewardToken = "${reward.token}"`, async () => {
      expect(await rewardsDistributor.rewardToken()).to.equal(reward.token);
    });

    it(`should have owner = Normal Timelock`, async () => {
      expect(await rewardsDistributor.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it(`should have borrowSpeed = ${reward.borrowSpeed.toString()}`, async () => {
      expect(await rewardsDistributor.rewardTokenBorrowSpeeds(reward.vToken)).to.equal(reward.borrowSpeed);
    });

    it(`should have supplySpeed = ${reward.supplySpeed.toString()}`, async () => {
      expect(await rewardsDistributor.rewardTokenSupplySpeeds(reward.vToken)).to.equal(reward.supplySpeed);
    });

    it(`should have balance = ${reward.totalRewardsToDistribute.toString()}`, async () => {
      const token = await ethers.getContractAt(ERC20_ABI, reward.token);
      expect(await token.balanceOf(rewardsDistributor.address)).to.equal(reward.totalRewardsToDistribute);
    });

    it(`should be registered in Comptroller`, async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, reward.pool);
      expect(await comptroller.getRewardDistributors()).to.contain(rewardsDistributor.address);
    });
  });
};

export const checkRewardsDistributorPool = (poolAddress: string, expectedNumberOfRewardsDistributors: number) => {
  it(`should have ${expectedNumberOfRewardsDistributors} rewards distributor in pool ${poolAddress}`, async () => {
    const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, poolAddress);
    expect(await comptroller.getRewardDistributors()).to.have.lengthOf(expectedNumberOfRewardsDistributors);
  });
};
