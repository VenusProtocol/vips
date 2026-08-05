import { BigNumberish } from "ethers";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as bsc from "./data/bscmainnet";

// Core-pool collateral-factor change. setCollateralFactor(address,uint256,uint256)
// re-passes the liquidation threshold unchanged — only the CF moves.
export interface CFEntry {
  symbol: string;
  vToken: string;
  old: BigNumberish;
  new: BigNumberish;
  liquidationThreshold: BigNumberish;
}

// E-Mode pool liquidation-incentive change. setLiquidationIncentive(uint96,address,uint256).
export interface LIEntry {
  symbol: string;
  poolId: number;
  poolLabel: string;
  vToken: string;
  old: BigNumberish;
  new: BigNumberish;
}

// An E-Mode (poolId > 0) entry whose collateral factor and liquidation threshold
// this VIP must leave untouched. Deliberately carries no expected value: the
// simulation snapshots each one before execution and asserts it is identical
// after. E-Mode parameters are moved independently of this VIP (sUSDe's pool-1 CF
// moved between the fork block and 2026-08-05), so pinning numbers here would
// break on drift while proving nothing extra — the property under test is
// "unchanged by this proposal", not "equal to some constant".
export interface EModeInvariant {
  symbol: string;
  poolId: number;
  vToken: string;
}

// Market-wide supply-cap change. setMarketSupplyCaps(address[],uint256[]).
export interface SupplyCapEntry {
  symbol: string;
  vToken: string;
  old: BigNumberish;
  new: BigNumberish;
}

const meta = {
  version: "v2",
  title: "VIP-653 [BNB Chain] Core Pool Risk Parameter Update",
  description: `#### Summary

This proposal updates collateral factors, the XVS supply cap, and the sUSDe liquidation incentive in the BNB Chain Core pool. Liquidation thresholds are re-passed unchanged on every collateral-factor row, so no existing position becomes liquidatable. Refer to the community post for the full background and rationale.

#### Proposed Changes

- **asBNB** — Core, collateral factor: 72% → 60%
- **slisBNB** — Core, collateral factor: 80% → 72%
- **XRP** — Core, collateral factor: 65% → 50%
- **SOL** — Core, collateral factor: 72% → 65%
- **USDe** — Core, collateral factor: 75% → 70%
- **FDUSD** — Core, collateral factor: 75% → 65%
- **XVS** — Core, collateral factor: 0% → 45%
- **XVS** — Core, supply cap: 1.85M XVS → 1.15M XVS
- **sUSDe** — E-Mode "Stablecoins" (pool 1), liquidation incentive: 8% → 6%

#### Actions

This VIP performs the following 10 actions on BNB Chain. Actions 1-9 target the Core pool Comptroller 0xfD36E2c2a6789Db23113685031d7F16329158384; action 10 targets the Emergency Brake 0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec.

1. **asBNB collateral factor 72% → 60%** — Calls setCollateralFactor(address,uint256,uint256) on the Core Comptroller for vasBNB (0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF), with the liquidation threshold re-passed unchanged at 72%.
2. **slisBNB collateral factor 80% → 72%** — Calls setCollateralFactor(address,uint256,uint256) for vslisBNB (0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc), liquidation threshold unchanged at 80%.
3. **XRP collateral factor 65% → 50%** — Calls setCollateralFactor(address,uint256,uint256) for vXRP (0xB248a295732e0225acd3337607cc01068e3b9c10), liquidation threshold unchanged at 65%.
4. **SOL collateral factor 72% → 65%** — Calls setCollateralFactor(address,uint256,uint256) for vSOL (0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC), liquidation threshold unchanged at 72%.
5. **USDe collateral factor 75% → 70%** — Calls setCollateralFactor(address,uint256,uint256) for vUSDe (0x74ca6930108F775CC667894EEa33843e691680d7), liquidation threshold unchanged at 75%.
6. **FDUSD collateral factor 75% → 65%** — Calls setCollateralFactor(address,uint256,uint256) for vFDUSD (0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba), liquidation threshold unchanged at 75%.
7. **XVS collateral factor 0% → 45%** — Calls setCollateralFactor(address,uint256,uint256) for vXVS (0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D), resuming XVS as collateral. Its liquidation threshold remains 60% and is re-passed unchanged.
8. **sUSDe liquidation incentive 8% → 6%** — Calls setLiquidationIncentive(uint96,address,uint256) on the Core Comptroller for pool 1 (E-Mode "Stablecoins") and vsUSDe (0x699658323d58eE25c69F1a29d476946ab011bD18), aligning sUSDe with USDe at 6% in the same pool.
9. **XVS supply cap 1.85M → 1.15M XVS** — Calls setMarketSupplyCaps(address[],uint256[]) on the Core Comptroller for vXVS (0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D), setting the supply cap to 1,150,000 XVS, approximately $3.1M at current prices.
10. **Clear the emergency-brake collateral-factor snapshot for XVS** — Calls resetCFSnapshot(address) on the Emergency Brake for vXVS (0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D). The brake recorded XVS's pre-brake pair (55% / 60%) when it set the collateral factor to 0% on 24 June 2026. That snapshot is write-once, so clearing it stops the stale 55% from being read as the governed value and lets a future brake record the value this proposal sets. This changes no market parameter.

PT-sUSDE-26JUN2025 is not part of this proposal: its collateral factor and liquidation threshold were already set to 0% on 12 July 2026.

Implementation and fork simulation: [VenusProtocol/vips#749](https://github.com/VenusProtocol/vips/pull/749). Risk analysis: [Allez Labs — Risk Parameter Updates 2026-06-23](https://community.venus.io/t/allez-labs-risk-parameter-updates-2026-06-23/5835/1).

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution
`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip653 = () =>
  makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────────
      // Core-pool collateral-factor changes (LT re-passed unchanged).
      // ──────────────────────────────────────────────────────────────────────────
      ...bsc.cfChanges.map(c => ({
        target: bsc.COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [c.vToken, c.new, c.liquidationThreshold],
      })),

      // ──────────────────────────────────────────────────────────────────────────
      // E-Mode "Stablecoins" pool (pool 1) liquidation-incentive change.
      // ──────────────────────────────────────────────────────────────────────────
      ...bsc.liChanges.map(l => ({
        target: bsc.COMPTROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [l.poolId, l.vToken, l.new],
      })),

      // ──────────────────────────────────────────────────────────────────────────
      // Market-wide supply-cap reduction (XVS).
      // ──────────────────────────────────────────────────────────────────────────
      {
        target: bsc.COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [bsc.supplyCapChanges.map(s => s.vToken), bsc.supplyCapChanges.map(s => s.new)],
      },

      // ──────────────────────────────────────────────────────────────────────────
      // Clear the EBrake's stale CF snapshot for XVS. It still holds the
      // pre-brake 55%/60% pair from 2026-06-24; the snapshot is first-write-wins,
      // so leaving it would keep advertising 55% as the value to restore and
      // would stop a future brake from recording the 45% set above.
      // ──────────────────────────────────────────────────────────────────────────
      {
        target: bsc.EBRAKE,
        signature: "resetCFSnapshot(address)",
        params: [bsc.vXVS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip653;
