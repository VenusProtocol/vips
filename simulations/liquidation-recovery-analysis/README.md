# Forced-liquidation recovery & liquidation-incentive leakage (VDB-30)

A standalone **risk-analysis fork simulation** (not a VIP — no governance state change is proposed).
It forks BSC mainnet, constructs a deterministic vBTC-collateralised position, forces it into
shortfall by crashing the BTCB oracle price, and then liquidates it end-to-end through the **real,
unmodified enforced `Liquidator` contract** until the account is healthy again.

It answers two questions empirically and reconciles the measurements against the closed-form
economics:

1. **Recovery path** — can an underwater vBTC position be brought back to health through the enforced
   `Liquidator`? (Yes — shortfall returns to `$0`.)
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

All core-pool liquidations must route through the `Liquidator` contract
(`0x0870793286aada55d39ce7f82fb2766e8004cf43`), which is the Comptroller's `liquidatorContract()`.
The seized-collateral split (`Liquidator._splitLiquidationIncentive`) is:

```
totalIncentive = comptroller.getEffectiveLiquidationIncentive(borrower, vTokenCollateral)  // 1.1e18
bonusMantissa  = totalIncentive - 1e18                                                       // 0.1e18
seized (vTokens) = repaidValue * totalIncentive / priceCollateral                            // = 1.1 × debt
bonusAmount      = seized * bonusMantissa / totalIncentive                                    // = seized × 0.1/1.1
treasury (ours)  = bonusAmount * treasuryPercentMantissa / 1e18                               // = 50% of bonus
liquidator (theirs) = seized - treasury                                                       // principal + 50% of bonus
```

The core vBTC market has **no** `protocolSeizeShareMantissa` (the getter reverts), so the whole
incentive split is performed inside the `Liquidator`. The treasury share is redeemed to BTCB and sent
to the `ProtocolShareReserve`; the liquidator share is transferred as vBTC vTokens.

**Leakage definition:** the *liquidation-incentive leakage* is the portion of the borrower's seized
collateral that leaves the protocol perimeter to the external liquidator as bonus, i.e.
`liquidator_value − debt_cleared ≈ 50% of the 10% bonus ≈ 5% of the debt value cleared`. The other
~5% is recaptured by the protocol treasury.

## Scenario (deterministic, on the fork)

A controlled position is built rather than depending on a transient real borrower, so the numbers are
exact and reproducible. Analysis knobs live at the top of `bscmainnet.ts`:

| Knob | Value | Meaning |
| --- | --- | --- |
| `SUPPLY_BTCB` | `2 BTCB` | collateral the borrower supplies |
| `BORROW_FRACTION_BPS` | `9000` | borrow 90% of the CF-adjusted limit (leaves a healthy buffer) |
| `PRICE_DROP_BPS` | `1800` | crash BTCB 18% to push the account into shortfall |
| `MAX_LIQUIDATIONS` | `12` | safety bound on the recovery loop |

Every **protocol** parameter that drives the result (close factor, liquidation incentive, treasury
percent, oracle prices, exchange rate) is read **live** on the fork block — nothing is hard-assumed.

Steps:

1. Source BTCB to a fresh borrower (impersonate a Binance hot wallet), mint vBTC, `enterMarkets`, and
   borrow USDT to 90% of the collateral-factor limit → account starts **healthy**.
2. Force shortfall: disable the BTCB pivot/fallback oracles in the `ResilientOracle`
   (`enableOracle(BTCB, PIVOT/FALLBACK, false)`) so `setDirectPrice` on the main Chainlink oracle flows
   straight through, then drop BTCB 18%. (Without disabling the pivot, the `BoundValidator` would
   reject the deviation and the real fallback price would be returned.) The price is only moved to
   *create* the shortfall — the liquidation itself runs against the real Liquidator/Comptroller/vToken.
3. A liquidator EOA repays up to the 50% close factor of the USDT debt through the `Liquidator`,
   seizing vBTC, repeated until `getAccountLiquidity` shortfall returns to `0`.
4. Measure balance deltas + parse `LiquidateBorrowedTokens` events, then reconcile the measured split
   against the closed-form formula (within ±0.5%).

## Findings (block #111600000)

```
=========================== LIQUIDATION-INCENTIVE LEAKAGE ===========================
 Fork block ............... bscmainnet #111600000
 Recovery ................. shortfall $8,393.636 -> $0 (healthy)
 Remaining debt (healthy)   $23,606.645  (fully collateralised)
 Residual bad debt ........ $0.00
-------------------------------------------------------------------------------------
 Debt cleared ............. $70,819.934
 Collateral seized ........ 1.448774 BTCB = $77,901.557  (110.00% of debt)
 Liquidation penalty (10%)  $7,081.624  (10.00% of debt)
-------------------------------------------------------------------------------------
 Treasury recapture ....... $3,540.98  (5.00% of debt)
 External leakage ......... $3,540.644  (5.00% of debt)
=====================================================================================
```

(Absolute USD figures scale with the live BTCB price at the pinned block; the **ratios** are the
invariant result.)

### Recovery path — proven

- BTCB `$65,574 → $53,771` (−18%) put the account `$8,393.64` into shortfall.
- **2** close-factor-bounded liquidations through the enforced `Liquidator` brought shortfall back to
  **`$0`** (healthy). ~`$23.6k` of USDT debt remains, but it is **fully collateralised** by the
  surviving ~`0.55 BTCB` — it is not bad debt.
- **Residual bad debt: `$0`.** The constructed scenario is sized so the position fully recovers before
  collateral is exhausted. (If collateral were exhausted while a shortfall remained, the simulation
  would instead report the residual borrow balance as bad debt.)

### Liquidation-incentive leakage — quantified

For every `$1` of debt cleared, `$1.10` of collateral is seized from the borrower (the 10% incentive):

- **`$0.05` (5%) leaks to the external liquidator** as bonus — value leaving the protocol perimeter.
- **`$0.05` (5%) is recaptured by the protocol treasury** (`ProtocolShareReserve`,
  `0xca01d5a9a248a830e9d93231e791b1affed7c446`).

The measured treasury/liquidator split reconciles with the `1.1` incentive × `0.5` `treasuryPercent`
formula to within `±0.5%` (dust-level rounding from per-iteration `redeem`/exchange-rate drift). The
`treasuryPercentMantissa = 0.5e18` is what determines the 50/50 split of the bonus; if governance
lowered it, a larger share of the 10% penalty would leak externally.
