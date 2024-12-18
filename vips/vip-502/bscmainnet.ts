import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PSR } from "../../multisig/proposals/basemainnet/vip-003";
import { PLP, PRIME } from "../../multisig/proposals/basemainnet/vip-007";

export const BOUND_VALIDATOR = "0x66dDE062D3DC1BB5223A0096EbB89395d1f11DB0";
export const POOL_REGISTRY = "0xeef902918DdeCD773D4B422aa1C6e1673EB9136F";
export const VTOKENS = [
  "0x3cb752d175740043Ec463673094e06ACDa2F9a2e",
  "0xEB8A79bD44cF4500943bf94a2b4434c95C008599",
  "0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72",
];
export const COMPTROLLERS = ["0x0C7973F9598AA62f9e03B94E92C967fD5437426C"];
export const XVS_STORE = "0x11b084Cfa559a82AAC0CcD159dBea27899c7955A";
export const XVS_BRIDGE_ADMIN = "0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e";
export const XVS_BRIDGE = "0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const basemainnet = NETWORK_ADDRESSES.basemainnet;
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
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },

      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },

      {
        target: POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      ...COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.basemainnet,
        };
      }),
      ...VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.basemainnet,
        };
      }),
      {
        target: basemainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },

      {
        target: XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: basemainnet.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: basemainnet.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: basemainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: basemainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip502;
