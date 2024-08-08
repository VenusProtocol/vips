import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, opbnbtestnet, sepolia } = NETWORK_ADDRESSES;

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK = "0x0b32Be083f7041608E023007e7802430396a2123";
export const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const OPBNBTESTNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";

export const ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK = "0x14642991184F989F45505585Da52ca6A6a7dD4c8";
export const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
export const OPBNBTESTNET_FASTTRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";

const vip350 = () => {
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
      // Fasttrack Timelock
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "pause()", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "resume()", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "pause()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "resume()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "pause()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "resume()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },


      // Critical Timelock Permissions
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "pause()", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "resume()", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "pause()", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "resume()",SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "pause()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "resume()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip350;