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

// WBNB speed: estimated from current BNB price (~$625, giving ~20 WBNB for
// 12,500 U). The on-chain VIP does NOT execute the swap — it sweeps 12,500 U
// to the Venus Team Multisig (0xCCa5...2948, the same team multisig used in
// VIP-610 / VIP-616), which performs the U -> WBNB swap off-chain and
// transfers the resulting WBNB into PLP. This avoids exposing the swap to
// 48-72h of BNB price drift across the timelock window. If the realized
// WBNB amount diverges materially from 20, the speed can be retuned in a
// follow-up VIP.
export const WBNB_EXPECTED_OUT = parseUnits("20", 18);
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

// ===== Sweep budget =====
// Sweep 12,500 U from PLP to the Venus Team Multisig. PLP holds U from
// VIP-620's USDC->U seed swap; the Team Multisig will swap U->WBNB off-chain
// and transfer the WBNB into PLP. Off-chain execution avoids exposing the
// swap to 48-72h of BNB volatility across the timelock window. TEAM_MULTISIG
// here is the same multisig referenced in VIP-610 / VIP-616.
export const TEAM_MULTISIG = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948";
export const U_TO_SWEEP = parseUnits("12500", 18);

export const vip629 = () => {
  const meta = {
    version: "v2",
    title: "VIP-629 Adjust Prime Rewards Allocation for Jun-2026 (add WBNB, sideline U)",
    description: `#### Summary

This proposal outlines the allocation of Prime Rewards on BNB Chain for June 2026, based on available funds. The allocation is retroactive, redistributing revenue generated through May 2026.

#### Allocation Strategy

In May 2026, Venus generated **$139.7K** in reserves revenue. Of this amount, **$27.9K (20%)** is allocated to Prime and will be distributed as rewards in June 2026.

- **Allocate ~$25K in Prime rewards**, while maintaining a 10% buffer for market price fluctuations and to avoid full depletion.
- Rewards will be split **50/50 between the USDT and WBNB markets**, with speeds adjusted to allocate **~$12.5K to each market's suppliers**.
- This is the **first month including WBNB as a Prime reward market**, temporarily in place of U. WBNB was the second-largest source of reserve revenue in May (~$25K, ≈18% of total), supporting its inclusion. The U market is set aside this month and will be revisited in coming months based on market performance and reserve contribution.
- Focusing rewards on the supply side helps strengthen liquidity and create conditions for lower borrow rates. In contrast, rewarding both sides tends to create arbitrage opportunities, artificially inflating activity and driving up borrow rates for other users.
- No buyback contract is wired up for WBNB this month; the wBNB Prime reward is funded one-shot from the existing PLP U balance and the inclusion is treated as temporary.
- The U -> WBNB conversion is executed off-chain by the [Venus Team Multisig](https://bscscan.com/address/0xCCa5a587eBDBe80f23c8610F2e53B03158e62948) to avoid exposing the swap to 48-72h of BNB price volatility across the timelock window. The VIP only sweeps the U; the Team Multisig swaps and transfers WBNB into PLP after execution.

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
4. **PLP.sweepToken(U, TeamMultisig, 12,500e18)** — sweep 12,500 U from PLP to the Venus Team Multisig (0xCCa5...2948); this U was seeded into PLP by VIP-620's USDC -> U swap. The Team Multisig swaps U -> WBNB off-chain and transfers the resulting WBNB into PLP.
5. **PLP.setTokensDistributionSpeed([USDT, WBNB, U], [usdtSpeed, wbnbSpeed, 0])** — turn on USDT + WBNB at the $12,500/month target, zero the U speed for the month. PLP distributes WBNB only up to its on-hand balance, so distribution begins once the Team Multisig funds WBNB.

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

      // 4. Sweep 12,500 U out of PLP to the Venus Team Multisig. Community
      //    Wallet handles the U -> WBNB swap off-chain and transfers WBNB to
      //    PLP (same flow as VIP-214 / VIP-236).
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [U, TEAM_MULTISIG, U_TO_SWEEP],
      },

      // 5. Set Prime distribution speeds — USDT + WBNB on, U off.
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

export default vip629;
