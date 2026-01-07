import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const vip578 = () => {
  const meta = {
    version: "v2",
    title: "VIP578 Venus Weekly VIP 2025: Week 51",
    description: `Date: [2025/12/15 - 2025/12/21]

### Sub VIP #1

### Title: Adjust Prime Rewards Allocation for Dec-2025

This proposal outlines the allocation of Prime Rewards on BNB for December 2025, based on available funds. The allocation is retroactive, redistributing revenue generated through November 2025.

## Allocation Strategy

In November 2025, Venus generated [$374.2k](https://dune.com/embeds/6134575/9816247) in reserves revenue. Of this amount, [$74.8k](https://dune.com/embeds/6134575/9816247)* (20%) is allocated to Prime and will be distributed as rewards in November.

**Actions:** 

- **Allocate $74K in Prime rewards**, maintaining a small buffer to safeguard against price fluctuations and prevent full depletion.
- Continue rewarding **stablecoin markets (USDT and USDC) only,** adjusting speeds to allocate $37k attributed this month to each market.
- **Distribute rewards exclusively to suppliers.** November data indicates that borrowing activity for prime users was not affected by market movement.
- Focusing rewards on the supply side helps strengthen liquidity and create conditions for lower borrow rates. In contrast, rewarding both sides tends to create arbitrage opportunities, artificially inflating activity and driving up borrow rates for other users.

**This allocation is an estimate based on token prices at the time the reserves were collected. Actual allocations may vary due to price changes between collection and conversion into Prime reward tokens. The current Prime budget stands at* [$93.28k](https://venus-vanguard-ops.vercel.app/prime-budget)*.*

## Analysis

All the data presented below can be found in the [Venus Prime dashboard](https://dune.com/xvslove_team/venus-prime).

### Churn and User Activity Overview

In November, churn rate decreased slightly compare to October however still higher than usual:

- Prime NFTs experienced a 3.2% churn rate with 16 NFTs burned, while maintaining a 100% renewal rate, indicating strong demand for the program despite the shift of rewards exclusively to stablecoin suppliers.
- After exiting Prime, former users significantly reduced their supply from $21 million to $10.8 million and their borrow volume from $12.15 million to $6.6 million over the course of November.

### **Prime markets - Activity, reserves and rewards**

In November, the Prime rewards allocation strategy was adjusted to align incentive levels with current revenue, directing rewards exclusively to USDT and USDC suppliers while pausing incentives for all other markets.

We observe that Prime Users remained relatively resilient. Despite a broad market downturn, the decreases in both Supply and Borrow among Prime Users were smaller compared to the overall market. Notably, USDT Supply among Prime Users even showed a slight increase.

**Stablecoin Markets ([USDT](https://dune.com/xvslove_team/venus-prime#usdt-market-activity-reserves-and-rewards), [USDC](https://dune.com/xvslove_team/venus-prime#usdc-market-activity-reserves-and-rewards))**

- USDT supply decreased by 14.16%, while USDC supply declined slightly by 15.91%.
- Borrow volumes fell across both markets in line with the industry-wide downturn.
- As a result, reserves revenue for USDT dropped by 45%, whereas USDC reserves revenue remained stable.
- However, higher Prime rewards distribution led to a reduction in overall net revenue (reserves minus rewards) for both markets:
    - USDT net revenue declined from $87K → $28K.
    - USDC net loss widen from -$17K → -$28K.


**[BTCB](https://dune.com/xvslove_team/venus-prime#btcb-market-activity-reserves-and-rewards) and [ETH](https://dune.com/xvslove_team/venus-prime#eth-market-activity-reserves-and-rewards) Markets**

- BTCB supply declined by 12.64%, while borrowing saw a modest decrease.
- ETH supply fell by 15.12%, accompanied by an 18.93% drop in borrowing.
- Net revenue experienced a slight decline for both assets.

`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 1000, USDT_PRIME_CONVERTER],
            [0, 1000, USDC_PRIME_CONVERTER],
          ],
        ],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDC, USDT],
          [10360663100000000n, 10360663100000000n],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip578;
