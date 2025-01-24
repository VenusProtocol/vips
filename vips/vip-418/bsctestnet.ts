import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CONVERTERS as ARBITRUM_SEPOLIA_CONVERTERS } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import {
  PLP as ARBITRUMSEPOLIA_PLP,
  PRIME as ARBITRUMSEPOLIA_PRIME,
} from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { COMPTROLLERS as ARBITRUMSEPOLIA_COMPTROLLERS } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { VTOKENS as ARBITRUMSEPOLIA_VTOKENS } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { POOL_REGISTRY as ARBITRUMSEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { CONVERTER_NETWORK as ARBITRUM_SEPOLIA_CONVERTER_NETWORK } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { NTGs as ARBITRUMSEPOLIA_NTGs } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { REWARD_DISTRIBUTORS as ARBITRUMSEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { PSR as ARBITRUMSEPOLIA_PSR } from "../../multisig/proposals/arbitrumsepolia/vip-020";
import { CONVERTERS as SEPOLIA_CONVERTERS } from "../../multisig/proposals/sepolia/vip-071";
import { CONVERTER_NETWORK as SEPOLIA_CONVERTER_NETWORK } from "../../multisig/proposals/sepolia/vip-071";
import { PLP as SEPOLIA_PLP, PRIME as SEPOLIA_PRIME } from "../../multisig/proposals/sepolia/vip-071";
import { POOL_REGISTRY as SEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/sepolia/vip-071";
import { NTGs as SEPOLIA_NTGs } from "../../multisig/proposals/sepolia/vip-071";
import { REWARD_DISTRIBUTORS as SEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/sepolia/vip-071";
import { PSR as SEPOLIA_PSR } from "../../multisig/proposals/sepolia/vip-071";
import { COMPTROLLERS as ZKSYNCSEPOLIA_COMPTROLLERS } from "../../multisig/proposals/zksyncsepolia/vip-017";
import { VTOKENS as ZKSYNCSEPOLIA_VTOKENS } from "../../multisig/proposals/zksyncsepolia/vip-017";
import { POOL_REGISTRY as ZKSYNCSEPOLIA_POOL_REGISTRY } from "../../multisig/proposals/zksyncsepolia/vip-017";
import { PLP as ZKSYNCSEPOLIA_PLP, PRIME as ZKSYNCSEPOLIA_PRIME } from "../../multisig/proposals/zksyncsepolia/vip-017";
import { NTGs as ZKSYNCSEPOLIA_NTGs } from "../../multisig/proposals/zksyncsepolia/vip-017";
import { PSR as ZKSYNCSEPOLIA_PSR } from "../../multisig/proposals/zksyncsepolia/vip-017";
import { REWARD_DISTRIBUTORS as ZKSYNCSEPOLIA_REWARD_DISTRIBUTORS } from "../../multisig/proposals/zksyncsepolia/vip-017";

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

export const ARBITRUM_SEPOLIA_XVS_STORE = "0x4e909DA6693215dC630104715c035B159dDb67Dd";
export const SEPOLIA_XVS_STORE = "0x03B868C7858F50900fecE4eBc851199e957b5d3D";
export const ZKSYNCSEPOLIA_XVS_STORE = "0xf0DaEFE5f5df4170426F88757EcdF45430332d88";

export const SEPOLIA_XVS_BRIDGE_ADMIN = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";
export const ZKSYNCSEPOLIA_XVS_BRIDGE_ADMIN = "0x28cfE3f2D7D8944FAd162a058260ec922C19065E";
export const ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const ZKSYNCSEPOLIA_CHAIN_ID = LzChainId.zksyncsepolia;
const ARBITRUM_SEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

export const ARBITRUM_SEPOLIA_BOUND_VALIDATOR = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
export const SEPOLIA_BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const ZKSYNCSEPOLIA_BOUND_VALIDATOR = "0x0A4daBeF41C83Af7e30FfC33feC56ba769f3D24b";
export const SEPOLIA_sFrxETH_ORACLE = "0x61EB836afA467677e6b403D504fe69D6940e7996";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const { arbitrumsepolia, sepolia, zksyncsepolia } = NETWORK_ADDRESSES;

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
      ...ZKSYNCSEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncsepolia,
        };
      }),
      {
        target: arbitrumsepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: sepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: zksyncsepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: SEPOLIA_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ZKSYNCSEPOLIA_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ZKSYNCSEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ZKSYNCSEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: arbitrumsepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: arbitrumsepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: arbitrumsepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: zksyncsepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: zksyncsepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: zksyncsepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },

      {
        target: sepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: sepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_sFrxETH_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: arbitrumsepolia.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: zksyncsepolia.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [zksyncsepolia.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [sepolia.NORMAL_TIMELOCK, true],
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
      ...ARBITRUM_SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: converter,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
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
      {
        target: ZKSYNCSEPOLIA_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: SEPOLIA_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
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
        target: ZKSYNCSEPOLIA_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      ...ZKSYNCSEPOLIA_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncsepolia,
        };
      }),
      ...ZKSYNCSEPOLIA_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncsepolia,
        };
      }),
      ...SEPOLIA_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),
      ...ARBITRUMSEPOLIA_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
      ...ZKSYNCSEPOLIA_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncsepolia,
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
        target: ZKSYNCSEPOLIA_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      ...ARBITRUMSEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
      ...SEPOLIA_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip418;
