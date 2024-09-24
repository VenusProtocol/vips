import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  PLP as ARBITRUMSEPOLIA_PLP,
  PRIME as ARBITRUMSEPOLIA_PRIME,
} from "../../multisig/proposals/arbitrumsepolia/vip-014";
import { REWARD_DISTRIBUTORS as ARBITRUMSEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumsepolia/vip-014";
import { PSR as ARBITRUMSEPOLIA_PSR } from "../../multisig/proposals/arbitrumsepolia/vip-014";
import { COMPTROLLERS as ARBITRUMSEPOLIA_COMPTROLLERS } from "../../multisig/proposals/arbitrumsepolia/vip-014";
import { VTOKENS as ARBITRUMSEPOLIA_VTOKENS } from "../../multisig/proposals/arbitrumsepolia/vip-014";
import { POOL_REGISTRY as ARBITRUMSEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/arbitrumsepolia/vip-014";
import { PSR as OPBNBTESTNET_PSR } from "../../multisig/proposals/opbnbtestnet/vip-021";
import { COMPTROLLERS as OPBNBTESTNET_COMPTROLLERS } from "../../multisig/proposals/opbnbtestnet/vip-021";
import { VTOKENS as OPBNBTESTNET_VTOKENS } from "../../multisig/proposals/opbnbtestnet/vip-021";
import { POOL_REGISTRY as OPBNBTESTNET_POOL_REGISTRY } from "../../multisig/proposals/opbnbtestnet/vip-021";
import { CONVERTERS as SEPOLIA_CONVERTERS } from "../../multisig/proposals/sepolia/vip-060";
import { CONVERTER_NETWORK as SEPOLIA_CONVERTER_NETWORK } from "../../multisig/proposals/sepolia/vip-060";
import { PLP as SEPOLIA_PLP, PRIME as SEPOLIA_PRIME } from "../../multisig/proposals/sepolia/vip-060";
import { REWARD_DISTRIBUTORS as SEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/sepolia/vip-060";
import { PSR as SEPOLIA_PSR } from "../../multisig/proposals/sepolia/vip-060";
import { COMPTROLLERS as SEPOLIA_COMPTROLLERS } from "../../multisig/proposals/sepolia/vip-060";
import { VTOKENS as SEPOLIA_VTOKENS } from "../../multisig/proposals/sepolia/vip-060";
import { POOL_REGISTRY as SEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/sepolia/vip-060";

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
export const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const ARBITRUM_SEPOLIA_XVS_STORE = "0x4e909DA6693215dC630104715c035B159dDb67Dd";
export const SEPOLIA_XVS_STORE = "0x03B868C7858F50900fecE4eBc851199e957b5d3D";
export const OPBNBTESTNET_XVS_STORE = "0x06473fB3f7bF11e2E8EfEcC95aC55ABEFCb2e0A0";

export const SEPOLIA_XVS_BRIDGE_ADMIN = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";
export const OPBNBTESTNET_XVS_BRIDGE_ADMIN = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";

export const ARBITRUM_SEPOLIA_BOUND_VALIDATOR = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
export const SEPOLIA_BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const OPBNBTESTNET_BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";
export const SEPOLIA_sFrxETH_ORACLE = "0x61EB836afA467677e6b403D504fe69D6940e7996";

const vip352 = () => {
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
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: converter,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),
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
export default vip352;
