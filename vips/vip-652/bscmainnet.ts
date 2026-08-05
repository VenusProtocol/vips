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
// each market would run dry mid-month. Sweep idle U out to the dev recipient,
// which converts it to wBNB and USDT off-chain and returns the proceeds to the
// PLP (mirrors VIP-641's sweep to the same recipient).
//
// Sizing (re-read on-chain 2026-08-05 at block 114,080,585; wBNB priced at the
// single BNB_PRICE_USD below). Free balance = balanceOf - tokenAmountAccrued:
//   - wBNB: 4.09 free vs 35.52 needed for the month. The free balance keeps
//     draining at the *current* speed until execution (the PLP receives no wBNB
//     inflow), so by execution (~3 days: 1 day voting + 2 day Normal Timelock)
//     it is ~1.15 free  ->  ~34.4 WBNB (≈ $20.3K) short.
//   - USDT: 41,925 free vs 49,000 needed  ->  ~$7.1K short now, ~$8.7K by
//     execution as rewards keep accruing.
// Combined execution-time shortfall ≈ $29.0K. U trades ≈ $1, so 28,000 U covers
// ≈ $28.0K of it; the ~$1K residual is small against the ProtocolShareReserve
// inflow the PLP receives over the month. It leaves ~5,900 U of the ~33,911 U
// the PLP holds idle.
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

export const vip652 = () => {
  const meta = {
    version: "v2",
    title: "VIP-652 [BNB Chain] August 2026 Prime Allocation",
    description: `#### Summary

This proposal sets the August 2026 Prime reward allocation for the USDT and wBNB supply markets on BNB Chain — $70K in total, split 70/30 ($49K to USDT, $21K to wBNB) — funded from July 2026 revenue, the first month under the Tokenomics Phase II split of 40% of reserves revenue plus 20% of liquidation revenue. At 2.2x July's distribution it is the largest monthly Prime allocation since December 2025. Refer to the [community post](https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774) for the full background and rationale.

#### Actions

This VIP performs the following actions on BNB Chain:

1. **USDT market** — Adjust the Prime reward speed so that ~$49K is distributed to USDT suppliers over August 2026.
2. **wBNB market** — Adjust the Prime reward speed so that ~$21K is distributed to wBNB suppliers over August 2026.
3. **Reward-leg funding sweep** — Transfer 28,000 U (≈ $28K), currently idle in the PrimeLiquidityProvider with no distribution speed and nothing accrued to claimants, to the Venus dev recipient (${DEV_RECIPIENT}) for off-chain conversion into wBNB and USDT, which are returned to the PrimeLiquidityProvider to top up both reward legs.

Actions 1 and 2 are a single setTokensDistributionSpeed call on the [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2); action 3 is a sweepToken call on the same contract. Both are executed by the Normal Timelock, which holds the setTokensDistributionSpeed ACM permission and owns the PrimeLiquidityProvider, so no ACM grants are needed. The Critical Timelock's privileges were removed in [VIP-645](https://app.venus.io/#/governance/proposal/645?chainId=56), so — unlike prior monthly allocations — this proposal is submitted as a Normal VIP.

The exact per-block distribution speeds, reward-token amounts, and the PrimeLiquidityProvider / market addresses are configured in the vips repo PR. Amounts are estimated at collection-time prices and may vary on conversion.

#### Funding the reward legs

Neither leg is fully covered by the PrimeLiquidityProvider's free balance (balance less already-accrued rewards) of its own reward token:

- **wBNB** — at $21K the month needs ~35.52 WBNB, priced at the BNB/USD Chainlink read of $591.19323. The contract holds only ~4.1 WBNB free, and that free balance keeps draining at the current speed until execution because the contract receives no wBNB inflow, leaving it ~34.4 WBNB (≈ $20.3K) short by then.
- **USDT** — at $49K the contract holds ~41.9K USDT free, so it is ~$7.1K short now, growing to ~$8.7K by execution as rewards keep accruing.

The 28,000 U swept in action 3 covers ≈ $28.0K of that combined ≈ $29.0K execution-time shortfall; the residual is small against the ProtocolShareReserve inflow the contract receives over the month. Note that accrueTokens caps accrual at the available balance and does not backfill, so any interval in which a reward token is fully accrued is simply not distributed — the wBNB leg in particular depends on the off-chain conversion landing promptly after execution. This mirrors the sweep to the same recipient in [VIP-641](https://app.venus.io/#/governance/proposal/641?chainId=56). Because the U is idle (distribution speed and accrued amount both zero), the sweep takes nothing from Prime claimants, and it leaves ~5,900 U of the ~33,911 U the contract holds idle.

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
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

export default vip652;
