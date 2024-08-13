import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { REWARD_DISTRIBUTORS as ARBITRUMSEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { REWARD_DISTRIBUTORS as SEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/sepolia/vip-052";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

const vip350 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions to Normal Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      ...SEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),

      ...ARBITRUMSEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip350;
