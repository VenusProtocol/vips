import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUMONE_ACM,
  ARBITRUMONE_CORE_VTOKENS,
  ARBITRUMONE_DST_CHAIN_ID,
  ARBITRUMONE_NEW_VTOKEN_IMPLEMENTATION,
  ARBITRUMONE_NORMAL_TIMELOCK,
  ARBITRUMONE_VTOKEN_BEACON,
} from "./addresses/arbitrumone";
import {
  BASEMAINNET_ACM,
  BASEMAINNET_CORE_VTOKENS,
  BASEMAINNET_DST_CHAIN_ID,
  BASEMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  BASEMAINNET_NORMAL_TIMELOCK,
  BASEMAINNET_VTOKEN_BEACON,
} from "./addresses/basemainnet";
import {
  ETHEREUM_ACM,
  ETHEREUM_CORE_VTOKENS,
  ETHEREUM_DST_CHAIN_ID,
  ETHEREUM_NEW_VTOKEN_IMPLEMENTATION,
  ETHEREUM_NORMAL_TIMELOCK,
  ETHEREUM_VTOKEN_BEACON,
} from "./addresses/ethereum";
import {
  OPBNBMAINNET_ACM,
  OPBNBMAINNET_CORE_VTOKENS,
  OPBNBMAINNET_DST_CHAIN_ID,
  OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  OPBNBMAINNET_NORMAL_TIMELOCK,
  OPBNBMAINNET_VTOKEN_BEACON,
} from "./addresses/opbnbmainnet";
import {
  OPMAINNET_ACM,
  OPMAINNET_CORE_VTOKENS,
  OPMAINNET_DST_CHAIN_ID,
  OPMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  OPMAINNET_NORMAL_TIMELOCK,
  OPMAINNET_VTOKEN_BEACON,
} from "./addresses/opmainnet";
import {
  UNICHAINMAINNET_ACM,
  UNICHAINMAINNET_CORE_VTOKENS,
  UNICHAINMAINNET_DST_CHAIN_ID,
  UNICHAINMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  UNICHAINMAINNET_NORMAL_TIMELOCK,
  UNICHAINMAINNET_VTOKEN_BEACON,
} from "./addresses/unichainmainnet";
import {
  ZKSYNCMAINNET_ACM,
  ZKSYNCMAINNET_CORE_VTOKENS,
  ZKSYNCMAINNET_DST_CHAIN_ID,
  ZKSYNCMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  ZKSYNCMAINNET_NORMAL_TIMELOCK,
  ZKSYNCMAINNET_VTOKEN_BEACON,
} from "./addresses/zksyncmainnet";

interface NetworkConfig {
  name: string;
  acm: string;
  normalTimelock: string;
  vTokenBeacon: string;
  newImplementation: string;
  dstChainId: number;
  coreVTokens: string[];
}

const NETWORKS: NetworkConfig[] = [
  {
    name: "Ethereum",
    acm: ETHEREUM_ACM,
    normalTimelock: ETHEREUM_NORMAL_TIMELOCK,
    vTokenBeacon: ETHEREUM_VTOKEN_BEACON,
    newImplementation: ETHEREUM_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: ETHEREUM_DST_CHAIN_ID,
    coreVTokens: ETHEREUM_CORE_VTOKENS,
  },
  {
    name: "Arbitrum",
    acm: ARBITRUMONE_ACM,
    normalTimelock: ARBITRUMONE_NORMAL_TIMELOCK,
    vTokenBeacon: ARBITRUMONE_VTOKEN_BEACON,
    newImplementation: ARBITRUMONE_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: ARBITRUMONE_DST_CHAIN_ID,
    coreVTokens: ARBITRUMONE_CORE_VTOKENS,
  },
  {
    name: "Optimism",
    acm: OPMAINNET_ACM,
    normalTimelock: OPMAINNET_NORMAL_TIMELOCK,
    vTokenBeacon: OPMAINNET_VTOKEN_BEACON,
    newImplementation: OPMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: OPMAINNET_DST_CHAIN_ID,
    coreVTokens: OPMAINNET_CORE_VTOKENS,
  },
  {
    name: "Base",
    acm: BASEMAINNET_ACM,
    normalTimelock: BASEMAINNET_NORMAL_TIMELOCK,
    vTokenBeacon: BASEMAINNET_VTOKEN_BEACON,
    newImplementation: BASEMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: BASEMAINNET_DST_CHAIN_ID,
    coreVTokens: BASEMAINNET_CORE_VTOKENS,
  },
  {
    name: "opBNB",
    acm: OPBNBMAINNET_ACM,
    normalTimelock: OPBNBMAINNET_NORMAL_TIMELOCK,
    vTokenBeacon: OPBNBMAINNET_VTOKEN_BEACON,
    newImplementation: OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: OPBNBMAINNET_DST_CHAIN_ID,
    coreVTokens: OPBNBMAINNET_CORE_VTOKENS,
  },
  {
    name: "Unichain",
    acm: UNICHAINMAINNET_ACM,
    normalTimelock: UNICHAINMAINNET_NORMAL_TIMELOCK,
    vTokenBeacon: UNICHAINMAINNET_VTOKEN_BEACON,
    newImplementation: UNICHAINMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: UNICHAINMAINNET_DST_CHAIN_ID,
    coreVTokens: UNICHAINMAINNET_CORE_VTOKENS,
  },
  {
    name: "ZkSync",
    acm: ZKSYNCMAINNET_ACM,
    normalTimelock: ZKSYNCMAINNET_NORMAL_TIMELOCK,
    vTokenBeacon: ZKSYNCMAINNET_VTOKEN_BEACON,
    newImplementation: ZKSYNCMAINNET_NEW_VTOKEN_IMPLEMENTATION,
    dstChainId: ZKSYNCMAINNET_DST_CHAIN_ID,
    coreVTokens: ZKSYNCMAINNET_CORE_VTOKENS,
  },
];

export const vip608_2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-608 Upgrade isolated pool VToken implementation across all networks",
    description:
      "Upgrade VToken beacon proxies on 7 networks (Ethereum, Arbitrum, Optimism, Base, opBNB, Unichain, ZkSync). " +
      "For each network: (1) grant syncCash permission to the timelock, (2) call upgradeTo on the VTokenBeacon, " +
      "(3) call syncCash on each Core comptroller VToken to initialize internalCash.",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    NETWORKS.flatMap(({ acm, normalTimelock, vTokenBeacon, newImplementation, dstChainId, coreVTokens }) => [
      // Grant syncCash() permission to the Normal Timelock for each VToken
      ...coreVTokens.map(vToken => ({
        target: acm,
        signature: "giveCallPermission(address,string,address)",
        params: [vToken, "syncCash()", normalTimelock],
        dstChainId,
      })),
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

export default vip608_2;
