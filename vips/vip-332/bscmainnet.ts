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

export const ARBITRUM_ONE_FASTTRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
export const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
export const OPBNBMAINNET_FASTTRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";

const vip332 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions of oracle to Normal Timelock & Fasttrack Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Accept ownership of oracles
      {
        target: arbitrumone.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: opbnbmainnet.BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: opbnbmainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: ethereum.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ethereum.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_sFrxETH_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },

      // Normal Timelock Permissions
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "pause()", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "unpause()", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "pause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "unpause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "setOracle(address,address,uint8)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_sFrxETH_ORACLE, "setMaxAllowedPriceDifference(uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "pause()", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "unpause()", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.BINANCE_ORACLE, "setSymbolOverride(string,string)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // Fasttrack Timelock Permissions
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "pause()", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "unpause()", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "pause()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "unpause()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_sFrxETH_ORACLE, "setMaxAllowedPriceDifference(uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "pause()", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "unpause()", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.BINANCE_ORACLE, "setSymbolOverride(string,string)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip332;
