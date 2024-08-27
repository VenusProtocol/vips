import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const REWARD_DISTRIBUTORS = ["0x6c65135d102e2Dfa1b0852351cF9b2cbc1788972"];

const vip013 = () => {
  return makeProposal([
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip013;
