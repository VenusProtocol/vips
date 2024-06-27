import { makeProposal } from "src/utils";

export const REWARDS_DISTRIBUTOR = "0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06";
export const vweETH = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";

// rewardStartBlock + (secondsIn30Days / secondsPerBlock)
// rewardStartBlock can be found here https://etherscan.io/tx/0xab608fa2d5f8be982e0ed164cef2203ea6f7b6817dacee3b6644bdc70c0ec405
export const LAST_REWARD_BLOCK = 19691005 + (30 * 24 * 60 * 60) / 12;

export const vip021 = () => {
  return makeProposal([
    {
      target: REWARDS_DISTRIBUTOR,
      signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
      params: [[vweETH], [LAST_REWARD_BLOCK], [LAST_REWARD_BLOCK]],
      value: "0",
    },
  ]);
};

export default vip021;
