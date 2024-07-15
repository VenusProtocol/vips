import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const SFrxETHOracle = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const vip042 = () => {
  return makeProposal([
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: ethereum.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: SFrxETHOracle,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },

    // Revoke unnecessary permissions from Guardian
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethereum.RESILIENT_ORACLE, "setOracle(address,address,uint8)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethereum.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", ethereum.GUARDIAN],
    },

    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethereum.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [ethereum.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", ethereum.GUARDIAN],
    },
    {
      target: ETHEREUM_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [SFrxETHOracle, "setMaxAllowedPriceDifference(uint256)", ethereum.GUARDIAN],
    },
  ]);
};

export default vip042;
