import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { COMPTROLLERS as OPBNBMAINNET_COMPTROLLERS } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { VTOKENS as OPBNBMAINNET_VTOKENS } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { POOL_REGISTRY as OPBNBMAINNET_POOL_REGISTRY } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { NTGs as OPBNBMAINNET_NTGs } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { PSR as OPBNBMAINNET_PSR } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { PLP as OPMAINNET_PLP, PRIME as OPMAINNET_PRIME } from "../../multisig/proposals/opmainnet/vip-007";
import { COMPTROLLERS as OPMAINNET_COMPTROLLERS } from "../../multisig/proposals/opmainnet/vip-007";
import { VTOKENS as OPMAINNET_VTOKENS } from "../../multisig/proposals/opmainnet/vip-007";
import { POOL_REGISTRY as OPMAINNET_POOL_REGISTRY } from "../../multisig/proposals/opmainnet/vip-007";
import { NTGs as OPMAINNET_NTGs } from "../../multisig/proposals/opmainnet/vip-007";
import { PSR as OPMAINNET_PSR } from "../../multisig/proposals/opmainnet/vip-007";

export const OPMAINNET_XVS_STORE = "0xFE548630954129923f63113923eF5373E10589d3";
export const OPBNBMAINNET_XVS_STORE = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
export const OPBNBMAINNET_XVS_BRIDGE_ADMIN = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
export const OPMAINNET_XVS_BRIDGE_ADMIN = "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7";

const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;
const OPMAINNET_CHAIN_ID = LzChainId.opmainnet;

export const OPMAINNET_BOUND_VALIDATOR = "0x37A04a1eF784448377a19F2b1b67cD40c09eA505";
export const OPBNBMAINNET_BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";

const { opmainnet, opbnbmainnet } = NETWORK_ADDRESSES;

const vip418 = () => {
  const meta = {
    version: "v2",
    title: "VIP-418",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: opmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opbnbmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPMAINNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opmainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPBNBMAINNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opbnbmainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPMAINNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: opmainnet.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opmainnet.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opmainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opbnbmainnet.BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: opbnbmainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: opmainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opbnbmainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: OPMAINNET_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },

      {
        target: OPMAINNET_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      ...OPMAINNET_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opmainnet,
        };
      }),
      ...OPMAINNET_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opmainnet,
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
      ...OPMAINNET_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opmainnet,
        };
      }),

      ...OPBNBMAINNET_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbmainnet,
        };
      }),

      {
        target: OPMAINNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPBNBMAINNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip418;
