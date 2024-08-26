import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, sepolia } = NETWORK_ADDRESSES;
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const ARBITRUM_SEPOLIA_REWARD_DISTRIBUTORS = ["0x6c65135d102e2Dfa1b0852351cF9b2cbc1788972"];
export const SEPOLIA_REWARD_DISTRIBUTORS = [
  "0xB60666395bEFeE02a28938b75ea620c7191cA77a",
  "0x341f52BfecC10115087e46eB94AA06E384b8925E",
  "0x67dA6435b35d43081c7c27685fAbb2662b7f1290",
  "0xF6D57F8e37b1cb627470b5254fAb08dE07B49A0F",
  "0x4597B9287fE0DF3c5513D66886706E0719bD270f",
  "0xec594364d2B7eB3678f351Ac632cC71E718E0F89",
  "0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A",
];

const vip356 = () => {
  const meta = {
    version: "v2",
    title: "VIP-356",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Revoke Permissions
      ...ARBITRUM_SEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistributor => {
        return {
          target: ARBITRUM_SEPOLIA_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [rewardDistributor, "setRewardTokenSpeeds(address[],uint256[],uint256[])", arbitrumsepolia.GUARDIAN],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setLastRewardingBlock(address[],uint32[],uint32[])",
          arbitrumsepolia.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      ...ARBITRUM_SEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistributor => {
        return {
          target: ARBITRUM_SEPOLIA_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [rewardDistributor, "setLastRewardingBlocks(address[],uint32[],uint32[])", arbitrumsepolia.GUARDIAN],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
      ...ARBITRUM_SEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistributor => {
        return {
          target: ARBITRUM_SEPOLIA_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [
            rewardDistributor,
            "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
            arbitrumsepolia.GUARDIAN,
          ],
        };
      }),

      ...SEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistributor => {
        return {
          target: SEPOLIA_ACM,
          signature: "revokeCallPermission(address,string,address)",
          params: [rewardDistributor, "setRewardTokenSpeeds(address[],uint256[],uint256[])", sepolia.GUARDIAN],
          dstChainId: LzChainId.sepolia,
        };
      }),
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLastRewardingBlock(address[],uint32[],uint32[])", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip356;
