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

export const vip601 = () => {
  const meta = {
    version: "v2",
    title: "VIP-601 [Non-BNB Chain] VToken Inflation Attack Patch and Pause Borrowing Across All Markets (part2)",
    description: `This VIP upgrades all VToken market implementations across the seven non-BNB Chain Venus Isolated Pool deployments to patch the donation (exchange rate inflation) attack vulnerability identified following the THE token incident on BNB Chain (March 15, 2026). The companion BNB Chain fix is covered in a separate VIP.

The root cause is that _getCashPrior() previously returned IERC20(underlying).balanceOf(address(this)), which allowed any party to artificially inflate the reported cash — and therefore the exchange rate — by transferring tokens directly to a VToken contract without minting shares.

The fix replaces this with an internalCash storage variable that is only updated by _doTransferIn, _doTransferOut, and badDebtRecovered(). A one-time syncCash() function, gated by the AccessControlManager (ACM), initializes internalCash to the real underlying balance after the upgrade. syncCash() remains callable post-migration for future reconciliation (e.g., airdrops or direct transfers).

A secondary measure, pausing borrowing across all affected markets, was deployed to limit exposure while this patch is prepared. Supply, repay, and withdraw functions were not affected by that pause and continue to operate normally. If this VIP passes, borrowing will be restored across all previously paused non-BNB-chain VToken markets.

#### Changes

**1. Grant syncCash() permission to the Normal Timelock for each VToken on all non-BNB Chain Isolated Pool deployments**

Networks: Arbitrum One, Base Mainnet, Ethereum Mainnet, opBNB Mainnet, OP Mainnet, Unichain Mainnet, zkSync Mainnet

- **Function**: AccessControlManager.giveCallPermission(vToken, "syncCash()", normalTimelock)
- **Effect**: Authorizes the Normal Timelock to call syncCash() on each VToken market, which is required before the implementation upgrade and cash initialization in VIP-602

#### Summary

If approved, this VIP will:
- Grant syncCash() call permissions to the Normal Timelock for all VToken markets on Arbitrum One, Base Mainnet, Ethereum Mainnet, opBNB Mainnet, OP Mainnet, Unichain Mainnet, and zkSync Mainnet
- Enable the subsequent VIP-602 to upgrade the VToken beacon and initialize internalCash via syncCash() on all affected markets

#### References

- GitHub PR (Isolated Pools patch): [https://github.com/VenusProtocol/isolated-pools/pull/551](https://github.com/VenusProtocol/isolated-pools/pull/551)
- Allez Labs Post-Mortem: [https://community.venus.io/t/the-market-incident-post-mortem/5712](https://community.venus.io/t/the-market-incident-post-mortem/5712)

**Voting options**
- For - I agree that Venus Protocol should proceed with this proposal
- Against - I do not think that Venus Protocol should proceed with this proposal
- Abstain - I am indifferent to whether Venus Protocol proceeds or not`,
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

export default vip601;
