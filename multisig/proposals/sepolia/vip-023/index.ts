import { makeProposal } from "../../../../src/utils";

export const vweETH = "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b";
export const REWARDS_DISTRIBUTOR = "0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A";

// rewardStartBlock + (secondsIn30Days / secondsPerBlock)
// rewardStartBlock can be found here https://sepolia.etherscan.io/tx/0xba2e532efe13bf4af098f31a355c9576a258e24ed143a4c1fa24ddb93a56403e
export const LAST_REWARD_BLOCK = 5674536 + (30 * 24 * 60 * 60) / 12;

export const vip023 = () => {
  return makeProposal([
    {
      target: REWARDS_DISTRIBUTOR,
      signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
      params: [[vweETH], [LAST_REWARD_BLOCK], [LAST_REWARD_BLOCK]],
      value: "0",
    },
  ]);
};

export default vip023;
