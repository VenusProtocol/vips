import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PSR as ARBITRUMSEPOLIA_PSR } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { PSR as SEPOLIA_PSR } from "../../multisig/proposals/sepolia/vip-052";
import { PSR as OPBNBTESTNET_PSR } from "../../multisig/proposals/opbnbtestnet/vip-019";

import { NETWORK_ADDRESSES } from "src/networkAddresses";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK = "0x0b32Be083f7041608E023007e7802430396a2123";
export const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const OPBNBTESTNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";

export const ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK = "0x14642991184F989F45505585Da52ca6A6a7dD4c8";
export const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
export const OPBNBTESTNET_FASTTRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";

const { arbitrumsepolia, opbnbtestnet, sepolia } = NETWORK_ADDRESSES;

const vip350 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions to Normal Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: SEPOLIA_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUMSEPOLIA_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: OPBNBTESTNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },

      // Grant permissions to Normal Timelock
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_PSR, "removeDistributionConfig(Schema,address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_PSR, "removeDistributionConfig(Schema,address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_PSR, "removeDistributionConfig(Schema,address)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },

      // Grant permissions to fast track timelock
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_PSR, "removeDistributionConfig(Schema,address)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_PSR, "removeDistributionConfig(Schema,address)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_PSR, "removeDistributionConfig(Schema,address)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },

      // Grant permissions to critical timelock
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_PSR, "removeDistributionConfig(Schema,address)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_PSR, "removeDistributionConfig(Schema,address)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_PSR, "removeDistributionConfig(Schema,address)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip350;