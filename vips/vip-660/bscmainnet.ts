import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// PrimeV2 (BSC mainnet) — the new Prime contract brought live in VIP-637. Its
// addMarket is 3-arg (market, supplyMultiplier, borrowMultiplier); the Core pool
// Comptroller is stored on-chain (corePoolComptroller() = UNITROLLER), unlike the
// legacy 4-arg Prime.addMarket used by VIP-620 / VIP-629.
export const PRIME = "0x059EabA8676b03e4e8f009eFb7F587C28450F50f";

// PrimeLiquidityProvider (BSC mainnet) — the shared rewards vault, now pointed at PrimeV2.
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

// vU market (Core pool) and its underlying U token.
export const VU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

// Prime reward tokens on the PLP.
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// Dev recipient for the off-chain U -> USDT conversion.
export const DEV_RECIPIENT = "0x080f8A0fB70F8F0F1b83C6178225a96CbE2BE0DE";
export const U_TO_SWEEP = parseUnits("12000", 18);

// ===========================================================================
// Enable the U market for Prime on the BORROW side. This is the first month U is
// scored on borrows rather than supplies: supplyMultiplier = 0 (a pure vU supply
// position earns no Prime score) and borrowMultiplier = 2e18 (Prime scores derive
// from U borrowed). Mirrors the 2x factor used for the existing supply-side
// markets (vUSDT / vWBNB in VIP-637), applied to the borrow leg instead.
// ===========================================================================
export const SUPPLY_MULTIPLIER = 0;
export const BORROW_MULTIPLIER = parseUnits("2", 18);

// ===========================================================================
// September 2026 Prime rewards allocation: $80,000/month total, split $64,000 to
// USDT suppliers and $16,000 to U borrowers, and wBNB Prime rewards end (speed 0).
//
//   speed (tokens/block, 18 decimals) = monthlyAmount / BLOCKS_PER_MONTH
//
// Repo convention: 192000 blocks/day -> BLOCKS_PER_MONTH = 192000 * 30. USDT and U
// are both accounted at $1, so the token speed equals the USD speed. Each speed
// stays below the on-chain max (1e18 for both tokens).
// ===========================================================================
const BLOCKS_PER_MONTH = 192000 * 30; // 5,760,000

export const NEW_PRIME_SPEED_FOR_USDT = parseUnits("64000", 18).div(BLOCKS_PER_MONTH); // 11111111111111111
export const NEW_PRIME_SPEED_FOR_U = parseUnits("16000", 18).div(BLOCKS_PER_MONTH); // 2777777777777777
export const NEW_PRIME_SPEED_FOR_WBNB = 0; // wBNB Prime rewards end

export const vip660 = () => {
  const meta = {
    version: "v2",
    title: "VIP-660 [BNB Chain] September 2026 Prime Allocation",
    description: `#### Summary

This proposal sets the September 2026 Prime reward allocation on BNB Chain — $80K in total, split 80/20 ($64K to USDT suppliers and $16K to U borrowers) — and ends wBNB Prime rewards. It is the first month U is a Prime market, and the first Prime market scored on the **borrow side** rather than the supply side. It also rebalances the PrimeLiquidityProvider's reward inventory toward USDT to match that split. Refer to the [community post](https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774) for the full background and rationale.

#### Actions

This VIP performs the following actions on BNB Chain:

1. **Enable the U market for Prime on the borrow side** — addMarket(vU, supplyMultiplier = 0, borrowMultiplier = 2e18) on [PrimeV2](https://bscscan.com/address/0x059EabA8676b03e4e8f009eFb7F587C28450F50f). Prime scores in this market derive only from U borrowed; a pure vU supply position earns no Prime score. The 2x factor mirrors the existing supply-side markets (vUSDT / vWBNB, supplyMultiplier = 2e18), applied to the borrow leg instead. Adding a market queues a one-time score-update round across all 500 current Prime holders, drained by updateScores calls (at most 20 holders per call). Until that round completes, claimPrime, issue and burn on PrimeV2 revert with ScoreUpdateInProgress, and a holder's U borrow starts counting toward their Prime score once their own score has been updated. This is inherent to any PrimeV2 market change and clears as soon as the round is drained.
2. **USDT market** — set the Prime reward speed to 0.011111111111111111 USDT per block, distributing ~$64K to USDT suppliers over September 2026 (5,760,000 blocks at 192,000 blocks/day), up from ~$49K in August.
3. **U market** — set the Prime reward speed to 0.002777777777777777 U per block, distributing ~$16K to U borrowers over September 2026.
4. **wBNB market** — set the Prime reward speed to 0, ending wBNB Prime rewards (~$21K in August). wBNB already accrued to claimants stays claimable; only further accrual stops.
5. **Reward-inventory rebalance** — transfer 12,000 U (≈ $12K) from the PrimeLiquidityProvider to the Venus dev recipient (${DEV_RECIPIENT}) for off-chain conversion into USDT, which is returned to the PrimeLiquidityProvider. Prime's share of protocol revenue reaches the PrimeLiquidityProvider through the two buyback contracts set up in [VIP-620](https://app.venus.io/#/governance/proposal/620?chainId=56), one converting into USDT and one into U; over the past 30 days they delivered ~29.8K USDT and ~29.9K U, an effectively 50/50 split. That leaves the contract's inventory balanced (~36.0K USDT free vs ~35.8K idle U) while this month's distribution is 80/20 in favour of USDT, so part of the U is converted to USDT.

Actions 2–4 are a single setTokensDistributionSpeed call on the [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2); action 5 is a sweepToken call on the same contract. The Normal Timelock holds the PrimeV2 addMarket and PrimeLiquidityProvider setTokensDistributionSpeed ACM permissions and owns the PrimeLiquidityProvider, so no ACM grants are needed. The Critical Timelock's privileges were removed in [VIP-645](https://app.venus.io/#/governance/proposal/645?chainId=56), so — as with the [August allocation](https://app.venus.io/#/governance/proposal/652?chainId=56) — this proposal is submitted as a Normal VIP.

#### Funding the reward legs

- **USDT** — the PrimeLiquidityProvider holds ~53.7K USDT, of which ~17.7K is already accrued to claimants, leaving ~36.0K free against the $64K September leg, and that free balance keeps shrinking by ~1.6K USDT per day at the current August speed until execution. The 12,000 USDT returned from action 5, together with the USDT buyback inflow over the month (~29.8K over the past 30 days), covers the remainder. accrueTokens caps accrual at the available balance and does not backfill, so the USDT leg depends on the off-chain conversion landing promptly after execution.
- **U** — the contract holds ~35.8K U, all idle (distribution speed and accrued amount both zero), so the sweep takes nothing from Prime claimants and the remaining ~23.8K U covers the $16K U leg with margin.

U, USDT and wBNB are already configured reward tokens on the PrimeLiquidityProvider (each with a max distribution speed of 1e18, unchanged here), so no initializeTokens or setMaxTokensDistributionSpeed call is needed.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/763)
- [VIP-637](https://app.venus.io/#/governance/proposal/637?chainId=56) — PrimeV2 launch (vUSDT / vWBNB supply-side markets)

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
      // 1. Enable the U market for Prime on the borrow side (supplyMultiplier = 0, borrowMultiplier = 2e18).
      {
        target: PRIME,
        signature: "addMarket(address,uint256,uint256)",
        params: [VU, SUPPLY_MULTIPLIER, BORROW_MULTIPLIER],
      },
      // 2. Set the September Prime reward distribution speeds ($64K to USDT suppliers, $16K to U
      //    borrowers, wBNB ended).
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, U, WBNB],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_U, NEW_PRIME_SPEED_FOR_WBNB],
        ],
      },
      // 3. Rebalance the income allocation off-chain: sweep U to the dev recipient for conversion
      //    to USDT and return to the PrimeLiquidityProvider.
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

export default vip660;
