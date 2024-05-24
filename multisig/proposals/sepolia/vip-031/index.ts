import { makeProposal } from "../../../../src/utils";

export const vFRAX = "0x33942B932159A67E3274f54bC4082cbA4A704340";
export const vsFRAX = "0x18995825f033F33fa30CF59c117aD21ff6BdB48c";
export const REWARDS_DISTRIBUTOR_XVS = "0xB60666395bEFeE02a28938b75ea620c7191cA77a";

// Reward start block can be found here https://sepolia.etherscan.io/tx/0x5f31126e305657a54a82182b2a727262941d9e59c5f3158d6da5740d1f037609
export const REWARD_START_BLOCK = 5848930;
export const LAST_REWARD_BLOCK = REWARD_START_BLOCK + (90 * 24 * 60 * 60) / 12;

export const vip031 = () => {
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

export default vip031;
