# Forced-liquidation recovery & liquidation-incentive leakage (VDB-30)

A standalone **risk-analysis fork simulation** (not a VIP — no governance state change is proposed).
It reproduces the **forced-liquidation recovery mechanism** that Venus governance used in
**VIP-172 / VIP-186 / VIP-191** (which together recovered ~$13.5M in Sept 2025): a **healthy but
stuck** (over-collateralised) position is unwound by enabling _forced liquidation_ on the borrowed
market and liquidating it end-to-end through the **real, unmodified enforced `Liquidator` contract**
— **without ever creating a shortfall or manipulating the oracle**.

This mirrors the AutoFarm-recovery context: the affected positions are **healthy** — funds are sitting
in Venus but cannot be moved by the buggy strategy contracts. A shortfall never occurs, so recovery
cannot rely on liquidation-on-shortfall; it must use the governance forced-liquidation path.

It answers two questions empirically and reconciles the measurements against the closed-form economics:

1. **Recovery path** — can a healthy-but-stuck vBTC-collateralised position be fully unwound through
   the enforced `Liquidator` without a shortfall? (Yes — the entire debt is repaid in one forced
   liquidation, the residual collateral is returned to the borrower, and bad debt stays `$0`.)
2. **Liquidation-incentive leakage** — of the value seized from the borrower, how much leaks to the
   external liquidator as bonus vs. how much the protocol treasury (`ProtocolShareReserve`) recaptures?

## How to run

```bash
# requires ARCHIVE_NODE_bscmainnet in .env (or the environment)
npx hardhat test simulations/liquidation-recovery-analysis/bscmainnet.ts --fork bscmainnet
```

- **Fork network:** bscmainnet
- **Pinned block:** `111600000` (pinned in `bscmainnet.ts` for reproducibility)

## Mechanics

### Forced liquidation (the recovery path, no shortfall)

Forced liquidation was added to the Core pool in **VIP-172**. When
`comptroller.isForcedLiquidationEnabled(vTokenBorrowed)` is `true`, the Comptroller's
`liquidateBorrowAllowed`:

- **skips the shortfall requirement** — a healthy (health-factor > 1) position can be liquidated; and
- **skips the close-factor cap** — up to 100% of the debt can be repaid in a single transaction
  (the only remaining cap is `repayAmount ≤ borrowBalance`).

Only Normal / Fast-track / Critical timelocks may toggle it (`_setForcedLiquidation(vToken,bool)`,
authorised in VIP-172). The simulation impersonates the **Normal Timelock**
(`0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396`) to enable it on the borrowed market (vUSDT) — exactly
the governance action a recovery VIP would perform. **No oracle price is touched.**

### The seized-collateral split

All core-pool liquidations must route through the `Liquidator` contract
(`0x0870793286aada55d39ce7f82fb2766e8004cf43`), which is the Comptroller's `liquidatorContract()`.
The split (`Liquidator._splitLiquidationIncentive`) is:

```
totalIncentive   = comptroller.getEffectiveLiquidationIncentive(borrower, vTokenCollateral)  // 1.1e18
bonusMantissa    = totalIncentive - 1e18                                                       // 0.1e18
seized (vTokens) = repaidValue * totalIncentive / priceCollateral                             // = 1.1 × debt
bonusAmount      = seized * bonusMantissa / totalIncentive                                     // = seized × 0.1/1.1
treasury (ours)  = bonusAmount * treasuryPercentMantissa / 1e18                                // = 50% of bonus
liquidator (theirs) = seized - treasury                                                        // principal + 50% of bonus
```

The core vBTC market has **no** `protocolSeizeShareMantissa` (the getter reverts), so the whole
incentive split is performed inside the `Liquidator`. The treasury share is redeemed to BTCB and sent
to the `ProtocolShareReserve`; the liquidator share is transferred as vBTC vTokens.

**Leakage definition:** the _liquidation-incentive leakage_ is the portion of the borrower's seized
collateral that leaves the protocol perimeter to the external liquidator as bonus, i.e.
`liquidator_value − debt_cleared ≈ 50% of the 10% bonus ≈ 5% of the debt value cleared`. The other
~5% is recaptured by the protocol treasury.

## Scenario (deterministic, on the fork)

A controlled position is built rather than depending on a transient real borrower, so the numbers are
exact and reproducible. Analysis knobs live at the top of `bscmainnet.ts`:

| Knob                  | Value    | Meaning                                                         |
| --------------------- | -------- | --------------------------------------------------------------- |
| `SUPPLY_BTCB`         | `2 BTCB` | collateral the borrower supplies                                |
| `BORROW_FRACTION_BPS` | `9000`   | borrow 90% of the CF-adjusted limit (position stays healthy)    |
| `MAX_LIQUIDATIONS`    | `4`      | safety bound on the recovery loop (forced liq clears in 1 step) |

Every **protocol** parameter that drives the result (close factor, liquidation incentive, treasury
percent, oracle prices, exchange rate) is read **live** on the fork block — nothing is hard-assumed.

Steps:

1. Source BTCB to a fresh borrower (impersonate a Binance hot wallet), mint vBTC, `enterMarkets`, and
   borrow USDT to 90% of the collateral-factor limit → account is **healthy** (shortfall `$0`).
2. Impersonate the Normal Timelock and `_setForcedLiquidation(vUSDT, true)`. Assert the account is
   **still healthy** — nothing about its risk changed; it just became eligible for a governance
   forced liquidation. **No oracle price is modified; no shortfall is created.**
3. A liquidator EOA repays **100% of the USDT debt in a single forced liquidation** through the
   enforced `Liquidator` (proving the close factor was bypassed — the first repay far exceeds the 50%
   cap), seizing vBTC. A short loop then sweeps the sub-cent interest that accrued between the
   balance read and the tx, bringing the debt to exactly `$0`.
4. Measure balance deltas + parse `LiquidateBorrowedTokens` events, then reconcile the measured split
   against the closed-form formula (within ±0.5%). Everything is valued at the **real, unmodified**
   BTCB price.

## Findings (block #111600000)

```
=========================== FORCED-LIQUIDATION RECOVERY & LEAKAGE ===========================
 Fork block ............... bscmainnet #111600000
 Mechanism ................ governance forced liquidation (VIP-172/186/191), no shortfall
 Debt before recovery ..... $94,426.576  (position healthy throughout)
 Remaining debt ........... $0.00  (fully unwound)
 Residual collateral ...... 0.416012 BTCB = $27,279.584  (returned to borrower)
 Residual bad debt ........ $0.00
---------------------------------------------------------------------------------------------
 Debt cleared ............. $94,426.576
 Collateral seized ........ 1.583988 BTCB = $103,868.438  (110.00% of debt)
 Liquidation penalty (10%)  $9,441.862  (10.00% of debt)
---------------------------------------------------------------------------------------------
 Treasury recapture ....... $4,721.293  (5.00% of debt)
 External leakage ......... $4,720.569  (5.00% of debt)
=============================================================================================
```

(Absolute USD figures scale with the live BTCB price at the pinned block; the **ratios** are the
invariant result.)

### Recovery path — proven (no shortfall)

- The position is **healthy throughout** — it is never in shortfall and the oracle is never touched.
- Governance enables forced liquidation on vUSDT; **one** forced liquidation through the enforced
  `Liquidator` repays the **entire** `$94,426.58` USDT debt in a single transaction — `~2×` the amount
  the 50% close factor would normally permit — proving the close-factor bypass. (Two further sub-cent
  transactions sweep interest-accrual dust so the debt lands at exactly `$0`.)
- The borrower keeps the **residual collateral** (`~0.416 BTCB ≈ $27.3k`), which is now freely
  withdrawable — the stuck position has been fully unwound.
- **Residual bad debt: `$0`.** The position is over-collateralised throughout, so collateral is never
  exhausted. (If a scenario ever exhausted collateral before the debt cleared, the simulation would
  instead report the residual borrow balance as bad debt.)

### Liquidation-incentive leakage — quantified

For every `$1` of debt cleared, `$1.10` of collateral is seized from the borrower (the 10% incentive):

- **`$0.05` (5%) leaks to the external liquidator** as bonus — value leaving the protocol perimeter.
- **`$0.05` (5%) is recaptured by the protocol treasury** (`ProtocolShareReserve`,
  `0xca01d5a9a248a830e9d93231e791b1affed7c446`).

The measured treasury/liquidator split reconciles with the `1.1` incentive × `0.5` `treasuryPercent`
formula to within `±0.5%` (dust-level rounding from the treasury `redeem` / exchange-rate drift). The
`treasuryPercentMantissa = 0.5e18` is what determines the 50/50 split of the bonus; if governance
lowered it, a larger share of the 10% penalty would leak externally.

> **Recovery-cost takeaway.** Forced liquidation recovers a stuck position in full with **zero bad
> debt**, at a cost of the **10% liquidation penalty** on the seized collateral. Half of that penalty
> (~5% of the cleared debt) is recaptured by the protocol treasury; the other half (~5%) is paid to
> whoever executes the liquidation. Routing the liquidation through a protocol-controlled liquidator
> would return that external 5% to the protocol/borrower as well.
