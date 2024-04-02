import { makeProposal } from "../../../src/utils";
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
} from "../vip-006/vip-006-ethereum";

// TODO: Input the correct REWARDS_START_BLOCK
// Start block considered Multisig tx executed https://etherscan.io/tx/0x832d6510cb2d9595d04216436a5fb6248fd2820fd33d0a147497fc3bac07e2f9
const REWARDS_START_BLOCK = 19562819;
const REWARDS_END_BLOCK_90_DAYS = REWARDS_START_BLOCK + 648000;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 216000;

interface LastRewardBlockConfig {
  distributor: string;
  vTokens: string[];
  lastRewardBlock: number;
}

const lastRewardBlockConfig: LastRewardBlockConfig[] = [
  {
    distributor: REWARD_DISTRIBUTOR_CORE_0,
    vTokens: [VWETH_CORE, VWBTC_CORE, VUSDT_CORE, VUSDC_CORE, VCRVUSD_CORE],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributor: REWARD_DISTRIBUTOR_CORE_1,
    vTokens: [VCRVUSD_CORE],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributor: REWARD_DISTRIBUTOR_CURVE_0,
    vTokens: [VCRV_CURVE, VCRVUSD_CURVE],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributor: REWARD_DISTRIBUTOR_CURVE_1,
    vTokens: [VCRVUSD_CURVE],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributor: REWARD_DISTRIBUTOR_LST_0,
    vTokens: [VWSTETH_LST, VWETH_LST],
    lastRewardBlock: REWARDS_END_BLOCK_90_DAYS,
  },
  {
    distributor: REWARD_DISTRIBUTOR_LST_1,
    vTokens: [VWSTETH_LST],
    lastRewardBlock: REWARDS_END_BLOCK_30_DAYS,
  },
];

export const vip016 = () => {
  return makeProposal([
    ...lastRewardBlockConfig.map(config => {
      const lastRewardBlockArray = new Array(config.vTokens.length).fill(config.lastRewardBlock);
      return {
        target: config.distributor,
        signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
        params: [config.vTokens, lastRewardBlockArray, lastRewardBlockArray],
      };
    }),
  ]);
};
