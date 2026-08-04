import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// PrimeLiquidityProvider (BSC mainnet)
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

// Prime reward tokens distributed to suppliers (BSC mainnet)
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// U token held idle in the PLP (no distribution speed, nothing accrued) and the
// Venus dev recipient that converts it off-chain — same pair as VIP-641 / VIP-649.
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const DEV_RECIPIENT = "0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de";

// ===========================================================================
// Reward-leg funding sweep. BOTH Prime legs below need more of their reward
// token than the PLP holds free of already-accrued rewards, so without a top-up
// each market would run dry mid-month:
//   - wBNB: $21,000/month (~35.52 WBNB) vs only ~4.5 WBNB free  ->  ~31.0 WBNB short.
//   - USDT: $49,000/month vs ~42.2K USDT free  ->  ~$6.8K short now, growing to
//     ~$8.4K by execution as rewards keep accruing over the ~3-day window.
// To fund both, sweep idle U out to the dev recipient, which converts it to
// wBNB and USDT off-chain and returns the proceeds to the PLP (mirrors VIP-641's
// sweep to the same recipient).
//
// Sizing (read on-chain 2026-08-04, wBNB priced at the single BNB_PRICE_USD
// below): combined shortfall ≈ $18.3K (wBNB, ≈ 31.0 WBNB) + ~$8.4K (USDT at
// execution) ≈ $26.7K. U trades ≈ $1, so 28,000 U covers both legs with a ~5%
// buffer for BNB-price drift and conversion slippage over the ~3-day
// proposal-to-execution window (VIP-620 budgeted ~1% on a comparable swap). It
// leaves ~5,900 U of the ~33,911 U the PLP holds idle.
// ===========================================================================
export const U_TO_SWEEP = parseUnits("28000", 18);

// ===========================================================================
// August 2026 Prime rewards allocation: $70,000 split 70/30 across the USDT
// and wBNB supply markets ($49,000 to USDT, $21,000 to wBNB).
//
//   speed (tokens/block, 18 decimals) = monthlyUsd / tokenPriceUsd / BLOCKS_PER_MONTH
//
// Repo convention: 192000 blocks/day  ->  BLOCKS_PER_MONTH = 192000 * 30.
// USDT is a ~$1 stable (price treated as 1). wBNB is priced at the BNB/USD
// Chainlink read at proposal preparation (2026-08-04): latestAnswer 59119323000
// (8 decimals) -> $591.19323.
// Each speed stays below the on-chain max (1e18 for both tokens).
// ===========================================================================
const BLOCKS_PER_MONTH = 192000 * 30; // 5,760,000
const USDT_MONTHLY_USD = 49000;
const WBNB_MONTHLY_USD = 21000;
const BNB_PRICE_USD = 591.19323;

const speedFromMonthlyUsd = (monthlyUsd: number, priceUsd: number) =>
  parseUnits((monthlyUsd / priceUsd / BLOCKS_PER_MONTH).toFixed(18), 18);

export const NEW_PRIME_SPEED_FOR_USDT = speedFromMonthlyUsd(USDT_MONTHLY_USD, 1);
export const NEW_PRIME_SPEED_FOR_WBNB = speedFromMonthlyUsd(WBNB_MONTHLY_USD, BNB_PRICE_USD);

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] August 2026 Prime Allocation",
    description: `This proposal outlines the allocation of Prime Rewards on BNB Chain for August 2026, based on available funds. The allocation is retroactive, redistributing revenue generated through July 2026.

July 2026 was the first full month under [Tokenomics Phase II — Prime Rewards Redesign](https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774), which increased Prime's share of reserves revenue from 20% to 40% and added a 20% share of liquidation revenue, up from 0% previously (the XVS Vault's share of both dropped to 0%). This split was enacted on-chain by [VIP-638](https://app.venus.io/#/governance/proposal/638?chainId=56), which re-routed the ProtocolShareReserve distribution configs so the USDT and U Prime buybacks each take 20% of spread/reserves income (40% combined) and 10% of liquidation income (20% combined). The new split therefore applies to all revenue accrued from 2026-07-01 onward. At $70K, the August payout is 2.2x the amount distributed in July.

## Allocation Strategy

In July 2026, Venus generated **$166.6K** in reserves revenue and **$31.8K** in liquidation revenue on BNB Chain. Under the Phase II split (40% of reserves + 20% of liquidation, per VIP-638), **$73.0K** of this is allocated to Prime (≈ 40% × $166.6K + 20% × $31.8K) and will be distributed as rewards in August 2026.

**Proposed allocation strategy:**

- **Allocate $70K in Prime rewards** while maintaining a buffer for market price fluctuations and to avoid full depletion.
- Rewards will be split **70/30 between the USDT and wBNB markets**, with speeds adjusted to allocate **$49K to USDT suppliers** and **$21K to wBNB suppliers**.
- This continues the same strategy as June and July — rewarding the **USDT and wBNB supply markets**. The higher USDT weight reflects its dominant reserve contribution (~$39.9K vs ~$1.3K for wBNB in July), while the wBNB allocation continues the deliberate supply incentive to deepen that market's Prime participation.
- Focusing rewards on the supply side helps strengthen liquidity and create conditions for lower borrow rates. In contrast, rewarding both sides tends to create arbitrage opportunities, artificially inflating activity and driving up borrow rates for other users.

This allocation is an estimate based on token prices at the time the reserves were collected. Actual allocations may vary due to price changes between collection and conversion into Prime reward tokens.

## Funding the reward legs

Neither leg is fully covered by the PLP's free balance of its own reward token:

- **wBNB** — at $21K (~35.52 WBNB for the month, priced at the BNB/USD Chainlink read of $591.19323) the PLP holds only ~4.5 WBNB free of already-accrued rewards, ~31.0 WBNB (≈ $18.3K) short.
- **USDT** — at $49K the PLP holds ~42.2K USDT free of already-accrued rewards, so it is ~$6.8K short now, growing to ~$8.4K by execution as rewards keep accruing over the ~3-day window.

To fund both, this proposal sweeps **28,000 U** (≈ $28K) — currently sitting idle in the PLP with no distribution speed and nothing accrued to claimants — to the Venus dev recipient (${DEV_RECIPIENT}). The dev converts the U to wBNB and USDT off-chain and returns the proceeds to the PLP, covering the combined ~$26.7K shortfall with a ~5% buffer for BNB-price drift and conversion slippage over the ~3-day proposal-to-execution window (for reference, VIP-620 budgeted ~1% on a comparable swap). This mirrors the sweep to the same recipient in [VIP-641](https://app.venus.io/#/governance/proposal/641?chainId=56). Because the U is idle (speed and accrued both 0), the sweep takes nothing from Prime claimants, and it leaves ~5,900 U of the ~33,911 U the PLP holds idle. As the conversion happens off-chain after execution, the reward tokens will land in the PLP shortly after the proposal executes; accrueTokens caps accrual at the available balance, so each market simply under-accrues until the funds arrive.

## Proposal actions

1. **Prime reward speeds** — setTokensDistributionSpeed on the PrimeLiquidityProvider, setting the USDT supply speed to distribute $49K and the wBNB supply speed to distribute $21K over August.
2. **Reward-leg funding sweep** — sweepToken on the PrimeLiquidityProvider, transferring 28,000 U to the dev recipient for off-chain conversion into wBNB and USDT to top up both under-funded reward legs.

## Analysis

All the data presented below can be found in the [Venus Prime dashboard](https://dune.com/xvslove_team/venus-prime). Period-boundary figures are point-in-time reads taken from that dashboard when each monthly proposal is prepared; because the dashboard refreshes continuously, this period's opening values (end of July) can differ marginally from the closing values quoted for the same point in last month's [VIP-639](https://app.venus.io/#/governance/proposal/639?chainId=56) — for example USDT supply ~$191.5M here vs $192.3M there, USDT reserve revenue $37.2K vs $36.2K, and the Prime supplier count 246 vs 245. These are snapshot-timing differences, not restated figures.

### Prime markets — Activity, reserves and rewards

**USDT Market**

- Overall USDT supply eased from **$191.5M to $178.6M (-6.7%)**, with borrowing down from **$117.3M to $112.0M (-4.6%)**.
- Prime user supply declined from **$38.2M to $36.1M (-5.4%)** — a further moderation from last month's -14.9% and the -32% before it, and this month the first time Prime supply held up better than the market as a whole (-5.4% vs -6.7%). The Prime supplier count was unchanged at **246**. USDT remains the largest Prime market by participation.
- USDT reserve revenue rose from **$37.2K to $39.9K (+7.3%)** MoM despite the smaller supply base, reflecting higher utilisation. It remains the dominant revenue contributor, justifying half of Prime rewards.

**wBNB Market**

- wBNB deposits continued to grow in token terms — end-of-month supply rose from **~102.8K to ~105.3K WBNB (+2.5%)**. The higher USD figure (**$56.4M → $62.0M**) mostly reflects the recovery in the BNB price over the period rather than new deposits.
- Prime participation continued to build: Prime suppliers grew from **47 to 63** and Prime-held supply from **~$4.0M to ~$5.8M (+44.7%)**. Prime-held wBNB supply has now grown roughly 6x in two months from a near-zero base.
- wBNB reserve revenue remains minimal (**~$1.3K in July**), consistent with a market still early in its growth. The ~$21K/mo reward is a deliberate supply incentive, to be tapered as the Prime supplier base deepens.

The Normal Timelock already holds the setTokensDistributionSpeed ACM permission, so no grants are needed. (The Critical Timelock's privileges were removed in VIP-645, so — unlike prior monthly allocations — this proposal is submitted as a Normal VIP.)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Set the August Prime reward distribution speeds ($49K to USDT, $21K to wBNB suppliers).
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, WBNB],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_WBNB],
        ],
      },
      // 2. Sweep idle U to the dev recipient to fund both legs (converted to wBNB + USDT off-chain).
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [U, DEV_RECIPIENT, U_TO_SWEEP],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
