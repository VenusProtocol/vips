import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ===== Core protocol contracts =====
export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const CORE_COMPTROLLER = bscmainnet.UNITROLLER;

// ===== Tokens =====
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

// ===== Markets =====
// vWBNB_CORE is the core-pool ERC20 wBNB market (distinct from vBNB, the
// native BNB market). The Prime entry tracks vWBNB_CORE; WBNB is also the
// reward token paid via PrimeLiquidityProvider.
export const VWBNB_CORE = "0x6bCa74586218dB34cdB402295796b79663d816e9";

// ===== PancakeSwap V3 routing for U -> WBNB =====
// Direct U/WBNB fee=500 pool (0x882e23dbA77BFe0e514cF5BcDad7a58acEB01522) quotes
// within ~0.08% of the U -> USDT -> WBNB multihop at this swap size; single-hop
// trades the negligible price improvement for a smaller revert surface (one
// pool dep instead of two) and avoids the multicall wrapper.
export const PANCAKE_V3_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
export const PANCAKE_V3_FEE_U_WBNB = 500;

// ===== June 2026 Prime Rewards Allocation =====
// In May 2026, Venus generated ~$139.7K reserves revenue; 20% ($27.9K) goes to
// Prime. Distribute ~$25K (10% buffer for price drift), split 50/50 between
// USDT and WBNB supply markets. USDC market is sidelined this month.

// Per-market monthly USD target.
export const REWARD_PER_MARKET_PER_MONTH_USD = 12500;

// USDT speed: $12,500 / month at $1 per USDT.
// BSC ≈ 0.45 s/block → 192,000 blocks/day → 5,760,000 blocks/month
//   (matches VIP-618 BSC_BLOCKS_PER_MONTH = 30 * 192_000).
export const BSC_BLOCKS_PER_MONTH = 30 * 192_000;
export const NEW_PRIME_SPEED_FOR_USDT = parseUnits("12500", 18).div(BSC_BLOCKS_PER_MONTH);

// WBNB speed: derived from the actual PCS V3 swap output, not a fixed
// $-target — the swap turns 12,500 U into ~WBNB_EXPECTED_OUT WBNB, and that
// total is paid out evenly over the month. WBNB_EXPECTED_OUT comes from a
// QuoterV2 snapshot of the direct U -> WBNB (fee=500) pool at the proposal
// snapshot block; the implied BNB price at the snapshot was ~$653. Refresh
// this number from a fresh QuoterV2 read before queueing.
export const WBNB_EXPECTED_OUT = parseUnits("19.13", 18);
export const NEW_PRIME_SPEED_FOR_WBNB = WBNB_EXPECTED_OUT.div(BSC_BLOCKS_PER_MONTH);

// U speed: zero this month — U is taking a one-month break to fund WBNB rewards.
export const NEW_PRIME_SPEED_FOR_U = 0;

// Prime multipliers for vWBNB_CORE. Supply-only, matching the USDT / USDC / vU
// convention established in VIP-618 / VIP-620.
export const SUPPLY_MULTIPLIER = parseUnits("2", 18);
export const BORROW_MULTIPLIER = 0;

// Match the canonical 1e18 max distribution speed used by every existing Prime
// token across BSC and Ethereum (also DEFAULT_MAX_DISTRIBUTION_SPEED in
// PrimeLiquidityProvider.sol). Set explicitly for audit visibility.
export const WBNB_MAX_DISTRIBUTION_SPEED = parseUnits("1", 18);

// ===== Swap budget =====
// Sweep 12,500 U from PLP and convert to WBNB. PLP holds U from VIP-620's
// USDC->U seed swap; this month's reallocation redirects U toward WBNB.
export const U_TO_SWEEP = parseUnits("12500", 18);
// 3% slippage floor on the U -> WBNB direct swap. Wider than VIP-618's 1%
// stable/stable buffer because BNB can move 2-3% across the 48-72h normal
// timelock window; the VIP is atomic, so a swap revert would also unwind
// Prime.addMarket(vWBNB_CORE). Tighten before queue using a fresh QuoterV2 read.
export const WBNB_MIN_OUT = WBNB_EXPECTED_OUT.mul(97).div(100);

// 14-day swap deadline (mirrors VIP-580 / VIP-618).
export const SWAP_DEADLINE = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14;

export const vip628 = () => {
  const meta = {
    version: "v2",
    title: "VIP-628 Adjust Prime Rewards Allocation for Jun-2026 (add WBNB, sideline U)",
    description: `#### Summary

This proposal outlines the allocation of Prime Rewards on BNB Chain for June 2026, based on available funds. The allocation is retroactive, redistributing revenue generated through May 2026.

#### Allocation Strategy

In May 2026, Venus generated **$139.7K** in reserves revenue. Of this amount, **$27.9K (20%)** is allocated to Prime and will be distributed as rewards in June 2026.

- **Allocate ~$25K in Prime rewards**, while maintaining a 10% buffer for market price fluctuations and to avoid full depletion.
- Rewards will be split **50/50 between the USDT and WBNB markets**, with speeds adjusted to allocate **~$12.5K to each market's suppliers**.
- This is the **first month including WBNB as a Prime reward market**, temporarily in place of U. WBNB was the second-largest source of reserve revenue in May (~$25K, ≈18% of total), supporting its inclusion. The U market is set aside this month and will be revisited in coming months based on market performance and reserve contribution.
- Focusing rewards on the supply side helps strengthen liquidity and create conditions for lower borrow rates. In contrast, rewarding both sides tends to create arbitrage opportunities, artificially inflating activity and driving up borrow rates for other users.
- No buyback contract is wired up for WBNB this month; the wBNB Prime reward is funded one-shot from the existing PLP U balance and the inclusion is treated as temporary.

This allocation is an estimate based on token prices at the time the reserves were collected. Actual allocations may vary due to price changes between collection and conversion into Prime reward tokens.

#### Analysis

**USDT Market**

- Overall USDT supply declined from $222.1M to $204.7M (-7.8%), with borrowing easing from $127.8M to $119.1M (-6.8%).
- Prime user supply fell from $66.0M to $44.9M (-32%) and Prime borrowing from $28.6M to $22.6M (-21%) — a sharper pullback than the broader market, driven by a few large positions unwinding. This warrants monitoring, though USDT remains the largest Prime market by participation.
- USDT reserve revenue rose from $37.9K to $39.4K (+4.1%) MoM and remains the dominant revenue contributor, justifying half of Prime rewards.

**wBNB Market** (first inclusion)

- Overall wBNB supply grew from $358.2M to $417.8M (+16.6%) and borrowing from $108.4M to $117.6M (+8.5%) — the market is expanding organically without incentives.
- wBNB was the second-largest reserve revenue contributor in May at ~$25.0K (≈18% of total BNB Chain reserves), supporting its inclusion as a Prime reward market.
- Prime user wBNB supply grew from $8.3M to $10.9M (+31%). Supply-side rewards are intended to deepen this Prime-held wBNB supply liquidity.

#### Proposed Changes

1. **Prime.addMarket(coreComptroller, vWBNB_CORE, supplyMultiplier=2e18, borrowMultiplier=0)** — register vWBNB_CORE as a Prime-eligible market with the same supply-only shape as USDT / USDC / vU.
2. **PLP.initializeTokens([WBNB])** — track WBNB as a distributable reward token in PrimeLiquidityProvider.
3. **PLP.setMaxTokensDistributionSpeed([WBNB], [1e18])** — set explicit max, matching every other Prime reward token across BSC and Ethereum.
4. **PLP.sweepToken(U, NormalTimelock, 12,500e18)** — sweep 12,500 U from PLP to NormalTimelock; this U was seeded into PLP by VIP-620's USDC -> U swap.
5. **U.approve(PancakeV3Router, 12,500e18)** — approve the router for the swap amount.
6. **PancakeV3Router.exactInputSingle(U -> WBNB, fee=500, recipient=PLP)** — single-hop swap on the deep U/WBNB V3 pool. Min-out applies a 3% slippage buffer to absorb 48-72h of BNB volatility between proposal queue and timelock execution; verify against a fresh QuoterV2 read before queueing.
7. **U.approve(PancakeV3Router, 0)** — revoke any residual approval as defense in depth.
8. **PLP.setTokensDistributionSpeed([USDT, WBNB, U], [usdtSpeed, wbnbSpeed, 0])** — turn on USDT + WBNB at the $12,500/month target, zero the U speed for the month.

The off-chain batch score update is performed after VIP execution and is intentionally out of scope here.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Add vWBNB_CORE as a Prime market (supply-only, matching USDT/USDC/vU).
      {
        target: PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [CORE_COMPTROLLER, VWBNB_CORE, SUPPLY_MULTIPLIER, BORROW_MULTIPLIER],
      },

      // 2. Initialize WBNB in PrimeLiquidityProvider so distribution accounting tracks it.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "initializeTokens(address[])",
        params: [[WBNB]],
      },

      // 3. Set WBNB max distribution speed to 1e18 (canonical bound).
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setMaxTokensDistributionSpeed(address[],uint256[])",
        params: [[WBNB], [WBNB_MAX_DISTRIBUTION_SPEED]],
      },

      // 4. Sweep 12,500 U out of PLP to NormalTimelock for swapping.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [U, bscmainnet.NORMAL_TIMELOCK, U_TO_SWEEP],
      },

      // 5. Approve PancakeSwap V3 router for the swap amount.
      {
        target: U,
        signature: "approve(address,uint256)",
        params: [PANCAKE_V3_ROUTER, U_TO_SWEEP],
      },

      // 6. Direct U -> WBNB swap on PancakeSwap V3 (fee=500 pool). Output to PLP.
      {
        target: PANCAKE_V3_ROUTER,
        signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
        params: [
          [U, WBNB, PANCAKE_V3_FEE_U_WBNB, PRIME_LIQUIDITY_PROVIDER, SWAP_DEADLINE, U_TO_SWEEP, WBNB_MIN_OUT, 0],
        ],
      },

      // 7. Revoke residual U approval as defense in depth.
      {
        target: U,
        signature: "approve(address,uint256)",
        params: [PANCAKE_V3_ROUTER, 0],
      },

      // 8. Set Prime distribution speeds — USDT + WBNB on, U off.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, WBNB, U],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_WBNB, NEW_PRIME_SPEED_FOR_U],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip628;
