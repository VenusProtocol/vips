import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumone, ethereum, opbnbmainnet } = NETWORK_ADDRESSES;
export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

export const ARBITRUM_ONE_PRIME = "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49";
export const ARBITRUM_ONE_PLP = "0x86bf21dB200f29F21253080942Be8af61046Ec29";
export const ETHEREUM_PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";
export const ETHEREUM_PLP = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";

const vip358 = () => {
  const meta = {
    version: "v2",
    title: "VIP-358",
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
        params: [ARBITRUM_ONE_PRIME, "setTokensDistributionSpeed(address[],uint256[])", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PRIME, "setMaxTokensDistributionSpeed(address[],uint256[])", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PRIME, "setMaxLoopsLimit(uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PLP, "updateAlpha(uint128,uint128)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PLP, "updateMultipliers(address,uint256,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PLP, "setStakedAt(address[],uint256[])", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PLP, "addMarket(address,address,uint256,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PLP, "setLimit(uint256,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PLP, "setMaxLoopsLimit(uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PLP, "issue(bool,address[])", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_PLP, "burn(address)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "setTokensDistributionSpeed(address[],uint256[])", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "setMaxTokensDistributionSpeed(address[],uint256[])", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "setMaxLoopsLimit(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "updateAlpha(uint128,uint128)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "updateMultipliers(address,uint256,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "setStakedAt(address[],uint256[])", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "addMarket(address,address,uint256,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "setLimit(uint256,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "setMaxLoopsLimit(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "issue(bool,address[])", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "burn(address)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip358;
