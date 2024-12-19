import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PSR } from "../../multisig/proposals/basesepolia/vip-003";
import { PLP, PRIME } from "../../multisig/proposals/basesepolia/vip-007";

export const BOUND_VALIDATOR = "0xC76284488E57554A457A75a8b166fB2ADAB430dB";
export const POOL_REGISTRY = "0xCa330282BEeb07a81963336d0bf8f5f34317916c";
export const VTOKENS = [
  "0x776f14D624aBdAfa912d6Cd0864976DdaF5Ca4a7",
  "0x436E5A07F58AAA86277e8b992bC3e596eC423d09",
  "0xA31D67c056Aadc2501535f2776bF1157904f810e",
];
export const COMPTROLLERS = ["0x272795dd6c5355CF25765F36043F34014454Eb5b"];
export const XVS_STORE = "0x059f1eA3973738C649d63bF4dA18221ecA418cDC";
export const XVS_BRIDGE_ADMIN = "0xE431E82d8fFfd81E7c082BeC7Fe2C306f5c988aD";
export const XVS_BRIDGE = "0xD5Cd1fD17B724a391C1bce55Eb9d88E3205eED60";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

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
        target: XVS_BRIDGE_ADMIN,
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
