import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BOUND_VALIDATOR,
  COMPTROLLER,
  NTG,
  PLP,
  POOL_REGISTRY,
  PRIME,
  PSR,
  REWARD_DISTRIBUTOR,
  VTOKENS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../multisig/proposals/unichainsepolia/vip-010";

const { unichainsepolia } = NETWORK_ADDRESSES;

const vip462 = () => {
  const meta = {
    version: "v2",
    title: "VIP-462: Transfer ownership to NT on unichain sepolia",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: unichainsepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setWhitelist(address,bool)",
        params: [unichainsepolia.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: unichainsepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: unichainsepolia.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: COMPTROLLER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      ...VTOKENS.map(vtoken => {
        return {
          target: vtoken,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.unichainsepolia,
        };
      }),
      {
        target: NTG,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },

      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip462;
