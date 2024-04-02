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
} from "../../../proposals/vip-006/vip-006-ethereum";
import { vip016 } from "../../../proposals/vip-016/vip-016-ethereum";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import VTOKEN_ABI from "./abi/vToken.json";

// Start block considered Multisig tx executed https://etherscan.io/tx/0x832d6510cb2d9595d04216436a5fb6248fd2820fd33d0a147497fc3bac07e2f9
const REWARDS_START_BLOCK = 19562819;
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

//TOOD: change block to be any one after the multisig tx for configuring the rewards
forking(19562820, () => {
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
