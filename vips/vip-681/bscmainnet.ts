import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// PrimeLiquidityProvider (BSC mainnet)
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

// Prime reward tokens distributed to suppliers (BSC mainnet)
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

// ===========================================================================
// TODO(before proposing): recompute these from the final July 2026 Prime
// budget and live token prices. Propose only after the PrimeV2 migration freeze
// (which zeroed legacy emissions) and once the reallocated Prime share has
// accumulated in the PrimeLiquidityProvider.
//
//   speed (tokens/block, 18 decimals) = monthlyUsdPerMarket / tokenPriceUsd / BLOCKS_PER_MONTH
//
// Repo convention: 192000 blocks/day  ->  BLOCKS_PER_MONTH = 192000 * 30.
// Both USDT and U are ~$1 stables, so price is treated as 1.
// Each speed must stay below the on-chain max (1e18 for both tokens).
//
// Current on-chain speeds (pre-VIP): USDT = 0.002170138888888888, U = 0.
// Placeholder below targets ~$60,000/month per market (≈2.4x current USDT).
// ===========================================================================
const BLOCKS_PER_MONTH = 192000 * 30; // 5,760,000

const PLACEHOLDER_MONTHLY_USD_PER_MARKET = 60000; // TODO: replace with final budget

const speedFromMonthlyUsd = (monthlyUsd: number) => parseUnits((monthlyUsd / BLOCKS_PER_MONTH).toFixed(18), 18);

export const NEW_PRIME_SPEED_FOR_USDT = speedFromMonthlyUsd(PLACEHOLDER_MONTHLY_USD_PER_MARKET);
export const NEW_PRIME_SPEED_FOR_U = speedFromMonthlyUsd(PLACEHOLDER_MONTHLY_USD_PER_MARKET);

export const vip681 = () => {
  const meta = {
    version: "v2",
    title: "VIP-681 (Critical) [BNB Chain] Tokenomics Phase II — Prime Reward Speed Adjustment",
    description: `#### Summary

Following the revenue reallocation already executed as part of the PrimeV2 migration, this
critical VIP raises the Prime reward distribution speeds in the PrimeLiquidityProvider so the
enlarged Prime budget is paid out to eligible suppliers. It re-enables emissions at the new
monthly target after the migration freeze zeroed them.

#### Proposed Changes

- Update \`PrimeLiquidityProvider.setTokensDistributionSpeed\` for the USDT and U markets to the
  new monthly target, reflecting the larger Prime pool created by the revenue reallocation.

No revenue-split changes are made by this VIP; it only adjusts payout speeds. The Critical
Timelock already holds the \`setTokensDistributionSpeed\` ACM permission, so no grants are
needed.`,
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
          [USDT, U],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_U],
        ],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip681;
