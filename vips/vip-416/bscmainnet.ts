import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PLP as ARBITRUMONE_PLP, PRIME as ARBITRUMONE_PRIME } from "../../multisig/proposals/arbitrumone/vip-019";
import { REWARD_DISTRIBUTORS as ARBITRUMONE_REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumone/vip-019";
import { COMPTROLLERS as ARBITRUMONE_COMPTROLLERS } from "../../multisig/proposals/arbitrumone/vip-019";
import { VTOKENS as ARBITRUMONE_VTOKENS } from "../../multisig/proposals/arbitrumone/vip-019";
import { POOL_REGISTRY as ARBITRUMONE_POOL_REGISTRY } from "../../multisig/proposals/arbitrumone/vip-019";
import { PSR as ARBITRUMONE_PSR } from "../../multisig/proposals/arbitrumone/vip-019";
import { CONVERTER_NETWORK as ARBITRUM_ONE_CONVERTER_NETWORK } from "../../multisig/proposals/arbitrumone/vip-019";
import { CONVERTER_NETWORK as ETHEREUM_CONVERTER_NETWORK } from "../../multisig/proposals/ethereum/vip-073";
import { PLP as ETHEREUM_PLP, PRIME as ETHEREUM_PRIME } from "../../multisig/proposals/ethereum/vip-073";
import { REWARD_DISTRIBUTORS as ETHEREUM_REWARD_DISTRIBUTORS } from "../../multisig/proposals/ethereum/vip-073";
import { COMPTROLLERS as ETHEREUM_COMPTROLLERS } from "../../multisig/proposals/ethereum/vip-073";
import { VTOKENS as ETHEREUM_VTOKENS } from "../../multisig/proposals/ethereum/vip-073";
import { POOL_REGISTRY as ETHEREUM_POOL_REGISTRY } from "../../multisig/proposals/ethereum/vip-073";
import { PSR as ETHEREUM_PSR } from "../../multisig/proposals/ethereum/vip-073";
import { COMPTROLLERS as OPBNBMAINNET_COMPTROLLERS } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { VTOKENS as OPBNBMAINNET_VTOKENS } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { POOL_REGISTRY as OPBNBMAINNET_POOL_REGISTRY } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { PSR as OPBNBMAINNET_PSR } from "../../multisig/proposals/opbnbmainnet/vip-024";

const vip416 = () => {
  const meta = {
    version: "v2",
    title: "VIP-416",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ETHEREUM_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUM_ONE_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      ...ETHEREUM_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),

      ...ARBITRUMONE_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
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
      {
        target: ETHEREUM_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      ...ETHEREUM_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),
      ...ETHEREUM_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),

      {
        target: ARBITRUMONE_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      ...ARBITRUMONE_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      ...ARBITRUMONE_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),

      {
        target: OPBNBMAINNET_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      ...OPBNBMAINNET_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbmainnet,
        };
      }),
      ...OPBNBMAINNET_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbmainnet,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip416;
