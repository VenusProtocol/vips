import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const PRIME = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";
export const PLP = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";

const vip052 = () => {
  return makeProposal([
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },

    // Revoke permissions
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setTokensDistributionSpeed(address[],uint256[])", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setMaxTokensDistributionSpeed(address[],uint256[])", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setMaxLoopsLimit(uint256)", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "updateAlpha(uint128,uint128)", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "updateMultipliers(address,uint256,uint256)", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setStakedAt(address[],uint256[])", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "addMarket(address,address,uint256,uint256)", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setLimit(uint256,uint256)", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setMaxLoopsLimit(uint256)", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "issue(bool,address[])", sepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "burn(address)", sepolia.GUARDIAN],
    },
  ]);
};

export default vip052;