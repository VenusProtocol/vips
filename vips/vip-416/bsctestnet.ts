import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  PLP as ARBITRUMSEPOLIA_PLP,
  PRIME as ARBITRUMSEPOLIA_PRIME,
} from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { REWARD_DISTRIBUTORS as ARBITRUMSEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { PSR as ARBITRUMSEPOLIA_PSR } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { COMPTROLLERS as ARBITRUMSEPOLIA_COMPTROLLERS } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { VTOKENS as ARBITRUMSEPOLIA_VTOKENS } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { POOL_REGISTRY as ARBITRUMSEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { CONVERTER_NETWORK as ARBITRUM_SEPOLIA_CONVERTER_NETWORK } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { PSR as OPBNBTESTNET_PSR } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { COMPTROLLERS as OPBNBTESTNET_COMPTROLLERS } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { VTOKENS as OPBNBTESTNET_VTOKENS } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { POOL_REGISTRY as OPBNBTESTNET_POOL_REGISTRY } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { CONVERTER_NETWORK as SEPOLIA_CONVERTER_NETWORK } from "../../multisig/proposals/sepolia/vip-071";
import { PLP as SEPOLIA_PLP, PRIME as SEPOLIA_PRIME } from "../../multisig/proposals/sepolia/vip-071";
import { REWARD_DISTRIBUTORS as SEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/sepolia/vip-071";
import { PSR as SEPOLIA_PSR } from "../../multisig/proposals/sepolia/vip-071";
import { COMPTROLLERS as SEPOLIA_COMPTROLLERS } from "../../multisig/proposals/sepolia/vip-071";
import { VTOKENS as SEPOLIA_VTOKENS } from "../../multisig/proposals/sepolia/vip-071";
import { POOL_REGISTRY as SEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/sepolia/vip-071";

const vip416 = () => {
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
        target: SEPOLIA_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: SEPOLIA_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARBITRUMSEPOLIA_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUMSEPOLIA_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      ...SEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),

      ...ARBITRUMSEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
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
      {
        target: SEPOLIA_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      ...SEPOLIA_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),
      ...SEPOLIA_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),

      {
        target: ARBITRUMSEPOLIA_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      ...ARBITRUMSEPOLIA_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
      ...ARBITRUMSEPOLIA_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),

      {
        target: OPBNBTESTNET_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      ...OPBNBTESTNET_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbtestnet,
        };
      }),
      ...OPBNBTESTNET_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbtestnet,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip416;
