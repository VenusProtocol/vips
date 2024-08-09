import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumone, opbnbmainnet, ethereum } = NETWORK_ADDRESSES;

export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

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
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: opbnbmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // Normal Timelock Permissions
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "pause()", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "resume()", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrumone.XVS_VAULT_PROXY,
          "add(address,uint256,address,uint256,uint256)",
          arbitrumone.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "set(address,uint256,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrumone.XVS_VAULT_PROXY,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
          arbitrumone.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          arbitrumone.XVS_VAULT_PROXY,
          "setWithdrawalLockingPeriod(address,uint256,uint256)",
          arbitrumone.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "pause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "resume()", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "set(address,uint256,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethereum.XVS_VAULT_PROXY,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
          ethereum.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ethereum.XVS_VAULT_PROXY,
          "setWithdrawalLockingPeriod(address,uint256,uint256)",
          ethereum.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "pause()", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "resume()", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          opbnbmainnet.XVS_VAULT_PROXY,
          "add(address,uint256,address,uint256,uint256)",
          opbnbmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          opbnbmainnet.XVS_VAULT_PROXY,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
          opbnbmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          opbnbmainnet.XVS_VAULT_PROXY,
          "setWithdrawalLockingPeriod(address,uint256,uint256)",
          opbnbmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip349;
