import { makeProposal } from "../../../../src/utils";

export const vFRAX = "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95";
export const vsFRAX = "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe";
export const REWARDS_DISTRIBUTOR_XVS = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";

// Reward start block can be found here https://etherscan.io/tx/0x261395084b5f1a51d331c72ab2f836d10479b6fbb76b6b8b3094ec440e7de032
export const REWARD_START_BLOCK = 19861441;
export const LAST_REWARD_BLOCK = REWARD_START_BLOCK + (90 * 24 * 60 * 60) / 12;

export const vip028 = () => {
  return makeProposal([
    {
      target: REWARDS_DISTRIBUTOR_XVS,
      signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
      params: [
        [vFRAX, vsFRAX],
        [LAST_REWARD_BLOCK, LAST_REWARD_BLOCK],
        [LAST_REWARD_BLOCK, LAST_REWARD_BLOCK],
      ],
      value: "0",
    },
  ]);
};

export default vip028;
