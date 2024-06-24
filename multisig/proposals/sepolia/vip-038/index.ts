import { makeProposal } from "../../../../src/utils";

export const vsfrxETH = "0x83F63118dcAAdAACBFF36D78ffB88dd474309e70";
export const REWARDS_DISTRIBUTOR_XVS = "0x4597B9287fE0DF3c5513D66886706E0719bD270f";

// Reward start block can be found here https://sepolia.etherscan.io/tx/0x16d7469ba0f5942d4ca615e73a012c23cdfb7b3bbdd8af1a7bfcbe637476ad98
export const REWARD_START_BLOCK = 6154961;
export const LAST_REWARD_BLOCK = REWARD_START_BLOCK + (90 * 24 * 60 * 60) / 12;

export const vip038 = () => {
  return makeProposal([
    {
      target: REWARDS_DISTRIBUTOR_XVS,
      signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
      params: [[vsfrxETH], [LAST_REWARD_BLOCK], [LAST_REWARD_BLOCK]],
      value: "0",
    },
  ]);
};

export default vip038;
