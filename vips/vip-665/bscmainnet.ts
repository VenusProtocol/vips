import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// PrimeLiquidityProvider (BSC mainnet) — the shared Prime rewards vault, pointed at PrimeV2.
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

// Prime reward tokens on the PLP.
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

// Dev recipient for the off-chain U -> USDT conversion (same address as VIP-641 / VIP-652 / VIP-660).
export const DEV_RECIPIENT = "0x080f8A0fB70F8F0F1b83C6178225a96CbE2BE0DE";
export const U_TO_SWEEP = parseUnits("20000", 18);

// ===========================================================================
// October 2026 Prime rewards allocation: $50,000/month total, split 80/20 —
// $40,000 to USDT suppliers and $10,000 to U borrowers. The reward markets and
// rewarded sides are unchanged from September (VIP-660): no market is added or removed.
// The free USDT balance does not cover the $40K USDT leg on its own, so 20,000 U is swept
// to the dev recipient, converted to USDT off-chain and returned to the PLP.
//
//   speed (tokens/block, 18 decimals) = monthlyAmount / BLOCKS_PER_MONTH
//
// Repo convention: 192000 blocks/day -> BLOCKS_PER_MONTH = 192000 * 30. USDT and U
// are both accounted at $1, so the token speed equals the USD speed. Each speed
// stays below the on-chain max (1e18 for both tokens).
// ===========================================================================
const BLOCKS_PER_MONTH = 192000 * 30; // 5,760,000

export const NEW_PRIME_SPEED_FOR_USDT = parseUnits("40000", 18).div(BLOCKS_PER_MONTH); // 6944444444444444
export const NEW_PRIME_SPEED_FOR_U = parseUnits("10000", 18).div(BLOCKS_PER_MONTH); // 1736111111111111

export const vip665 = () => {
  const meta = {
    version: "v2",
    title: "VIP-665 [BNB Chain] Prime Rewards Allocation — October 2026",
    description: `#### Summary

This proposal sets the Venus Prime reward allocation on BNB Chain for October 2026, distributing $50,000 to USDT suppliers and U borrowers. The reward markets and rewarded sides are unchanged from September. Refer to the community post for the full background and rationale.

#### Actions

This VIP performs the following actions on BNB Chain:

1. **Set Prime reward distribution speeds** — Calls setTokensDistributionSpeed(address[],uint256[]) on [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2) with the two tokens and speeds listed below.

- **USDT** ([0x55d398326f99059fF775485246999027B3197955](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955)): speed per block from 0.011111111111111111 to 0.006944444444444444, approximately 40,000 USDT over 30 days
- **U** ([0xcE24439F2D9C6a2289F741120FE202248B666666](https://bscscan.com/address/0xcE24439F2D9C6a2289F741120FE202248B666666)): speed per block from 0.002777777777777777 to 0.001736111111111111, approximately 10,000 U over 30 days

Speeds are sized on 192,000 blocks per day over a 30-day period. Both tokens are already initialised on the PrimeLiquidityProvider and their maximum distribution speeds are unchanged, so no additional token configuration is required.

2. **Reward-inventory rebalance** — Calls sweepToken(address,address,uint256) on the PrimeLiquidityProvider to transfer 20,000 U (≈ $20K) to the Venus dev recipient ([0x080f8A0fB70F8F0F1b83C6178225a96CbE2BE0DE](https://bscscan.com/address/0x080f8A0fB70F8F0F1b83C6178225a96CbE2BE0DE)) for off-chain conversion into USDT, which is returned to the PrimeLiquidityProvider.

The Normal Timelock holds the setTokensDistributionSpeed ACM permission and owns the PrimeLiquidityProvider, so no ACM grants are needed.

**Funding the reward legs.** Measured on a free-balance basis — token balance less rewards already accrued to Prime — the PrimeLiquidityProvider holds approximately 31,952 USDT and 42,805 U (block 124,840,092). At the September speeds, the free balances keep falling by about 2,133 USDT and 533 U per day until this proposal executes, leaving roughly 23.6K USDT and 40.7K U if it executes on October 4.

- **USDT** — about 16.4K USDT short of the 40,000 USDT October leg before any USDTPrimeBuyback inflow. The ~20K USDT returned from action 2 covers the gap, and the buyback inflow over the month adds headroom. Emission is in any case bounded by the contract's balance.
- **U** — after the 20,000 U sweep, about 20.7K U remains free, covering the 10,000 U October leg with margin. The sweep takes nothing already accrued to Prime claimants.

No market is added to or removed from Prime, and no market's interest rate model, collateral factor or caps are changed by this proposal.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/771)
- [VIP-660](https://app.venus.io/#/governance/proposal/660?chainId=56) — September 2026 Prime Allocation (current speeds)

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
      // 1. Set the October Prime reward distribution speeds ($40K to USDT suppliers, $10K to U borrowers).
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, U],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_U],
        ],
      },
      // 2. Rebalance the reward inventory: sweep U to the dev recipient for off-chain conversion to
      //    USDT, returned to the PrimeLiquidityProvider.
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

export default vip665;
