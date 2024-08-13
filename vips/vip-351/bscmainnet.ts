import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { REWARD_DISTRIBUTORS as ARBITRUMONE_REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumone/vip-010";
import { REWARD_DISTRIBUTORS as ETHEREUM_REWARD_DISTRIBUTORS } from "../../multisig/proposals/ethereum/vip-053";

export const ARBITRUMONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const { arbitrumone, ethereum } = NETWORK_ADDRESSES;

const vip351 = () => {
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
      // Grant Normal Timelock permissions
      ...ETHEREUM_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: ETHEREUM_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [rewardDistirbutor, "setRewardTokenSpeeds(address[],uint256[],uint256[])", ethereum.NORMAL_TIMELOCK],
          dstChainId: LzChainId.ethereum,
        };
      }),
      ...ETHEREUM_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: ETHEREUM_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [rewardDistirbutor, "setLastRewardingBlocks(address[],uint32[],uint32[])", ethereum.NORMAL_TIMELOCK],
          dstChainId: LzChainId.ethereum,
        };
      }),

      ...ARBITRUMONE_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: ARBITRUMONE_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [
            rewardDistirbutor,
            "setRewardTokenSpeeds(address[],uint256[],uint256[])",
            arbitrumone.NORMAL_TIMELOCK,
          ],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      ...ARBITRUMONE_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: ARBITRUMONE_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [
            rewardDistirbutor,
            "setLastRewardingBlocks(address[],uint32[],uint32[])",
            arbitrumone.NORMAL_TIMELOCK,
          ],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      ...ARBITRUMONE_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: ARBITRUMONE_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [
            rewardDistirbutor,
            "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
            arbitrumone.NORMAL_TIMELOCK,
          ],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip351;
