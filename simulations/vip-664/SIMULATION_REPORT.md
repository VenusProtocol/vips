# VIP-664 Simulation Report — List Venus SK Hynix (vSKHYB) in the Venus Core Pool

## Overview

This report summarises the fork simulations run for VIP-664 on both BNB Chain testnet and BNB Chain mainnet. The VIP adds a new tokenized-equity market, **Venus SK Hynix (vSKHYB)**, backed by the BStock **SK4B** token (SK Hynix equity), to the Venus Core Pool. Borrowing is paused at launch.

Both simulations passed. Test files:

- `simulations/vip-664/bsctestnet.ts` — BNB Chain testnet
- `simulations/vip-664/bscmainnet.ts` — BNB Chain mainnet

---

## Addresses verified

| Item                             | Network    | Address                                      |
| -------------------------------- | ---------- | -------------------------------------------- |
| MockSKHYB (underlying — testnet) | bsctestnet | `0xb52DE23C6D4be6Bb3E87fF64527E856Ab346FDf2` |
| SK4B (underlying — mainnet)      | bscmainnet | `0xCA750eF65f295BBECd685Abf54e82CAf297BDB61` |
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
| Bootstrap liquidity         | 0.51 SK4B                 |
| DBO trigger threshold       | 16.67% (`0.1667e18`)      |
| DBO reset threshold         | 5% (`0.05e18`)            |
| DBO cooldown period         | 3600 s (1 h)              |
| vTokens burned (10%)        | 0.051 vSKHYB → address(0) |
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

- `dbo.assetProtectionConfig(SK4B).isBoundedPricingEnabled` = `true`
- `dbo.assetProtectionConfig(SK4B).triggerThreshold` = `0.1667e18` (16.67%)
- `dbo.assetProtectionConfig(SK4B).resetThreshold` = `0.05e18` (5%)
- `dbo.assetProtectionConfig(SK4B).cooldownPeriod` = `3600`
- `dbo.assetProtectionConfig(SK4B).cachingEnabled` = `false`

**Market configuration**

- `admin` = Normal Timelock
- `accessControlManager` = Core ACM
- `protocolShareReserve` = `0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3`
- `reduceReservesBlockDelta` = `28800`
- `actionPaused(vSKHYB, BORROW)` = `true`

**Bootstrap liquidity**

- `vSKHYB.totalSupply` = `convertAmountToVTokens(0.51e18, 1e28)` (i.e. `0.051e8` = 5 100 000 cSKHYB units)
- `underlying.balanceOf(vSKHYB)` = `0.51e18`
- `vSKHYB.balanceOf(address(0))` = `0.051e8` (10% burned)
- `vSKHYB.balanceOf(VTreasury)` = remaining 90%
- `vSKHYB.balanceOf(NORMAL_TIMELOCK)` = `0` (no dust left)

---

## BNB Chain Mainnet Simulation

**Fork block:** `109906000` (after vSKHYB was deployed and the Atlas SKHYB/USD feed was live)

**Oracle stale-period workaround:** The governance lifecycle mines ~72 h of blocks. To prevent `getUnderlyingPrice` from reverting due to a stale feed, the VIP sets `maxStalePeriod = ONE_YEAR (31 536 000 s)` in simulations and `3800 s` in production. After all price assertions, the simulation rolls the period back to `3800 s` (using impersonated Normal Timelock) to confirm the production value is also settable. This pattern mirrors VIP-633 and VIP-615.

### Bootstrap setup (simulation only)

The VTreasury does not hold SK4B on-chain yet (it is an operational precondition at on-chain execution time). The simulation deals `0.51 SK4B` to the VTreasury by impersonating the holder `0x8894e0a0c962cb723c1976a4421c95949be2d4e3`, making `withdrawTreasuryBEP20` succeed without any dependency on a live treasury balance.

### Pre-VIP checks

- `comptroller.markets(vSKHYB).isListed` is `false`.

### VIP execution — events asserted

Same 10 events as testnet (each with count = 1).

### Post-VIP checks

**Oracle**

- `resilientOracle.getUnderlyingPrice(vSKHYB)` = `162147041208637701100` (~$162.15 from the Atlas feed at the fork block).
- `resilientOracle.getTokenConfig(SK4B).oracles[0]` = Atlas Oracle (`0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0`), flag = `true`.
- `atlasOracle.tokenConfigs(SK4B).feed` = `0x8A87B38D4c8ef07546A1DD87a9D58f0B36B11a2B` (Atlas SKHYB/USD SingleFeed, id 871).
- `atlasOracle.tokenConfigs(SK4B).maxStalePeriod` = `ONE_YEAR` (simulation value, then rolled back to `3800` — see below).

**vToken properties** — same as testnet (name, symbol, decimals, exchangeRate, comptroller), underlying = SK4B.

**Interest rate model** — same parameters, contract at `0xe589E884f69dF3137B43A760C4Ec9E55D944439D`.

**Risk parameters** — identical to testnet (CF 50%, LT 65%, LI 10%, RF 10%, cap 1250, borrow cap 0).

**Oracle Dynamic Protection Mode (DBO)**

- `dbo.assetProtectionConfig(SK4B).isBoundedPricingEnabled` = `true`
- `dbo.assetProtectionConfig(SK4B).triggerThreshold` = `0.1667e18` (16.67%)
- `dbo.assetProtectionConfig(SK4B).resetThreshold` = `0.05e18` (5%)
- `dbo.assetProtectionConfig(SK4B).cooldownPeriod` = `3600`
- `dbo.assetProtectionConfig(SK4B).cachingEnabled` = `false`

**Market configuration**

- `admin` = Normal Timelock
- `accessControlManager` = Core ACM
- `protocolShareReserve` = `0xCa01D5A9A248a830E9D93231e791B1afFed7c446`
- `reduceReservesBlockDelta` = `28800`
- `actionPaused(vSKHYB, BORROW)` = `true`

**Bootstrap liquidity**

- `vSKHYB.totalSupply` = `convertAmountToVTokens(0.51e18, 1e28)`
- `underlying.balanceOf(vSKHYB)` = `0.51e18`
- `vSKHYB.balanceOf(address(0))` = `0.051e8` (10% burned)
- `vSKHYB.balanceOf(VTreasury)` = remaining 90%
- `vSKHYB.balanceOf(NORMAL_TIMELOCK)` = `0`

**Atlas stale-period rollback** (post-assertion)

- Normal Timelock calls `atlasOracle.setTokenConfig([SK4B, feed, 3800])`.
- `atlasOracle.tokenConfigs(SK4B).maxStalePeriod` = `3800` — confirms the production stale period is correctly set and that the Normal Timelock has the required permission.

---

## Operational note — VTreasury pre-funding

The VIP bootstraps liquidity via `withdrawTreasuryBEP20(SK4B, 0.51e18, NORMAL_TIMELOCK)`. The VTreasury must hold at least `0.51 SK4B` **at the moment the VIP executes on-chain**. This is an operational precondition, not a code blocker — the BStock team should transfer `0.51 SK4B` to the VTreasury before the proposal is queued for execution.
