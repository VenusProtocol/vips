import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUMONE_CORE_VTOKENS,
  ARBITRUMONE_DST_CHAIN_ID,
  ARBITRUMONE_NEW_VTOKEN_IMPLEMENTATION,
  ARBITRUMONE_VTOKEN_BEACON,
} from "./addresses/arbitrumone";
import {
  BASEMAINNET_CORE_VTOKENS,
  BASEMAINNET_DST_CHAIN_ID,
  BASEMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  BASEMAINNET_VTOKEN_BEACON,
} from "./addresses/basemainnet";
import {
  ETHEREUM_CORE_VTOKENS,
  ETHEREUM_DST_CHAIN_ID,
  ETHEREUM_NEW_VTOKEN_IMPLEMENTATION,
  ETHEREUM_VTOKEN_BEACON,
} from "./addresses/ethereum";
import {
  OPBNBMAINNET_CORE_VTOKENS,
  OPBNBMAINNET_DST_CHAIN_ID,
  OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  OPBNBMAINNET_VTOKEN_BEACON,
} from "./addresses/opbnbmainnet";
import {
  OPMAINNET_CORE_VTOKENS,
  OPMAINNET_DST_CHAIN_ID,
  OPMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  OPMAINNET_VTOKEN_BEACON,
} from "./addresses/opmainnet";
import {
  UNICHAINMAINNET_CORE_VTOKENS,
  UNICHAINMAINNET_DST_CHAIN_ID,
  UNICHAINMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  UNICHAINMAINNET_VTOKEN_BEACON,
} from "./addresses/unichainmainnet";
import {
  ZKSYNCMAINNET_CORE_VTOKENS,
  ZKSYNCMAINNET_DST_CHAIN_ID,
  ZKSYNCMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  ZKSYNCMAINNET_VTOKEN_BEACON,
} from "./addresses/zksyncmainnet";

interface NetworkConfig {
  name: string;
  vTokenBeacon: string;
  newImplementation: string;
  dstChainId: number;
  coreVTokens: string[];
}

const NETWORKS: NetworkConfig[] = [
  {
    name: "Ethereum",
    vTokenBeacon: ETHEREUM_VTOKEN_BEACON,
    newImplementation: ETHEREUM_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: ETHEREUM_DST_CHAIN_ID,
    coreVTokens: ETHEREUM_CORE_VTOKENS,
  },
  {
    name: "Arbitrum",
    vTokenBeacon: ARBITRUMONE_VTOKEN_BEACON,
    newImplementation: ARBITRUMONE_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: ARBITRUMONE_DST_CHAIN_ID,
    coreVTokens: ARBITRUMONE_CORE_VTOKENS,
  },
  {
    name: "Optimism",
    vTokenBeacon: OPMAINNET_VTOKEN_BEACON,
    newImplementation: OPMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: OPMAINNET_DST_CHAIN_ID,
    coreVTokens: OPMAINNET_CORE_VTOKENS,
  },
  {
    name: "Base",
    vTokenBeacon: BASEMAINNET_VTOKEN_BEACON,
    newImplementation: BASEMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: BASEMAINNET_DST_CHAIN_ID,
    coreVTokens: BASEMAINNET_CORE_VTOKENS,
  },
  {
    name: "opBNB",
    vTokenBeacon: OPBNBMAINNET_VTOKEN_BEACON,
    newImplementation: OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: OPBNBMAINNET_DST_CHAIN_ID,
    coreVTokens: OPBNBMAINNET_CORE_VTOKENS,
  },
  {
    name: "Unichain",
    vTokenBeacon: UNICHAINMAINNET_VTOKEN_BEACON,
    newImplementation: UNICHAINMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: UNICHAINMAINNET_DST_CHAIN_ID,
    coreVTokens: UNICHAINMAINNET_CORE_VTOKENS,
  },
  {
    name: "ZkSync",
    vTokenBeacon: ZKSYNCMAINNET_VTOKEN_BEACON,
    newImplementation: ZKSYNCMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: ZKSYNCMAINNET_DST_CHAIN_ID,
    coreVTokens: ZKSYNCMAINNET_CORE_VTOKENS,
  },
];

export const vip608_3 = () => {
  const meta = {
    version: "v2",
    title: "VIP-608 Upgrade VToken beacon and syncCash for isolated pools (all networks)",
    description:
      "Upgrade VToken beacon proxies and call syncCash on each VToken on all remote networks: " +
      "Ethereum, Arbitrum, Optimism, Base, opBNB, Unichain, and ZkSync. " +
      "For each network: (1) call upgradeTo on the VTokenBeacon, (2) call syncCash on each VToken to initialize internalCash.",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    NETWORKS.flatMap(({ vTokenBeacon, newImplementation, dstChainId, coreVTokens }) => [
      // Upgrade the beacon to the new implementation
      {
        target: vTokenBeacon,
        signature: "upgradeTo(address)",
        params: [newImplementation],
        dstChainId,
      },
      // Call syncCash on each VToken to initialize internalCash
      ...coreVTokens.map(vToken => ({
        target: vToken,
        signature: "syncCash()",
        params: [],
        dstChainId,
      })),
    ]),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip608_3;
