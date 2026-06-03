import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUM_MIGRATIONS, ATLAS_ORACLE, BASE_MIGRATIONS, BSC_MIGRATIONS, ETHEREUM_MIGRATIONS } from "./utils/data";

const { bscmainnet } = NETWORK_ADDRESSES;

export type RemoteChainKey = "ethereum" | "arbitrumone" | "basemainnet" | "zksyncmainnet";
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const DST_CHAIN_ID: Record<RemoteChainKey, LzChainId> = {
  ethereum: LzChainId.ethereum,
  arbitrumone: LzChainId.arbitrumone,
  basemainnet: LzChainId.basemainnet,
  zksyncmainnet: LzChainId.zksyncmainnet,
};

// Old aggregators that execute each chain's pre-seeded batch.
export const AUXILIARY_AGGREGATOR: Record<RemoteChainKey, string> = {
  ethereum: "0x884E46c8639c8CaFcf249e34c22575f4dD09E87D",
  arbitrumone: "0xFAC9571b6406aD7c135a34859A121739FFf3C47a",
  basemainnet: "0x26FA3316c344B5d3261c44e67c6a72C926EEB89c",
  zksyncmainnet: "0x0EDD39D9b68e8591B6E71dAd83814B9350b9dD94",
};

// Index of this VIP's batch on each old aggregator.
export const REMOTE_BATCH_INDEX: Record<RemoteChainKey, number> = {
  ethereum: 4,
  arbitrumone: 3,
  basemainnet: 3,
  zksyncmainnet: 0,
};

// New aggregators, pre-wired for future use (bscmainnet is configured directly, the rest via LayerZero).
export const NEW_AGGREGATOR: Record<RemoteChainKey | "bscmainnet", string> = {
  ethereum: "0xc79Cb7efEBd121DC4B39eA141C214606595D665A",
  arbitrumone: "0x768FEf3a88ea92cCF9CAcDf0aB15C4B29B3C1379",
  basemainnet: "0x768FEf3a88ea92cCF9CAcDf0aB15C4B29B3C1379",
  zksyncmainnet: "0x0B906d55025cE88bF713764AAc6F23918a25fA49",
  bscmainnet: "0x528A428748dfE73DFcc844176B401475D1831057",
};

export const NEW_AGGREGATOR_TIMELOCK_SIGS = [
  "executeBatch(uint256)",
  "addAuthorizedBatchers(address[])",
  "removeAuthorizedBatchers(address[])",
];

// Batchers authorized on each new aggregator
const COMMON_BATCHERS: string[] = [
  "0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de",
  "0xb0767a856E5D4cCaF2c11355510d28C4E2922D62",
  "0x9b0A3EAE7f174937d31745B710BbeA68e9D1BEf7",
];
export function newAggregatorBatchers(chainKey: RemoteChainKey | "bscmainnet"): string[] {
  const { GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES[chainKey];
  return [...COMMON_BATCHERS, GUARDIAN, NORMAL_TIMELOCK];
}

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
    { target: aggregator, signature: "executeBatch(uint256)", params: [REMOTE_BATCH_INDEX[chainKey]], dstChainId },
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
      params: [newAggregatorBatchers(chainKey)],
      dstChainId,
    },
  ];
}

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 [Multichain] Oracle Migration: Atlas, Chainlink OEV & RedStone Pivots + CommandsAggregator Wiring",
    description: `#### Summary

This VIP bundles two pieces of work into a single proposal.

**Part A — Oracle configuration migrations** (${
      BSC_MIGRATIONS.length + ETHEREUM_MIGRATIONS.length + ARBITRUM_MIGRATIONS.length + BASE_MIGRATIONS.length
    } markets across BNB Chain, Ethereum, Arbitrum One and Base):

1. **Atlas replaces Binance (BNB Chain).** The Binance Oracle has been rebuilt and renamed the Atlas Oracle; the Binance Oracle will be sunset. Every BNB Chain market that referenced the Binance Oracle is migrated to the Atlas Oracle (already owned by the Normal Timelock with ACM permission since VIP-612). Atlas takes the slot Binance previously held in each market, except for DAI and XVS, where RedStone is promoted to PIVOT and the lower-confidence Atlas feed is demoted to FALLBACK.
2. **Chainlink promoted to MAIN (BNB Chain).** Expanding the Chainlink OEV cooperation, for ADA, BNB, CAKE, USD1, USDC, WBNB and XRP the ResilientOracle MAIN and PIVOT slots are swapped — Chainlink becomes MAIN and RedStone becomes PIVOT. The underlying adapter feeds are unchanged (verified on-chain); this is purely a reordering. The solvBTC market is also reordered (Chainlink OneJump promoted to MAIN, RedStone fundamental moved to PIVOT) between existing adapters.
3. **RedStone added as PIVOT (Ethereum / Arbitrum One / Base).** ${
      ETHEREUM_MIGRATIONS.length + ARBITRUM_MIGRATIONS.length + BASE_MIGRATIONS.length
    } single-source markets currently price from a single MAIN oracle with an empty PIVOT. RedStone is added as PIVOT to those markets. These changes are executed on each remote chain via LayerZero through that chain's pre-seeded auxiliary CommandsAggregator batch.

**Part B — CommandsAggregator infrastructure migration** (BNB Chain, Ethereum, Arbitrum One, Base and zkSync Era): a newly deployed CommandsAggregator is brought into service on every chain. Ownership is accepted, the Normal / FastTrack / Critical timelocks are granted \`executeBatch\`, \`addAuthorizedBatchers\` and \`removeAuthorizedBatchers\` permission, and the batcher allowlist is seeded. On the remote chains the existing (old) auxiliary aggregator is used one final time to execute its pre-seeded batch and is then de-authorized. zkSync Era participates in Part B only — it carries no oracle changes in this VIP.

**BNB Chain actions**

- Configure ${BSC_MIGRATIONS.filter(migration => migration.atlasFeed).length} Atlas feeds on the Atlas Oracle.
- Update the ResilientOracle token config for ${
      BSC_MIGRATIONS.length
    } BNB Chain markets (Atlas migration, Chainlink/RedStone reorder, and the solvBTC MAIN/PIVOT swap).
- Accept ownership of the new CommandsAggregator and seed its batcher allowlist.
- Grant the new CommandsAggregator's three management functions to the timelocks via 9 ACM \`giveCallPermission(aggregator, signature, timelock)\` calls — \`executeBatch(uint256)\`, \`addAuthorizedBatchers(address[])\` and \`removeAuthorizedBatchers(address[])\`, each granted to the Normal, FastTrack and Critical timelocks.

**Ethereum / Arbitrum One / Base / zkSync Era actions (via LayerZero)**

For each remote chain the proposal:

1. Grants the old auxiliary CommandsAggregator the ACM default-admin role.
2. Calls \`executeBatch\` on that aggregator to run its pre-seeded batch. On Ethereum (${
      ETHEREUM_MIGRATIONS.length
    }), Arbitrum One (${ARBITRUM_MIGRATIONS.length}) and Base (${
      BASE_MIGRATIONS.length
    } markets) the batch performs, in order:
   - grants the old aggregator transient ACM permission for \`setValidateConfig\` on the BoundValidator and \`setTokenConfig\` on the RedStone and Resilient oracles;
   - sets the BoundValidator anchor config (stablecoins ±1%, other assets ±5%);
   - configures the RedStone feed on the chain's RedStone Oracle and enables RedStone as PIVOT in the ResilientOracle;
   - revokes those three transient permissions;
   - issues the 9 ACM \`giveCallPermission\` calls for the new CommandsAggregator (each of \`executeBatch\`, \`addAuthorizedBatchers\` and \`removeAuthorizedBatchers\` granted to the Normal, FastTrack and Critical timelocks).

   On zkSync Era the pre-seeded batch contains only those 9 \`giveCallPermission\` calls — no oracle migration.
3. Revokes the old aggregator's admin role.
4. Accepts ownership of the new CommandsAggregator and seeds its batcher allowlist.

#### Notes

- **TWT** and **lisUSD**: Atlas becomes MAIN on an interim basis (no Chainlink adapter is wired yet).
- **asBNB**: unchanged — Atlas has no asBNB feed, so the Binance Oracle remains in place.
- **xSolvBTC** and the Chainlink TWT promotion are out of scope (require new adapters not yet deployed).
- The old auxiliary aggregators only ever hold the admin role transiently within a single transaction (granted, used, then revoked); the simulation asserts they hold no role before or after execution.

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
      // Wire the new CommandsAggregator on BNB Chain
      { target: NEW_AGGREGATOR.bscmainnet, signature: "acceptOwnership()", params: [] },
      ...NEW_AGGREGATOR_TIMELOCK_SIGS.flatMap(signature =>
        [bscmainnet.NORMAL_TIMELOCK, bscmainnet.FAST_TRACK_TIMELOCK, bscmainnet.CRITICAL_TIMELOCK].map(timelock => ({
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [NEW_AGGREGATOR.bscmainnet, signature, timelock],
        })),
      ),
      {
        target: NEW_AGGREGATOR.bscmainnet,
        signature: "addAuthorizedBatchers(address[])",
        params: [newAggregatorBatchers("bscmainnet")],
      },

      // =====================================================================================
      // Ethereum / Arbitrum One / Base / zkSync (via LayerZero)
      // =====================================================================================
      ...remoteChainCommands("ethereum"),
      ...remoteChainCommands("arbitrumone"),
      ...remoteChainCommands("basemainnet"),
      ...remoteChainCommands("zksyncmainnet"),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
