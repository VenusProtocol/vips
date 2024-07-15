import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";

export const vip010 = () => {
  return makeProposal([
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumone.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumone.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },

    // Revoke unnecessary permissions from Guardian
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumone.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumone.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [arbitrumone.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumone.GUARDIAN],
    },
    {
      target: ARBITRUM_ONE_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", arbitrumone.GUARDIAN],
    },
  ]);
};

export default vip010;
