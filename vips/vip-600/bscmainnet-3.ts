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

export const vip602 = () => {
  const meta = {
    version: "v2",
    title: "VIP-602 [Non-BNB Chain] VToken Inflation Attack Patch and Pause Borrowing Across All Markets (part3)",
    description: `This VIP upgrades all VToken market implementations across the seven non-BNB Chain Venus Isolated Pool deployments to patch the donation (exchange rate inflation) attack vulnerability identified following the THE token incident on BNB Chain (March 15, 2026). The companion BNB Chain fix is covered in a separate VIP (VIP-600).

The root cause is that _getCashPrior() previously returned IERC20(underlying).balanceOf(address(this)), which allowed any party to artificially inflate the reported cash — and therefore the exchange rate — by transferring tokens directly to a VToken contract without minting shares.

The fix replaces this with an internalCash storage variable that is only updated by _doTransferIn, _doTransferOut, and badDebtRecovered(). A one-time syncCash() function, gated by the AccessControlManager (ACM), initializes internalCash to the real underlying balance after the upgrade. syncCash() remains callable post-migration for future reconciliation (e.g., airdrops or direct transfers).

A secondary measure, pausing borrowing across all affected markets, was deployed to limit exposure while this patch is prepared. Supply, repay, and withdraw functions were not affected by that pause and continue to operate normally. If this VIP passes, borrowing will be restored across all previously paused non-BNB-chain VToken markets.

#### Changes

**1. Upgrade VToken implementation on all non-BNB Chain Isolated Pool deployments**

Networks: Arbitrum One, Base Mainnet, Ethereum Mainnet, opBNB Mainnet, OP Mainnet, Unichain Mainnet, zkSync Mainnet

- **Beacon upgrade**: VTokenBeacon.upgradeTo(newVTokenImpl) per network
- **Effect**: All VToken proxies on each network begin using the new implementation, which tracks internalCash instead of calling balanceOf(address(this)) in _getCashPrior()

**2. Contract changes in the new VToken implementation**

- VTokenStorage: adds uint256 public internalCash (storage gap reduced from 48 to 47)
- _getCashPrior(): returns internalCash instead of IERC20(underlying).balanceOf(address(this))
- _doTransferIn(): increments internalCash by the actual amount received (balance delta, handles fee-on-transfer tokens)
- _doTransferOut(): decrements internalCash before transfer
- badDebtRecovered(uint256 recoveredAmount_): increments internalCash to keep cash accounting correct during bad debt recovery via Shortfall auctions
- syncCash(): ACM-gated, nonReentrant; sets internalCash = IERC20(underlying).balanceOf(address(this)); emits CashSynced(uint256 oldCash, uint256 newCash)
- VTokenInterface: adds CashSynced event and syncCash() signature

**3. Initialize internalCash via syncCash() on all markets across all seven networks**

- **Function**: syncCash()
- **Caller**: ACM-authorized governance timelock
- **Per market per network**: one call per VToken market
- **Effect**: Sets internalCash to the current real underlying balance, bootstrapping the internal accounting post-upgrade

**4. Unpause borrowing across all affected markets**

- Reverses the precautionary borrow pause applied in the preceding VIP
- Supply, repay, and withdraw were never affected
- Applies per market per network across all seven chains

#### Summary

If approved, this VIP will:
- Upgrade all non-BNB Chain VToken implementations to replace balanceOf-based cash reporting with the internalCash variable, making exchange rate calculations immune to direct token donations
- Call syncCash() on every market post-upgrade to initialize internalCash to the real underlying balance
- Restore borrowing across all previously paused VToken markets on Arbitrum One, Base Mainnet, Ethereum Mainnet, opBNB Mainnet, OP Mainnet, Unichain Mainnet, and zkSync Mainnet
- Ensure badDebtRecovered() correctly updates internalCash during Shortfall auction settlements to prevent exchange rate drift

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

export default vip602;
