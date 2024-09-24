import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ARBITRUMONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

export const ARBITRUM_ONE_FASTTRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
export const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
export const OPBNBMAINNET_FASTTRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";

export const ARBITRUM_ONE_CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";
export const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
export const OPBNBMAINNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";

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
export const OPBNBMAINNET_BOUND_VALIDATOR = "0xD1f80C372C6e2FA395A5574Db3e3B4DaF43dAdCE";
export const ETHEREUM_sFrxETH_ORACLE = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";

const { arbitrumone, ethereum, opbnbmainnet } = NETWORK_ADDRESSES;

const vip372 = () => {
  const meta = {
    version: "v2",
    title: "VIP-372",
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip372;
