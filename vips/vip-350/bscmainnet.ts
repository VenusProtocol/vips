import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import {
  COMPTROLLERS as ETHEREUM_COMPTROLLERS,
} from "../../multisig/proposals/ethereum/vip-053";
import {
  VTOKENS as ETHEREUM_VTOKENS,
} from "../../multisig/proposals/ethereum/vip-053";
import {
  POOL_REGISTRY as ETHEREUM_POOL_REGISTRY,
} from "../../multisig/proposals/ethereum/vip-053";
import {
  COMPTROLLERS as ARBITRUMONE_COMPTROLLERS,
} from "../../multisig/proposals/arbitrumone/vip-010";
import {
  VTOKENS as ARBITRUMONE_VTOKENS,
} from "../../multisig/proposals/arbitrumone/vip-010";
import {
  POOL_REGISTRY as ARBITRUMONE_POOL_REGISTRY,
} from "../../multisig/proposals/arbitrumone/vip-010";
import {
  COMPTROLLERS as OPBNBMAINNET_COMPTROLLERS,
} from "../../multisig/proposals/opbnbmainnet/vip-020";
import {
  VTOKENS as OPBNBMAINNET_VTOKENS,
} from "../../multisig/proposals/opbnbmainnet/vip-020";
import {
  POOL_REGISTRY as OPBNBMAINNET_POOL_REGISTRY,
} from "../../multisig/proposals/opbnbmainnet/vip-020";

import { ethers } from "hardhat";

const { arbitrumone, opbnbmainnet, ethereum } = NETWORK_ADDRESSES;

export const ARBITRUMONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";


const vip350 = () => {
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
        target: ETHEREUM_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      ...ETHEREUM_COMPTROLLERS.map((comptroller) => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        }
      }),
      ...ETHEREUM_VTOKENS.map((comptroller) => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        }
      }),

      {
        target: ARBITRUMONE_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      ...ARBITRUMONE_COMPTROLLERS.map((comptroller) => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        }
      }),
      ...ARBITRUMONE_VTOKENS.map((comptroller) => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        }
      }),

      {
        target: OPBNBMAINNET_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      ...OPBNBMAINNET_COMPTROLLERS.map((comptroller) => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbmainnet,
        }
      }),
      ...OPBNBMAINNET_VTOKENS.map((comptroller) => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbmainnet,
        }
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip350;