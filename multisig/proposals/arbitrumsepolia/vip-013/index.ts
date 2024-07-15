import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

export const vip013 = () => {
  return makeProposal([
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },

    // Revoke unnecessary permissions from Guardian

    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumsepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumsepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumsepolia.GUARDIAN],
    },
    {
      target: ARBITRUM_SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", arbitrumsepolia.GUARDIAN],
    },
  ]);
};

export default vip013;
