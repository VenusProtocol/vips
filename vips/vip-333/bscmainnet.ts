import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumone, opbnbmainnet, ethereum } = NETWORK_ADDRESSES;

export const ARBITRUM_ONE_BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const ETHEREUM_BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const OPBNBMAINNET_BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
export const ETHEREUM_sFrxETH_ORACLE = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";

export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

export const ARBITRUM_ONE_CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";
export const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
export const OPBNBMAINNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";

const vip333 = () => {
  const meta = {
    version: "v2",
    title: "VIP-333 give permissions of oracle to Critical Timelock & revoke unnecessary permissions from guardian",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Critical Timelock Permissions
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "pause()", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "unpause()", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "pause()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "unpause()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_sFrxETH_ORACLE, "setMaxAllowedPriceDifference(uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "pause()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "unpause()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.BINANCE_ORACLE, "setSymbolOverride(string,string)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // Revoke unnecessary permissions from Guardian

      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "setOracle(address,address,uint8)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_sFrxETH_ORACLE, "setMaxAllowedPriceDifference(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBMAINNET_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip333;
