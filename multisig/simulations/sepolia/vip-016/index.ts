import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import {
  REWARD_DISTRIBUTOR_CORE_0,
  REWARD_DISTRIBUTOR_CORE_1,
  REWARD_DISTRIBUTOR_CURVE_0,
  REWARD_DISTRIBUTOR_CURVE_1,
  REWARD_DISTRIBUTOR_LST_0,
  REWARD_DISTRIBUTOR_LST_1,
  VCRVUSD_CORE,
  VCRVUSD_CURVE,
  VCRV_CURVE,
  VUSDC_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  VWETH_LST,
  VWSTETH_LST,
} from "../../../proposals/sepolia/vip-006";
import vip016 from "../../../proposals/sepolia/vip-016";
import REWARDS_DISTRIBUTOR_ABI from "../../vip-016/vip-016-sepolia/abi/rewardsDistributor.json";
import VTOKEN_ABI from "../../vip-016/vip-016-sepolia/abi/vToken.json";

// Start block considered Multisig tx executed https://sepolia.etherscan.io/tx/0x9785ef7f2eed457a934b194c5697bb94e060774e3deeecf5e26d58d37c764bff
const REWARDS_START_BLOCK = 5530143;
const REWARDS_END_BLOCK_90_DAYS = REWARDS_START_BLOCK + 648000;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 216000;

interface LastRewardBlockConfig {
  distributorName: string;
  distributor: string;
  vTokens: string[];
  lastRewardBlock: number;
}

const lastRewardBlockConfig: LastRewardBlockConfig[] = [
  {
    distributorName: "REWARD_DISTRIBUTOR_CORE_0",
    distributor: REWARD_DISTRIBUTOR_CORE_0,
    vTokens: [VWETH_CORE, VWBTC_CORE, VUSDT_CORE, VUSDC_CORE, VCRVUSD_CORE],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributorName: "REWARD_DISTRIBUTOR_CORE_1",
    distributor: REWARD_DISTRIBUTOR_CORE_1,
    vTokens: [VCRVUSD_CORE],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributorName: "REWARD_DISTRIBUTOR_CURVE_0",
    distributor: REWARD_DISTRIBUTOR_CURVE_0,
    vTokens: [VCRV_CURVE, VCRVUSD_CURVE],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributorName: "REWARD_DISTRIBUTOR_CURVE_1",
    distributor: REWARD_DISTRIBUTOR_CURVE_1,
    vTokens: [VCRVUSD_CURVE],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributorName: "REWARD_DISTRIBUTOR_LST_0",
    distributor: REWARD_DISTRIBUTOR_LST_0,
    vTokens: [VWSTETH_LST, VWETH_LST],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributorName: "REWARD_DISTRIBUTOR_LST_1",
    distributor: REWARD_DISTRIBUTOR_LST_1,
    vTokens: [VWSTETH_LST],
    lastRewardBlock: REWARDS_END_BLOCK_30_DAYS,
  },
];

forking(5530144, () => {
  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip016());
    });

    const checkLastRewardingBlock = (
      distributorName: string,
      distributor: string,
      vTokenAddress: string,
      lastRewardingBlock: number,
    ) => {
      describe(distributorName, () => {
        let rewardsDistributor: Contract;
        let vTokenSymbol: string;

        before(async () => {
          rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, distributor);
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
          vTokenSymbol = await vToken.symbol();
        });

        // Moved dynamic part of the title into the test callback
        it(`checks lastRewardingBlock for supply side`, async () => {
          const supplyState = await rewardsDistributor.rewardTokenSupplyState(vTokenAddress);
          expect(supplyState.lastRewardingBlock).to.equal(
            lastRewardingBlock,
            `${vTokenSymbol} should have lastRewardingBlock for supply side equal to "${lastRewardingBlock}"`,
          );
        });

        it(`checks lastRewardingBlock for borrow side`, async () => {
          const borrowState = await rewardsDistributor.rewardTokenBorrowState(vTokenAddress);
          expect(borrowState.lastRewardingBlock).to.equal(
            lastRewardingBlock,
            `${vTokenSymbol} should have lastRewardingBlock for borrow side equal to "${lastRewardingBlock}"`,
          );
        });
      });
    };

    for (const config of lastRewardBlockConfig as LastRewardBlockConfig[]) {
      for (const vToken of config.vTokens) {
        checkLastRewardingBlock(config.distributorName, config.distributor, vToken, config.lastRewardBlock);
      }
    }
  });
});
