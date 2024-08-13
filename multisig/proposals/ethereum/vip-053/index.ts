import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";
export const PLP = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";

const vip053 = () => {
  return makeProposal([
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },

    // Revoke permissions
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setTokensDistributionSpeed(address[],uint256[])", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setMaxTokensDistributionSpeed(address[],uint256[])", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setMaxLoopsLimit(uint256)", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "updateAlpha(uint128,uint128)", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "updateMultipliers(address,uint256,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setStakedAt(address[],uint256[])", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "addMarket(address,address,uint256,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setLimit(uint256,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setMaxLoopsLimit(uint256)", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "issue(bool,address[])", ethereum.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "burn(address)", ethereum.GUARDIAN],
    },
  ]);
};

export default vip053;