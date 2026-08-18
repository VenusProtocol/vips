# VIP-643 Simulation Report — List Venus SK Hynix (vSKHYB) in the Venus Core Pool

## Overview

This report summarises the fork simulations run for VIP-643 on both BNB Chain testnet and BNB Chain mainnet. The VIP adds a new tokenized-equity market, **Venus SK Hynix (vSKHYB)**, backed by the BStock **SKHYB** token (SK Hynix equity), to the Venus Core Pool. Borrowing is paused at launch.

Both simulations passed. Test files:

- `simulations/vip-643/bsctestnet.ts` — BNB Chain testnet
- `simulations/vip-643/bscmainnet.ts` — BNB Chain mainnet

---

## Addresses verified

| Item                             | Network    | Address                                      |
| -------------------------------- | ---------- | -------------------------------------------- |
| MockSKHYB (underlying — testnet) | bsctestnet | `0xb52DE23C6D4be6Bb3E87fF64527E856Ab346FDf2` |
| SKHYB (underlying — mainnet)     | bscmainnet | `0xCA750eF65f295BBECd685Abf54e82CAf297BDB61` |
| vSKHYB                           | bsctestnet | `0x101843eAbA6b98fbF4bba078b86EFdE62DF0fc16` |
| vSKHYB                           | bscmainnet | `0x3E281461efb3D53EC20DB207674373Ed8Ef3BbA9` |
| JumpRateModel                    | bsctestnet | `0x1CcDaf39085bae4e27c3Ba100561b1AD1B5A6b80` |
| JumpRateModel                    | bscmainnet | `0xe589E884f69dF3137B43A760C4Ec9E55D944439D` |
| Atlas Oracle                     | bsctestnet | `0x7F00af2f30a55e79311392C98fBBfA629D19b3A5` |
| Atlas Oracle                     | bscmainnet | `0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0` |
| Atlas feed (SKHYB/USD)           | bscmainnet | `0x8A87B38D4c8ef07546A1DD87a9D58f0B36B11a2B` |
| Protocol Share Reserve           | bsctestnet | `0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3` |
| Protocol Share Reserve           | bscmainnet | `0xCa01D5A9A248a830E9D93231e791B1afFed7c446` |
| DeviationBoundedOracle (DBO)     | bsctestnet | `0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8` |
| DeviationBoundedOracle (DBO)     | bscmainnet | `0xc79Cb7efEBd121DC4B39eA141C214606595D665A` |

---

## Risk parameters verified

| Parameter                   | Value                     |
| --------------------------- | ------------------------- |
| Collateral Factor (Max LTV) | 50%                       |
| Liquidation Threshold       | 65%                       |
| Liquidation Incentive       | 10% bonus (`1.1e18`)      |
| Reserve Factor              | 10%                       |
| Supply Cap                  | 1250 SKHYB                |
| Borrow Cap                  | 0 (borrowing disabled)    |
| IRM base rate               | 0%                        |
| IRM multiplier              | 6.67%                     |
| IRM jump multiplier         | 627%                      |
| IRM kink                    | 75%                       |
| Bootstrap liquidity         | 0.65 SKHYB                |
| DBO trigger threshold       | 16.67% (`0.1667e18`)      |
| DBO reset threshold         | 5% (`0.05e18`)            |
| DBO cooldown period         | 3600 s (1 h)              |
| vTokens burned (10%)        | 0.065 vSKHYB → address(0) |
| vTokens to VTreasury        | remainder after burn      |
| `reduceReservesBlockDelta`  | 28 800 blocks             |

---

## BNB Chain Testnet Simulation

**Fork block:** `119048000` (after both MockSKHYB and vSKHYB were deployed on bsctestnet)

### Pre-VIP checks

- `comptroller.markets(vSKHYB).isListed` is `false` — market not yet listed.

### VIP execution — events asserted

| Event                         | Count |
| ----------------------------- | ----- |
| `MarketListed`                | 1     |
| `NewSupplyCap`                | 1     |
| `ActionPausedMarket`          | 1     |
| `NewAccessControlManager`     | 1     |
| `NewProtocolShareReserve`     | 1     |
| `NewReduceReservesBlockDelta` | 1     |
| `NewReserveFactor`            | 1     |
| `NewCollateralFactor`         | 1     |
| `NewLiquidationThreshold`     | 1     |
| `NewLiquidationIncentive`     | 1     |

### Post-VIP checks

**Oracle**

- `resilientOracle.getUnderlyingPrice(vSKHYB)` returns `parseUnits("130", 18)` (mocked direct price).

**vToken properties** (`checkVToken`)

- `name` = `"Venus SK Hynix"`
- `symbol` = `"vSKHYB"`
- `decimals` = `8`
- `underlying` = MockSKHYB (`0xb52DE23C6D4be6Bb3E87fF64527E856Ab346FDf2`)
- `exchangeRate` = `parseUnits("1", 28)`
- `comptroller` = Core Pool Unitroller

**Interest rate model** (`checkInterestRate`)

- Contract at `0x1CcDaf39085bae4e27c3Ba100561b1AD1B5A6b80`
- base = `0`, multiplier = `0.0667`, jump = `6.27`, kink = `0.75`

**Risk parameters** (`checkRiskParameters`)

- `collateralFactor` = `0.5e18`
- `liquidationThreshold` = `0.65e18`
- `liquidationIncentive` = `1.1e18`
- `reserveFactor` = `0.1e18`
- `supplyCap` = `1250e18`
- `borrowCap` = `0`

**Oracle Dynamic Protection Mode (DBO)**

- `dbo.assetProtectionConfig(SKHYB).isBoundedPricingEnabled` = `true`
- `dbo.assetProtectionConfig(SKHYB).triggerThreshold` = `0.1667e18` (16.67%)
- `dbo.assetProtectionConfig(SKHYB).resetThreshold` = `0.05e18` (5%)
- `dbo.assetProtectionConfig(SKHYB).cooldownPeriod` = `3600`
- `dbo.assetProtectionConfig(SKHYB).cachingEnabled` = `false`

**Market configuration**

- `admin` = Normal Timelock
- `accessControlManager` = Core ACM
- `protocolShareReserve` = `0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3`
- `reduceReservesBlockDelta` = `28800`
- `actionPaused(vSKHYB, BORROW)` = `true`

**Bootstrap liquidity**

- `vSKHYB.totalSupply` = `convertAmountToVTokens(0.65e18, 1e28)` (i.e. `0.065e8` = 6 500 000 cSKHYB units)
- `underlying.balanceOf(vSKHYB)` = `0.65e18`
- `vSKHYB.balanceOf(address(0))` = `0.065e8` (10% burned)
- `vSKHYB.balanceOf(VTreasury)` = remaining 90%
- `vSKHYB.balanceOf(NORMAL_TIMELOCK)` = `0` (no dust left)

---

## BNB Chain Mainnet Simulation

**Fork block:** `109922737` (latest block at authoring — vSKHYB deployed, Atlas SKHYB/USD feed live, and the VTreasury funded with `0.66 SKHYB`)

**Oracle stale-period workaround:** The governance lifecycle mines ~72 h of blocks. To prevent `getUnderlyingPrice` from reverting due to a stale feed, the VIP sets `maxStalePeriod = ONE_YEAR (31 536 000 s)` in simulations and `3800 s` in production. After all price assertions, the simulation rolls the period back to `3800 s` (using impersonated Normal Timelock) to confirm the production value is also settable. This pattern mirrors VIP-633 and VIP-615.

### Bootstrap setup — real on-chain treasury balance (no impersonation)

The VTreasury is now funded on-chain: it holds `0.66 SKHYB` (transferred at block `109922154`, tx `0x707e7b1b9a541e59ad8a1e18aa2ddd69058bf9fa5af396f2619a3587095d69a8`). The prior simulation-only impersonation/seed of the treasury has been **removed** — the VIP's `withdrawTreasuryBEP20` now draws the `0.65 SKHYB` bootstrap directly from the real balance, exactly as it will on-chain.

### Pre-VIP checks

- `comptroller.markets(vSKHYB).isListed` is `false`.
- `SKHYB.balanceOf(VTreasury)` ≥ `0.65e18` (real on-chain balance covers the bootstrap).

### VIP execution — events asserted

Same 10 events as testnet (each with count = 1).

### Post-VIP checks

**Oracle**

- `resilientOracle.getUnderlyingPrice(vSKHYB)` = `162656059522857396940` (~$162.66 from the Atlas feed at the fork block).
- `resilientOracle.getTokenConfig(SKHYB).oracles[0]` = Atlas Oracle (`0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0`), flag = `true`.
- `atlasOracle.tokenConfigs(SKHYB).feed` = `0x8A87B38D4c8ef07546A1DD87a9D58f0B36B11a2B` (Atlas SKHYB/USD SingleFeed, id 871).
- `atlasOracle.tokenConfigs(SKHYB).maxStalePeriod` = `ONE_YEAR` (simulation value, then rolled back to `3800` — see below).

**vToken properties** — same as testnet (name, symbol, decimals, exchangeRate, comptroller), underlying = SKHYB.

**Interest rate model** — same parameters, contract at `0xe589E884f69dF3137B43A760C4Ec9E55D944439D`.

**Risk parameters** — identical to testnet (CF 50%, LT 65%, LI 10%, RF 10%, cap 1250, borrow cap 0).

**Oracle Dynamic Protection Mode (DBO)**

- `dbo.assetProtectionConfig(SKHYB).isBoundedPricingEnabled` = `true`
- `dbo.assetProtectionConfig(SKHYB).triggerThreshold` = `0.1667e18` (16.67%)
- `dbo.assetProtectionConfig(SKHYB).resetThreshold` = `0.05e18` (5%)
- `dbo.assetProtectionConfig(SKHYB).cooldownPeriod` = `3600`
- `dbo.assetProtectionConfig(SKHYB).cachingEnabled` = `false`

**Market configuration**

- `admin` = Normal Timelock
- `accessControlManager` = Core ACM
- `protocolShareReserve` = `0xCa01D5A9A248a830E9D93231e791B1afFed7c446`
- `reduceReservesBlockDelta` = `28800`
- `actionPaused(vSKHYB, BORROW)` = `true`

**Bootstrap liquidity**

- `vSKHYB.totalSupply` = `convertAmountToVTokens(0.65e18, 1e28)`
- `underlying.balanceOf(vSKHYB)` = `0.65e18`
- `VTreasury` SKHYB balance decreased by exactly `0.65e18` (bootstrap drawn from the real treasury balance)
- `vSKHYB.balanceOf(address(0))` = `0.065e8` (10% burned)
- `vSKHYB.balanceOf(VTreasury)` = remaining 90%
- `vSKHYB.balanceOf(NORMAL_TIMELOCK)` = `0`

**Atlas stale-period rollback** (post-assertion)

- Normal Timelock calls `atlasOracle.setTokenConfig([SKHYB, feed, 3800])`.
- `atlasOracle.tokenConfigs(SKHYB).maxStalePeriod` = `3800` — confirms the production stale period is correctly set and that the Normal Timelock has the required permission.

---

## Operational note — VTreasury pre-funding

The VIP bootstraps liquidity via `withdrawTreasuryBEP20(SKHYB, 0.65e18, NORMAL_TIMELOCK)`. The VTreasury must hold at least `0.65 SKHYB` at the moment the VIP executes on-chain. **This is now satisfied on-chain:** the VTreasury holds `0.66 SKHYB` (funded at block `109922154`), so the bootstrap draws directly from the real balance with no simulation-only seeding. The balance should be preserved until the proposal is queued and executed.
