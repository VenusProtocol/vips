import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumone, ethereum } = NETWORK_ADDRESSES;
export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

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
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setRewardTokenSpeeds(address[],uint256[],uint256[])", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setLastRewardingBlock(address[],uint32[],uint32[])",
          arbitrumone.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLastRewardingBlocks(address[],uint32[],uint32[])", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
          arbitrumone.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setRewardTokenSpeeds(address[],uint256[],uint256[])", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLastRewardingBlock(address[],uint32[],uint32[])", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLastRewardingBlocks(address[],uint32[],uint32[])", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip356;
