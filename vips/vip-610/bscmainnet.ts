import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

/// assume 192000 blocks per Day
/// 0.003696236559139785 * (192000 * 31 days) = 22,000 USD
export const NEW_PRIME_SPEED_FOR_USDT = parseUnits("0.003696236559139785", 18);

export const vip610 = () => {
  const meta = {
    version: "v2",
    title: "VIP-610 [BNB Chain] March 2026 Prime Rewards Adjustment",
    description: `**Description:**

This proposal outlines the allocation of Prime Rewards on BNB Chain for March 2026, based on available funds. The allocation is retroactive, redistributing revenue generated through February 2026.

## Allocation Strategy

In February 2026, Venus generated [$143.6K](https://dune.com/embeds/6134575/9816247) in reserves revenue. Of this amount, [$28.7k](https://dune.com/embeds/6134575/9816247)* (20%) is allocated to Prime and will be distributed as rewards in March 2026.

**Proposed allocation strategy:**

- **Allocate $22K in Prime rewards**, while maintaining a 20% buffer to account for recent significant market price fluctuations and to avoid full depletion.
- Rewards will be directed exclusively to the USDT stablecoin market, with speeds adjusted to allocate the full $22K to USDT suppliers.
- Focusing rewards on the supply side helps strengthen liquidity and create conditions for lower borrow rates. In contrast, rewarding both sides tends to create arbitrage opportunities, artificially inflating activity and driving up borrow rates for other users.

*\\*This allocation is an estimate based on token prices at the time the reserves were collected. Actual allocations may vary due to price changes between collection and conversion into Prime reward tokens. The current Prime budget stands at [$29.83k](https://venus-vanguard-ops.vercel.app/prime-budget).*

## Analysis

All the data presented below can be found in the [Venus Prime dashboard](https://dune.com/xvslove_team/venus-prime).

### **Prime markets - Activity, reserves and rewards**

**Stablecoin Markets ([USDT](https://dune.com/xvslove_team/venus-prime#usdt-market-activity-reserves-and-rewards))**

- Overall USDT supply decreased by 12%, while borrowing decreased by 32%.
- However, Prime user supply only dropped by 5% and borrowing increased by 11.90%. This divergence — Prime user supply outperforming the overall market by 7 percentage points and borrowing growing despite a 32% market-wide decline — suggests that Prime rewards are effectively retaining and attracting high-quality, engaged participants.
- Reserves revenue for USDT dropped by $50K, reflecting both a decline in market revenue and higher incentive costs following the decision to concentrate all rewards on USDT. Note that part of this decline reflects the mechanical effect of concentrating rewards — higher USDT incentives increase the cost base, compressing net revenue even when gross reserves are stable.
- Turning to USDC, Prime user borrowing declined only 4% despite the broader market downturn, and the market is now net positive — confirming that removing USDC rewards has had no material negative impact. There is no need to reinstate USDC incentives, validating the February decision to consolidate rewards on USDT.

**Action:**

- Maintain 20% PSR income allocation to USDT Prime converter, with 0% to USDC Prime converter
- Update USDT distribution speed to $22K over 31 days (March 2026)
- USDC distribution speed remains at 0 (unchanged from VIP-589)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Adjust Prime Rewards Distribution Speed
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [[USDT], [NEW_PRIME_SPEED_FOR_USDT]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip610;
