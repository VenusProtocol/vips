import { ProposalType } from "src/types";
import { LzChainId } from "src/types";
import { makeProposal } from "src/utils";

import { BASE_CORE, OPBNB, OPTIMISM, UNICHAIN, ZKSYNC_CORE } from "../vip-634/phase4Markets";
import { AGGREGATOR } from "./aggregatorBatches";
import { generateStep2Commands } from "./zeroCollateralParams";

// OpenZeppelin AccessControl DEFAULT_ADMIN_ROLE.
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// Index of this VIP's batch on each chain's CommandsAggregator. Must equal the aggregator's batchCount at
// seed time (verified on-chain 2026-07-06: BSC=1, Ethereum=0, Arbitrum=0). Seed with vip-647/scripts before proposing.
const BATCH_INDEX = { bscmainnet: 1, ethereum: 0, arbitrumone: 0 };

const DST = { ethereum: LzChainId.ethereum, arbitrumone: LzChainId.arbitrumone };

// grant DEFAULT_ADMIN_ROLE → executeBatch(index) → revoke DEFAULT_ADMIN_ROLE, scoped to this proposal.
const aggregatorCommands = (chain: "bscmainnet" | "ethereum" | "arbitrumone") => {
  const { acm, aggregator } = AGGREGATOR[chain];
  const chainRoute = chain === "bscmainnet" ? {} : { dstChainId: DST[chain] };
  return [
    { target: acm, signature: "grantRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, aggregator], ...chainRoute },
    { target: aggregator, signature: "executeBatch(uint256)", params: [BATCH_INDEX[chain]], ...chainRoute },
    { target: acm, signature: "revokeRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, aggregator], ...chainRoute },
  ];
};

const meta = {
  version: "v2",
  title: "VIP-647 [Multi-Chain] Deprecation Step 2 + Oracle Price Feed Update",
  description: `#### Summary

This proposal groups two multi-chain actions into a single VIP:

1. **Market deprecation — Step 2 (final).** Sets both the collateral factor and the liquidation threshold of every in-scope deprecated / off-boarded market to zero, completing the wind-down begun in VIP-634 / VIP-635. The collateral factor is already zero on every market, so the operative change is the liquidation threshold. Markets already at a zero liquidation threshold are omitted (no-ops).
2. **Oracle price-feed update.** Repoints the price feed of the listed assets on Ethereum, Arbitrum and BNB Chain by updating the feed inside each asset's MAIN oracle adapter (\`setTokenConfig(asset, feed, maxStalePeriod)\`), preserving the existing staleness window. On BNB Chain, BNB and WBNB share the WBNB configuration.

#### Execution model

To keep the whole change in one proposal within the BNB Chain per-transaction gas limit, the BNB Chain, Ethereum and Arbitrum actions are executed through each chain's pre-seeded CommandsAggregator (deployed and timelock-permissioned in VIP-628). For each of those chains the proposal grants the aggregator the ACM \`DEFAULT_ADMIN_ROLE\`, calls \`executeBatch(index)\`, and revokes the role — all in the same proposal. Each batch is self-permissioning: it grants the aggregator the specific setter permission, makes the calls, and revokes it, atomically.

The remaining chains (opBNB, Optimism, Unichain, Base, zkSync Era) carry deprecation-only changes with a small command count and are executed inline via LayerZero, with no aggregator involved.

#### Security and additional considerations

- **Scoped privilege**: the aggregator's \`DEFAULT_ADMIN_ROLE\` grant is scoped to this proposal — granted, used once, and revoked in the same transaction sequence. Each batch self-revokes the setter permissions it grants.
- **VIP execution simulation**: validated in a fork environment that each in-scope market ends with a zero collateral factor and liquidation threshold, and each updated asset resolves its price from the new feed.
- **Cross-chain payload size**: each LayerZero message is verified below the 10 KB Relayer cap at build time.`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip647 = () =>
  makeProposal(
    [
      // ── Aggregator chains: BNB Chain (local), then Ethereum and Arbitrum via LayerZero ──
      ...aggregatorCommands("bscmainnet"),
      ...aggregatorCommands("ethereum"),
      ...aggregatorCommands("arbitrumone"),

      // ── Inline deprecation on the small, aggregator-less chains ──
      ...generateStep2Commands(OPBNB),
      ...generateStep2Commands(OPTIMISM),
      ...generateStep2Commands(UNICHAIN),
      ...generateStep2Commands(BASE_CORE),
      ...generateStep2Commands(ZKSYNC_CORE),
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip647;
