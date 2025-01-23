import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CONVERTERS as ARBITRUM_ONE_CONVERTERS } from "../../multisig/proposals/arbitrumone/vip-019";
import { PLP as ARBITRUMONE_PLP, PRIME as ARBITRUMONE_PRIME } from "../../multisig/proposals/arbitrumone/vip-019";
import { COMPTROLLERS as ARBITRUMONE_COMPTROLLERS } from "../../multisig/proposals/arbitrumone/vip-019";
import { VTOKENS as ARBITRUMONE_VTOKENS } from "../../multisig/proposals/arbitrumone/vip-019";
import { POOL_REGISTRY as ARBITRUMONE_POOL_REGISTRY } from "../../multisig/proposals/arbitrumone/vip-019";
import { NTGs as ARBITRUMONE_NTGs } from "../../multisig/proposals/arbitrumone/vip-019";
import { CONVERTER_NETWORK as ARBITRUM_ONE_CONVERTER_NETWORK } from "../../multisig/proposals/arbitrumone/vip-019";
import { PSR as ARBITRUMONE_PSR } from "../../multisig/proposals/arbitrumone/vip-019";
import { CONVERTERS as ETHEREUM_CONVERTERS } from "../../multisig/proposals/ethereum/vip-073";
import { CONVERTER_NETWORK as ETHEREUM_CONVERTER_NETWORK } from "../../multisig/proposals/ethereum/vip-073";
import { PLP as ETHEREUM_PLP, PRIME as ETHEREUM_PRIME } from "../../multisig/proposals/ethereum/vip-073";
import { POOL_REGISTRY as ETHEREUM_POOL_REGISTRY } from "../../multisig/proposals/ethereum/vip-073";
import { NTGs as ETHEREUM_NTGs } from "../../multisig/proposals/ethereum/vip-073";
import { PSR as ETHEREUM_PSR } from "../../multisig/proposals/ethereum/vip-073";
import { COMPTROLLERS as ZKSYNCMAINNET_COMPTROLLERS } from "../../multisig/proposals/zksyncmainnet/vip-017";
import { VTOKENS as ZKSYNCMAINNET_VTOKENS } from "../../multisig/proposals/zksyncmainnet/vip-017";
import { POOL_REGISTRY as ZKSYNCMAINNET_POOL_REGISTRY } from "../../multisig/proposals/zksyncmainnet/vip-017";
import { NTGs as ZKSYNCMAINNET_NTGs } from "../../multisig/proposals/zksyncmainnet/vip-017";
import { PSR as ZKSYNCMAINNET_PSR } from "../../multisig/proposals/zksyncmainnet/vip-017";
import { PLP as ZKSYNCMAINNET_PLP, PRIME as ZKSYNCMAINNET_PRIME } from "../../multisig/proposals/zksyncmainnet/vip-017";
import { REWARD_DISTRIBUTORS as ZKSYNCMAINNET_REWARD_DISTRIBUTORS } from "../../multisig/proposals/zksyncmainnet/vip-017";

export const ARBITRUM_ONE_XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const ETHEREUM_XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
export const ZKSYNCMAINNET_XVS_STORE = "0x84266F552756cBed893b1FFA85248cD99501e3ce";
export const ETHEREUM_XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
export const ZKSYNCMAINNET_XVS_BRIDGE_ADMIN = "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902";
export const ARBITRUM_XVS_BRIDGE_ADMIN = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";

export const ARBITRUM_ONE_BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const ETHEREUM_BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const ZKSYNCMAINNET_BOUND_VALIDATOR = "0x51519cdCDDD05E2ADCFA108f4a960755D9d6ea8b";
export const ETHEREUM_sFrxETH_ORACLE = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";

const { arbitrumone, ethereum, zksyncmainnet } = NETWORK_ADDRESSES;

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
      ...ZKSYNCMAINNET_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncmainnet,
        };
      }),
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ARBITRUM_ONE_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [arbitrumone.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [ethereum.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ZKSYNCMAINNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [zksyncmainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ETHEREUM_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ZKSYNCMAINNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ARBITRUM_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ZKSYNCMAINNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ETHEREUM_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: arbitrumone.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncmainnet.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ARBITRUM_ONE_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: ethereum.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ethereum.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_sFrxETH_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      ...ETHEREUM_CONVERTERS.map(converter => {
        return {
          target: converter,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),
      ...ARBITRUM_ONE_CONVERTERS.map(converter => {
        return {
          target: converter,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      {
        target: ETHEREUM_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUM_ONE_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ZKSYNCMAINNET_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ETHEREUM_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      ...ARBITRUMONE_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      ...ARBITRUMONE_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      {
        target: ZKSYNCMAINNET_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      ...ZKSYNCMAINNET_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncmainnet,
        };
      }),
      ...ZKSYNCMAINNET_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncmainnet,
        };
      }),
      ...ARBITRUMONE_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      ...ETHEREUM_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),
      ...ZKSYNCMAINNET_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncmainnet,
        };
      }),
      {
        target: ETHEREUM_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ZKSYNCMAINNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip418;
