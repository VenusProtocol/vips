import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { COMPTROLLERS as ARBITRUMSEPOLIA_COMPTROLLERS } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { VTOKENS as ARBITRUMSEPOLIA_VTOKENS } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { POOL_REGISTRY as ARBITRUMSEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { COMPTROLLERS as OPBNBTESTNET_COMPTROLLERS } from "../../multisig/proposals/opbnbtestnet/vip-019";
import { VTOKENS as OPBNBTESTNET_VTOKENS } from "../../multisig/proposals/opbnbtestnet/vip-019";
import { POOL_REGISTRY as OPBNBTESTNET_POOL_REGISTRY } from "../../multisig/proposals/opbnbtestnet/vip-019";
import { COMPTROLLERS as SEPOLIA_COMPTROLLERS } from "../../multisig/proposals/sepolia/vip-052";
import { VTOKENS as SEPOLIA_VTOKENS } from "../../multisig/proposals/sepolia/vip-052";
import { POOL_REGISTRY as SEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/sepolia/vip-052";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

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
export default vip350;
