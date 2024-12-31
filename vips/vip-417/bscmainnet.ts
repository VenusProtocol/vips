import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CONVERTERS as ARBITRUM_ONE_CONVERTERS } from "../../multisig/proposals/arbitrumone/vip-019";
import { CONVERTERS as ETHEREUM_CONVERTERS } from "../../multisig/proposals/ethereum/vip-073";

export const ARBITRUM_ONE_XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const ETHEREUM_XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
export const OPBNBMAINNET_XVS_STORE = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
export const ETHEREUM_XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
export const OPBNBMAINNET_XVS_BRIDGE_ADMIN = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
export const ARBITRUM_XVS_BRIDGE_ADMIN = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";

const ETHEREUM_CHAIN_ID = LzChainId.ethereum;
const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;
const ARBITRUM_CHAIN_ID = LzChainId.arbitrumone;

export const ARBITRUM_ONE_BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const ETHEREUM_BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const OPBNBMAINNET_BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
export const ETHEREUM_sFrxETH_ORACLE = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";

const { arbitrumone, ethereum, opbnbmainnet } = NETWORK_ADDRESSES;

const vip417 = () => {
  const meta = {
    version: "v2",
    title: "VIP-417",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
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
        target: opbnbmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
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
        target: OPBNBMAINNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opbnbmainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ETHEREUM_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNBMAINNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ARBITRUM_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: ETHEREUM_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: arbitrumone.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
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
      {
        target: arbitrumone.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: opbnbmainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: ethereum.VTREASURY,
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip417;
