import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PSR } from "../../multisig/proposals/basesepolia/vip-003";
import {
  BOUND_VALIDATOR,
  COMPTROLLERS,
  PLP,
  POOL_REGISTRY,
  PRIME,
  VTOKENS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../multisig/proposals/basesepolia/vip-007";

const basesepolia = NETWORK_ADDRESSES.basesepolia;
const vip502 = () => {
  const meta = {
    version: "v2",
    title: "VIP-502",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },

      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },

      {
        target: POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      ...COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.basesepolia,
        };
      }),
      ...VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.basesepolia,
        };
      }),
      {
        target: basesepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },

      {
        target: XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: basesepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: basesepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: basesepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: basesepolia.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip502;
