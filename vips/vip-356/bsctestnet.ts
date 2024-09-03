import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, sepolia } = NETWORK_ADDRESSES;
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

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
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setRewardTokenSpeeds(address[],uint256[],uint256[])", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
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
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLastRewardingBlocks(address[],uint32[],uint32[])", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])",
          arbitrumsepolia.GUARDIAN,
        ],
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setRewardTokenSpeeds(address[],uint256[],uint256[])", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
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
