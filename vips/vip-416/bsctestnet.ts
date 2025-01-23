import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { COMPTROLLERS as OPBNBTESTNET_COMPTROLLERS } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { VTOKENS as OPBNBTESTNET_VTOKENS } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { POOL_REGISTRY as OPBNBTESTNET_POOL_REGISTRY } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { NTGs as OPBNBTESTNET_NTGs } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { PSR as OPBNBTESTNET_PSR } from "../../multisig/proposals/opbnbtestnet/vip-024";
import { PLP as OPSEPOLIA_PLP, PRIME as OPSEPOLIA_PRIME } from "../../multisig/proposals/opsepolia/vip-008";
import { COMPTROLLERS as OPSEPOLIA_COMPTROLLERS } from "../../multisig/proposals/opsepolia/vip-008";
import { VTOKENS as OPSEPOLIA_VTOKENS } from "../../multisig/proposals/opsepolia/vip-008";
import { POOL_REGISTRY as OPSEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/opsepolia/vip-008";
import { NTGs as OPSEPOLIA_NTGs } from "../../multisig/proposals/opsepolia/vip-008";
import { PSR as OPSEPOLIA_PSR } from "../../multisig/proposals/opsepolia/vip-008";
import { REWARD_DISTRIBUTORS as OPSEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/opsepolia/vip-008";

export const OPSEPOLIA_ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const OPSEPOLIA_XVS_STORE = "0xE888FA54b32BfaD3cE0e3C7D566EFe809a6A0143";
export const OPBNBTESTNET_XVS_STORE = "0x06473fB3f7bF11e2E8EfEcC95aC55ABEFCb2e0A0";

export const OPBNBTESTNET_XVS_BRIDGE_ADMIN = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const OPSEPOLIA_XVS_BRIDGE_ADMIN = "0x6bBcB95eCF9BEc9AE91d5Ad227783e3913145321";

const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;
const OPSEPOLIA_CHAIN_ID = LzChainId.opsepolia;

export const OPSEPOLIA_BOUND_VALIDATOR = "0x482469F1DA6Ec736cacF6361Ec41621f811A6800";
export const OPBNBTESTNET_BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const { opsepolia, opbnbtestnet } = NETWORK_ADDRESSES;

const vip418 = () => {
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
      ...OPSEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opsepolia,
        };
      }),
      {
        target: opsepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: opbnbtestnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPSEPOLIA_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPBNBTESTNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPSEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPSEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: opsepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPSEPOLIA_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: opsepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: opbnbtestnet.BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: opbnbtestnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: opsepolia.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: opbnbtestnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opbnbtestnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPSEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opsepolia.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPSEPOLIA_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPSEPOLIA_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPSEPOLIA_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      ...OPSEPOLIA_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opsepolia,
        };
      }),
      ...OPSEPOLIA_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opsepolia,
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
      ...OPSEPOLIA_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opsepolia,
        };
      }),
      ...OPBNBTESTNET_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbtestnet,
        };
      }),
      {
        target: OPSEPOLIA_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPBNBTESTNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip418;
