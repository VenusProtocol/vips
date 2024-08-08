import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, opbnbtestnet, sepolia } = NETWORK_ADDRESSES;

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

const vip349 = () => {
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
      {
        target: arbitrumsepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: sepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: opbnbtestnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },

      // Normal Timelock Permissions
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "pause()", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "resume()", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "pause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "resume()", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "pause()", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "resume()", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip349;