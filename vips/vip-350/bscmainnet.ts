import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumone, opbnbmainnet, ethereum } = NETWORK_ADDRESSES;

export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

export const ARBITRUM_ONE_FASTTRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
export const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
export const OPBNBMAINNET_FASTTRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";

export const ARBITRUM_ONE_CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";
export const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
export const OPBNBMAINNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";

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
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "pause()", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "resume()", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "pause()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "resume()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "pause()", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "resume()", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },


      // Critical Timelock Permissions
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "pause()", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "resume()", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "pause()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "resume()",ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "pause()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "resume()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip350;