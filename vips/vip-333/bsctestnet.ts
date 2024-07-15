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

export const ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK = "0x0b32Be083f7041608E023007e7802430396a2123";
export const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const OPBNBTESTNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";
export const SEPOLIA_sFrxETH_ORACLE = "0x61EB836afA467677e6b403D504fe69D6940e7996";

export const ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK = "0x14642991184F989F45505585Da52ca6A6a7dD4c8";
export const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
export const OPBNBTESTNET_FASTTRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";

const vip333 = () => {
  const meta = {
    version: "v2",
    title: "VIP-333 give permissions of oracle to Fasttrack & Critical Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Fasttrack Timelock Permissions
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "pause()", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "unpause()", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrumsepolia.CHAINLINK_ORACLE,
          "setDirectPrice(address,uint256)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrumsepolia.REDSTONE_ORACLE,
          "setDirectPrice(address,uint256)",
          ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "pause()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "unpause()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_sFrxETH_ORACLE, "setMaxAllowedPriceDifference(uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "pause()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "unpause()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.BINANCE_ORACLE, "setSymbolOverride(string,string)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      // Critical Timelock Permissions
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "pause()", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "unpause()", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrumsepolia.CHAINLINK_ORACLE,
          "setDirectPrice(address,uint256)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrumsepolia.REDSTONE_ORACLE,
          "setDirectPrice(address,uint256)",
          ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "pause()", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "unpause()", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_sFrxETH_ORACLE, "setMaxAllowedPriceDifference(uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "pause()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "unpause()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.BINANCE_ORACLE, "setSymbolOverride(string,string)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip333;
