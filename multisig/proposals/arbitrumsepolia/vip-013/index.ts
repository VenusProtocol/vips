import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const PRIME = "0xadb04ac4942683bc41e27d18234c8dc884786e89";
export const PLP = "0xe82c2c10f55d3268126c29ec813dc6f086904694";

const vip013 = () => {
  return makeProposal([
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },

    // Revoke permissions
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setTokensDistributionSpeed(address[],uint256[])", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setMaxTokensDistributionSpeed(address[],uint256[])", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PRIME, "setMaxLoopsLimit(uint256)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "updateAlpha(uint128,uint128)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "updateMultipliers(address,uint256,uint256)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setStakedAt(address[],uint256[])", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "addMarket(address,address,uint256,uint256)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setLimit(uint256,uint256)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "setMaxLoopsLimit(uint256)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "issue(bool,address[])", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [PLP, "burn(address)", arbitrumsepolia.GUARDIAN],
    },
  ]);
};

export default vip013;