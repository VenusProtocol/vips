import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// PrimeLiquidityProvider (BSC mainnet)
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

// Prime reward tokens distributed to suppliers (BSC mainnet)
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// ===========================================================================
// July 2026 Prime rewards allocation: $32,000 split 50/50 across the USDT and
// wBNB supply markets ($16,000 each).
//
//   speed (tokens/block, 18 decimals) = monthlyUsdPerMarket / tokenPriceUsd / BLOCKS_PER_MONTH
//
// Repo convention: 192000 blocks/day  ->  BLOCKS_PER_MONTH = 192000 * 30.
// USDT is a ~$1 stable (price treated as 1). wBNB is priced at the BNB/USD
// Chainlink read at proposal preparation (2026-06-30): $545.25.
// Each speed stays below the on-chain max (1e18 for both tokens).
// ===========================================================================
const BLOCKS_PER_MONTH = 192000 * 30; // 5,760,000
const MONTHLY_USD_PER_MARKET = 16000;
const BNB_PRICE_USD = 545.24913484;

const speedFromMonthlyUsd = (monthlyUsd: number, priceUsd: number) =>
  parseUnits((monthlyUsd / priceUsd / BLOCKS_PER_MONTH).toFixed(18), 18);

export const NEW_PRIME_SPEED_FOR_USDT = speedFromMonthlyUsd(MONTHLY_USD_PER_MARKET, 1);
export const NEW_PRIME_SPEED_FOR_WBNB = speedFromMonthlyUsd(MONTHLY_USD_PER_MARKET, BNB_PRICE_USD);

export const vip639 = () => {
  const meta = {
    version: "v2",
    title: "VIP-639 (Critical) [BNB Chain] July 2026 Prime Rewards Allocation",
    description: `This proposal outlines the allocation of Prime Rewards on BNB Chain for July 2026, based on available funds. The allocation is retroactive, redistributing revenue generated through June 2026.

## Allocation Strategy

In June 2026, Venus generated **$172.4K** in reserves revenue. Of this amount, **$34.5K (20%)** is allocated to Prime and will be distributed as rewards in July 2026.

**Proposed allocation strategy:**

- **Allocate $32K in Prime rewards** while maintaining a buffer for market price fluctuations and to avoid full depletion.
- Rewards will be split **50/50 between the USDT and wBNB markets**, with speeds adjusted to allocate **$16K to each market's suppliers**.
- This continues the same strategy as June — rewarding the **USDT and wBNB supply markets**.
- Focusing rewards on the supply side helps strengthen liquidity and create conditions for lower borrow rates. In contrast, rewarding both sides tends to create arbitrage opportunities, artificially inflating activity and driving up borrow rates for other users.

## Analysis

All the data presented below can be found in the [Venus Prime dashboard](https://dune.com/xvslove_team/venus-prime).

### Prime markets — Activity, reserves and rewards

**USDT Market**

- Overall USDT supply eased from **$204.7M to $192.3M (-6.1%)**, while borrowing held roughly flat at **~$119.3M (+0.1%)**.
- Prime user supply declined from **$44.9M to $38.2M (-14.9%)** — a notably milder pullback than last month's -32%, suggesting the large-position unwind is stabilizing. Prime borrowing rose from **$22.6M to $25.6M (+13.5%)**, and the Prime supplier count held steady (**246 → 245**). USDT remains the largest Prime market by participation.
- USDT reserve revenue eased from **$39.4K to $36.2K (-8.3%)** MoM but remains the dominant revenue contributor, justifying half of Prime rewards.

**wBNB Market**

- wBNB deposits held firm and grew in token terms — end-of-month supply rose from **~97.3K to ~102.8K WBNB (+5.7%)**. The lower USD figure (**$70.2M → $57.2M**) reflects the decline in the BNB price over the period, not a withdrawal of deposits.
- Prime participation continued to build: Prime suppliers grew from **14 to 47** and Prime-held supply from **~$0.9M to ~$4.1M**, confirming the market is attracting a healthy Prime supplier base.
- wBNB reserve revenue remains minimal (**~$1.3K in June**), consistent with a market still early in its growth. The ~$16K/mo reward is a deliberate supply incentive, to be tapered as the Prime supplier base deepens.

The Critical Timelock already holds the setTokensDistributionSpeed ACM permission, so no grants are needed.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, WBNB],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_WBNB],
        ],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip639;
