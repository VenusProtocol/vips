import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUMONE_ACM,
  ARBITRUMONE_CORE_VTOKENS,
  ARBITRUMONE_DST_CHAIN_ID,
  ARBITRUMONE_NORMAL_TIMELOCK,
} from "./addresses/arbitrumone";
import {
  BASEMAINNET_ACM,
  BASEMAINNET_CORE_VTOKENS,
  BASEMAINNET_DST_CHAIN_ID,
  BASEMAINNET_NORMAL_TIMELOCK,
} from "./addresses/basemainnet";
import {
  ETHEREUM_ACM,
  ETHEREUM_CORE_VTOKENS,
  ETHEREUM_DST_CHAIN_ID,
  ETHEREUM_NORMAL_TIMELOCK,
} from "./addresses/ethereum";
import {
  OPBNBMAINNET_ACM,
  OPBNBMAINNET_CORE_VTOKENS,
  OPBNBMAINNET_DST_CHAIN_ID,
  OPBNBMAINNET_NORMAL_TIMELOCK,
} from "./addresses/opbnbmainnet";
import {
  OPMAINNET_ACM,
  OPMAINNET_CORE_VTOKENS,
  OPMAINNET_DST_CHAIN_ID,
  OPMAINNET_NORMAL_TIMELOCK,
} from "./addresses/opmainnet";
import {
  UNICHAINMAINNET_ACM,
  UNICHAINMAINNET_CORE_VTOKENS,
  UNICHAINMAINNET_DST_CHAIN_ID,
  UNICHAINMAINNET_NORMAL_TIMELOCK,
} from "./addresses/unichainmainnet";
import {
  ZKSYNCMAINNET_ACM,
  ZKSYNCMAINNET_CORE_VTOKENS,
  ZKSYNCMAINNET_DST_CHAIN_ID,
  ZKSYNCMAINNET_NORMAL_TIMELOCK,
} from "./addresses/zksyncmainnet";

interface NetworkConfig {
  name: string;
  acm: string;
  normalTimelock: string;
  dstChainId: number;
  coreVTokens: string[];
}

const NETWORKS: NetworkConfig[] = [
  {
    name: "Ethereum",
    acm: ETHEREUM_ACM,
    normalTimelock: ETHEREUM_NORMAL_TIMELOCK,
    dstChainId: ETHEREUM_DST_CHAIN_ID,
    coreVTokens: ETHEREUM_CORE_VTOKENS,
  },
  {
    name: "Arbitrum",
    acm: ARBITRUMONE_ACM,
    normalTimelock: ARBITRUMONE_NORMAL_TIMELOCK,
    dstChainId: ARBITRUMONE_DST_CHAIN_ID,
    coreVTokens: ARBITRUMONE_CORE_VTOKENS,
  },
  {
    name: "Optimism",
    acm: OPMAINNET_ACM,
    normalTimelock: OPMAINNET_NORMAL_TIMELOCK,
    dstChainId: OPMAINNET_DST_CHAIN_ID,
    coreVTokens: OPMAINNET_CORE_VTOKENS,
  },
  {
    name: "Base",
    acm: BASEMAINNET_ACM,
    normalTimelock: BASEMAINNET_NORMAL_TIMELOCK,
    dstChainId: BASEMAINNET_DST_CHAIN_ID,
    coreVTokens: BASEMAINNET_CORE_VTOKENS,
  },
  {
    name: "opBNB",
    acm: OPBNBMAINNET_ACM,
    normalTimelock: OPBNBMAINNET_NORMAL_TIMELOCK,
    dstChainId: OPBNBMAINNET_DST_CHAIN_ID,
    coreVTokens: OPBNBMAINNET_CORE_VTOKENS,
  },
  {
    name: "Unichain",
    acm: UNICHAINMAINNET_ACM,
    normalTimelock: UNICHAINMAINNET_NORMAL_TIMELOCK,
    dstChainId: UNICHAINMAINNET_DST_CHAIN_ID,
    coreVTokens: UNICHAINMAINNET_CORE_VTOKENS,
  },
  {
    name: "ZkSync",
    acm: ZKSYNCMAINNET_ACM,
    normalTimelock: ZKSYNCMAINNET_NORMAL_TIMELOCK,
    dstChainId: ZKSYNCMAINNET_DST_CHAIN_ID,
    coreVTokens: ZKSYNCMAINNET_CORE_VTOKENS,
  },
];

export const vip608_2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-608 Grant syncCash permissions for isolated pool VToken upgrade (all networks)",
    description:
      "Grant syncCash() call permission to the Normal Timelock for each VToken on all remote networks: " +
      "Ethereum, Arbitrum, Optimism, Base, opBNB, Unichain, and ZkSync.",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    NETWORKS.flatMap(({ acm, normalTimelock, dstChainId, coreVTokens }) =>
      // Grant syncCash() permission to the Normal Timelock for each VToken
      coreVTokens.map(vToken => ({
        target: acm,
        signature: "giveCallPermission(address,string,address)",
        params: [vToken, "syncCash()", normalTimelock],
        dstChainId,
      })),
    ),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip608_2;
