import { ProposalType } from "src/types";
import { LzChainId } from "src/types";
import { makeProposal } from "src/utils";

import { BASE_CORE, OPBNB, OPTIMISM, UNICHAIN, ZKSYNC_CORE } from "../vip-634/phase4Markets";
import { AGGREGATOR } from "./aggregatorBatches";
import { generateStep2Commands } from "./zeroCollateralParams";

// OpenZeppelin AccessControl DEFAULT_ADMIN_ROLE.
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// Index of this VIP's batch on each chain's CommandsAggregator. Must equal the aggregator's batchCount at
// seed time (verified on-chain 2026-07-06: BSC=1, Ethereum=0, Arbitrum=0). Seed with vip-642/scripts before proposing.
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
  title: "VIP-642 [Multi-Chain] Deprecated and Off-boarded Markets — Step 2 of 2 & Oracle Feed Update",
  description: `#### Summary

This proposal completes the two-step wind-down of deprecated and off-boarded markets by setting the liquidation threshold to 0 on all markets covered by Step 1, and updates the main price feed for a set of markets on Ethereum, Arbitrum, and BNB Chain.

#### Description

1. Following Step 1 (VIP-634 / VIP-635) — which set reserve factors to 100%, repointed these markets to a deprecation interest rate model, and zeroed residual caps and collateral factors — this proposal sets the liquidation threshold of every in-scope market to 0. Collateral factors are already 0, so this removes the last remaining collateral value of these assets; any position still using them as collateral becomes eligible for liquidation. The set of affected markets is unchanged from Step 1 and is listed in full in the accompanying community post and the pull request.
2. This proposal also repoints the main price oracle to a new feed for a set of markets on Ethereum, Arbitrum, and BNB Chain via the ResilientOracle.

#### Actions

1. **Set liquidation thresholds to 0** — For every market covered by Step 1, calls setCollateralFactor(vToken, 0, 0) on the market's Comptroller, setting both the collateral factor (already 0) and the liquidation threshold to 0. Executed as a single proposal across all in-scope chains — see the execution model below.
2. **Update oracle price feeds** — For each affected asset, calls setTokenConfig on the respective chain's MAIN oracle adapter, pointing the main price feed to the new feed. The affected assets, per-chain oracle addresses, and new feed addresses are provided in the pull request.

#### Execution model

To keep the whole change in one proposal within the BNB Chain per-transaction gas limit, the BNB Chain, Ethereum and Arbitrum actions are executed through each chain's pre-seeded CommandsAggregator (deployed and timelock-permissioned in VIP-628). For each of those chains the proposal grants the aggregator the ACM DEFAULT_ADMIN_ROLE, calls executeBatch(index), and revokes the role — all in the same proposal. Each batch is self-permissioning: it grants the aggregator the specific setter permission, makes the calls, and revokes it, atomically.

The remaining chains (opBNB, Optimism, Unichain, Base, zkSync Era) carry deprecation-only changes with a small command count and are executed inline via LayerZero, with no aggregator involved.

#### Security and additional considerations

- **Scoped privilege**: the aggregator's DEFAULT_ADMIN_ROLE grant is scoped to this proposal — granted, used once, and revoked in the same transaction sequence. Each batch self-revokes the setter permissions it grants.
- **VIP execution simulation**: validated in a fork environment that each in-scope market ends with a zero collateral factor and liquidation threshold, and each updated asset resolves its price from the new feed.
- **Cross-chain payload size**: each LayerZero message is verified below the 10 KB Relayer cap at build time.

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip642 = () =>
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

export default vip642;
