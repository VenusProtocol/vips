import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUM_MIGRATIONS, ATLAS_ORACLE, BASE_MIGRATIONS, BSC_MIGRATIONS, ETHEREUM_MIGRATIONS } from "./utils/data";

const { bscmainnet } = NETWORK_ADDRESSES;

export type RemoteChainKey = "ethereum" | "arbitrumone" | "basemainnet";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const DST_CHAIN_ID: Record<RemoteChainKey, LzChainId> = {
  ethereum: LzChainId.ethereum,
  arbitrumone: LzChainId.arbitrumone,
  basemainnet: LzChainId.basemainnet,
};

// Old aggregators that execute this VIP's remote oracle migration.
export const AUXILIARY_AGGREGATOR: Record<RemoteChainKey, string> = {
  ethereum: "0x884E46c8639c8CaFcf249e34c22575f4dD09E87D",
  arbitrumone: "0xFAC9571b6406aD7c135a34859A121739FFf3C47a",
  basemainnet: "0x26FA3316c344B5d3261c44e67c6a72C926EEB89c",
};

// Index the aggregator batch
export const REMOTE_BATCH_INDEX = 3;

// New aggregators, pre-wired for future use.
export const NEW_AGGREGATOR: Record<RemoteChainKey, string> = {
  ethereum: "0xc79Cb7efEBd121DC4B39eA141C214606595D665A",
  arbitrumone: "0x768FEf3a88ea92cCF9CAcDf0aB15C4B29B3C1379",
  basemainnet: "0x768FEf3a88ea92cCF9CAcDf0aB15C4B29B3C1379",
};

// Same batcher addresses across all (EVM) chains.
export const NEW_AGGREGATOR_BATCHERS: string[] = [bscmainnet.GUARDIAN];

export const NEW_AGGREGATOR_TIMELOCK_SIGS = [
  "executeBatch(uint256)",
  "addAuthorizedBatchers(address[])",
  "removeAuthorizedBatchers(address[])",
];

// Commands to execute on each remote chain.
function remoteChainCommands(chainKey: RemoteChainKey) {
  const { ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES[chainKey];
  const aggregator = AUXILIARY_AGGREGATOR[chainKey];
  const newAggregator = NEW_AGGREGATOR[chainKey];
  const dstChainId = DST_CHAIN_ID[chainKey];

  return [
    {
      target: ACCESS_CONTROL_MANAGER,
      signature: "grantRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, aggregator],
      dstChainId,
    },
    { target: aggregator, signature: "executeBatch(uint256)", params: [REMOTE_BATCH_INDEX], dstChainId },
    {
      target: ACCESS_CONTROL_MANAGER,
      signature: "revokeRole(bytes32,address)",
      params: [DEFAULT_ADMIN_ROLE, aggregator],
      dstChainId,
    },
    { target: newAggregator, signature: "acceptOwnership()", params: [], dstChainId },
    {
      target: newAggregator,
      signature: "addAuthorizedBatchers(address[])",
      params: [NEW_AGGREGATOR_BATCHERS],
      dstChainId,
    },
  ];
}

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [Multichain] Oracle Migration: Atlas, Chainlink OEV & RedStone Pivots",
    description: `#### Summary

This VIP consolidates three oracle configuration migrations into a single proposal, covering 44 markets across BNB Chain, Ethereum, Arbitrum One and Base.

1. **Atlas replaces Binance (BNB Chain).** The Binance Oracle has been rebuilt and renamed Atlas Oracle and the Binance Oracle will be sunset. Every BNB Chain market that referenced the Binance Oracle is migrated to the Atlas Oracle (already owned by the Normal Timelock with ACM permission since VIP-612). Low-confidence Atlas feeds are placed in the Fallback slot where a trusted third oracle exists (DAI, XVS, BTCB).
2. **Chainlink promoted to MAIN (BNB Chain).** Expanding the Chainlink OEV cooperation, for ADA, BNB, CAKE, USD1, USDC, WBNB and XRP the ResilientOracle MAIN and PIVOT slots are swapped — Chainlink becomes MAIN and RedStone becomes PIVOT. The underlying adapter feeds are unchanged (verified on-chain); this is purely a reordering.
3. **RedStone added as PIVOT (Ethereum / Arbitrum / Base).** 15 single-source markets currently price from a single MAIN oracle with an empty PIVOT. RedStone is added as PIVOT to those markets. These commands are executed on the remote chains via LayerZero.

#### Description

All configuration values were established by reading the current on-chain ResilientOracle and adapter configs and cross-verifying them against the Venus Oracle Mastersheet, atlasoracle.io/feeds and app.redstone.finance push-feeds. Unchanged oracle slots are preserved exactly as configured on-chain.

**BNB Chain actions**

- Configure ${BSC_MIGRATIONS.filter(migration => migration.atlasFeed).length} Atlas feeds on the Atlas Oracle.
- Update the ResilientOracle token config for ${
      BSC_MIGRATIONS.length
    } BNB Chain markets (Atlas migration, Chainlink/RedStone reorder, and the solvBTC MAIN/PIVOT swap).

**Ethereum / Arbitrum One / Base actions (via LayerZero)**

- For ${ETHEREUM_MIGRATIONS.length} Ethereum, ${ARBITRUM_MIGRATIONS.length} Arbitrum One and ${
      BASE_MIGRATIONS.length
    } Base markets: set the BoundValidator anchor config (required to enable a pivot — stablecoins ±1%, other assets ±5%), configure the RedStone feed on each chain's RedStone Oracle, and enable RedStone as PIVOT in the ResilientOracle.

#### Notes

- **TWT** and **lisUSD**: Atlas becomes MAIN on an interim basis (no Chainlink adapter is wired yet).
- **asBNB**: unchanged — Atlas has no asBNB feed, so the Binance Oracle remains in place.
- **xSolvBTC** and the Chainlink TWT promotion are out of scope (require new adapters not yet deployed).

#### Voting options

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // =====================================================================================
      // BNB Chain — Atlas replaces Binance + Chainlink OEV reorder + solvBTC MAIN/PIVOT swap
      // =====================================================================================
      // Set the Atlas feeds
      {
        target: ATLAS_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [
          BSC_MIGRATIONS.filter(migration => migration.atlasFeed).map(migration => [
            migration.asset,
            migration.atlasFeed!.feed,
            migration.atlasFeed!.maxStalePeriod,
          ]),
        ],
      },
      // Re-wire the ResilientOracle for every BNB Chain market
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          BSC_MIGRATIONS.map(migration => [
            migration.asset,
            migration.newOracles,
            migration.newFlags,
            migration.cachingEnabled,
          ]),
        ],
      },

      // =====================================================================================
      // Ethereum / Arbitrum One / Base (via LayerZero)
      // =====================================================================================
      ...remoteChainCommands("ethereum"),
      ...remoteChainCommands("arbitrumone"),
      ...remoteChainCommands("basemainnet"),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
