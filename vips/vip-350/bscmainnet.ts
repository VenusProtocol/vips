import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PSR as ARBITRUMONE_PSR } from "../../multisig/proposals/arbitrumone/vip-010";
import { PSR as ETHEREUM_PSR } from "../../multisig/proposals/ethereum/vip-053";
import { PSR as OPBNBMAINNET_PSR } from "../../multisig/proposals/opbnbmainnet/vip-020";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

export const ARBITRUMONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

export const ARBITRUM_ONE_FASTTRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
export const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
export const OPBNBMAINNET_FASTTRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";

export const ARBITRUM_ONE_CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";
export const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
export const OPBNBMAINNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";

const { arbitrumone, opbnbmainnet, ethereum } = NETWORK_ADDRESSES;

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
        target: ETHEREUM_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: OPBNBMAINNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // Grant permissions to Normal Timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PSR, "removeDistributionConfig(Schema,address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PSR, "removeDistributionConfig(Schema,address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_PSR, "removeDistributionConfig(Schema,address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // Grant permissions to fast track timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PSR, "removeDistributionConfig(Schema,address)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PSR, "removeDistributionConfig(Schema,address)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_PSR, "removeDistributionConfig(Schema,address)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // Grant permissions to critical timelock
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PSR, "removeDistributionConfig(Schema,address)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PSR, "removeDistributionConfig(Schema,address)", ARBITRUM_ONE_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_PSR, "removeDistributionConfig(Schema,address)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: LzChainId.opbnbmainnet,
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip350;