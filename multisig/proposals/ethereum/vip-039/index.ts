import { makeProposal } from "../../../../src/utils";

export const vsfrxETH = "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E";
export const REWARDS_DISTRIBUTOR_XVS = "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98";

// Reward start block can be found here https://etherscan.io/tx/0x8dfd2bf80e8485f5c8a98f908f6e0d47594ed99bea487d362317f45ea0442133
export const REWARD_START_BLOCK = 20185343;
export const LAST_REWARD_BLOCK = REWARD_START_BLOCK + (90 * 24 * 60 * 60) / 12;

export const vip039 = () => {
  return makeProposal([
    {
      target: REWARDS_DISTRIBUTOR_XVS,
      signature: "setLastRewardingBlocks(address[],uint32[],uint32[])",
      params: [[vsfrxETH], [LAST_REWARD_BLOCK], [LAST_REWARD_BLOCK]],
      value: "0",
    },
  ]);
};

export default vip039;
