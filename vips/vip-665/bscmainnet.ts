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

export const vip665 = () => {
  const meta = {
    version: "v2",
    title: "VIP-665 [BNB Chain] September 2026 Prime Allocation",
    description: `#### Summary

This proposal sets the September 2026 Prime reward allocation on BNB Chain — $80K in total, split $64K to USDT suppliers and $16K to U borrowers — and ends wBNB Prime rewards. It is the first month the U market is scored on the **borrow side** rather than the supply side. Refer to the [community post](https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774) for the full background and rationale.

#### Actions

This VIP performs the following actions on BNB Chain:

1. **Enable the U market for Prime on the borrow side** — addMarket(vU, supplyMultiplier = 0, borrowMultiplier = 2e18) on [PrimeV2](https://bscscan.com/address/0x059EabA8676b03e4e8f009eFb7F587C28450F50f). With supplyMultiplier = 0 a pure vU supply position earns no Prime score; with borrowMultiplier = 2e18 Prime scores in this market derive from U borrowed. This mirrors the 2x factor applied to the existing supply-side markets (vUSDT / vWBNB), on the borrow leg instead. Adding a market queues a one-time score-update round across all existing Prime holders: until that round finishes (via updateScores), claimPrime / issue / burn revert with ScoreUpdateInProgress and no vU Prime score accrues. This temporary freeze is inherent to any PrimeV2 market change and resolves once the score update completes.
2. **USDT market** — set the Prime reward speed so ~$64K is distributed to USDT suppliers over September 2026.
3. **U market** — set the Prime reward speed so ~$16K is distributed to U borrowers over September 2026.
4. **wBNB market** — set the Prime reward speed to 0, ending wBNB Prime rewards.
5. **Income-allocation rebalance** — transfer 12,000 U from the PrimeLiquidityProvider to the Venus dev recipient (${DEV_RECIPIENT}) for off-chain conversion to USDT and return to the PrimeLiquidityProvider. This aligns the reward inventory with this month's 80/20 reward distribution after revenue was allocated using the previous 50/50 ratio.

Actions 2–4 are a single setTokensDistributionSpeed call on the [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2); action 5 is a sweepToken call on the same contract. The Normal Timelock holds the PrimeV2 addMarket and PLP setTokensDistributionSpeed ACM permissions and owns the PrimeLiquidityProvider, so no ACM grants are needed. The Critical Timelock's privileges were removed in [VIP-645](https://app.venus.io/#/governance/proposal/645?chainId=56), so — as with the August allocation — this proposal is submitted as a Normal VIP.

The exact per-block distribution speeds, reward-token amounts, and the PrimeV2 / PrimeLiquidityProvider / market addresses are configured in the vips repo PR.

#### Funding the reward legs

This VIP sets the Prime market multipliers and reward distribution speeds and sweeps 12,000 U to the dev recipient. The U -> USDT conversion and subsequent USDT return to the PrimeLiquidityProvider are operational steps performed outside this proposal.

U, USDT and wBNB are already configured reward tokens on the PLP (each with a max distribution speed of 1e18, unchanged here), so no initializeTokens or setMaxTokensDistributionSpeed call is needed.

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

export default vip665;
