import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, opbnbtestnet, sepolia } = NETWORK_ADDRESSES;

export const ARBITRUM_SEPOLIA_BOUND_VALIDATOR = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
export const SEPOLIA_BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const OPBNBTESTNET_BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const SEPOLIA_sFrxETH_ORACLE = "0x61EB836afA467677e6b403D504fe69D6940e7996";

const vip332 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions of oracle to Normal Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Accept ownership of oracles
      {
        target: arbitrumsepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: arbitrumsepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: arbitrumsepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: opbnbtestnet.BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: opbnbtestnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },

      {
        target: sepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: sepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_sFrxETH_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },

      // Normal Timelock Permissions
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "pause()", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "unpause()", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_BOUND_VALIDATOR,
          "setValidateConfig(ValidateConfig)",
          arbitrumsepolia.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "pause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "unpause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_sFrxETH_ORACLE, "setMaxAllowedPriceDifference(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "pause()", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "unpause()", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.BINANCE_ORACLE, "setSymbolOverride(string,string)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip332;
