import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
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

type RewardsDistributorId =
  | "RewardsDistributor_BSW_DeFi"
  | "RewardsDistributor_FLOKI_GameFi"
  | "RewardsDistributor_HAY_Stablecoins"
  | "RewardsDistributor_RACA_GameFi"
  | "RewardsDistributor_BTT_Tron"
  | "RewardsDistributor_TRX_Tron"
  | "RewardsDistributor_USDD_Tron"
  | "RewardsDistributor_WIN_Tron"
  | "RewardsDistributor_ankrBNB_LiquidStakedBNB"
  | "RewardsDistributor_stkBNB_LiquidStakedBNB"
  | "RewardsDistributor_ST_LiquidStakedBNB"
  | "RewardsDistributor_PLANET_DeFi"
  | "RewardsDistributor_agEUR_Stablecoins"
  | "RewardsDistributor_SD_LiquidStakedBNB"
  | "RewardsDistributor_Core_0_WETH"
  | "RewardsDistributor_Core_0_VWBTC"
  | "RewardsDistributor_Core_0_USDT"
  | "RewardsDistributor_Core_0_USDC"
  | "RewardsDistributor_Core_0_CRVUSD"
  | "RewardsDistributor_Core_0_FRAX"
  | "RewardsDistributor_Core_0_SFRAX"
  | "RewardsDistributor_Core_1"
  | "RewardsDistributor_Curve_0_CRV"
  | "RewardsDistributor_Curve_0_CRVUSD"
  | "RewardsDistributor_Curve_1_CRVUSD"
  | "RewardsDistributor_LST_0_WSTETH"
  | "RewardsDistributor_LST_0_WETH"
  | "RewardsDistributor_LST_1_WSTETH"
  | "RewardsDistributor_LST_2_WEETH"
  | "RewardsDistributor_MEME_0_BABYDOGE";
  

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
      expect(await token.balanceOf(rewardsDistributor.address)).to.gte(reward.totalRewardsToDistribute);
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
