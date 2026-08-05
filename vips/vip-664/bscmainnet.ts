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
  title: "VIP-664 [BNB Chain] Risk Parameter Update (June 2026 Re-proposal)",
  description: `#### Summary

Re-proposal of the 2026-06-23 BNB Core risk-parameter update (Allez Labs consolidated change table, plus Venus additions), with three deliberate departures from that table: **wBETH is dropped**, and **USDe** and **FDUSD** land above the proposed values. Each is called out below. Every current value was read on-chain from the BNB Core Comptroller and matches what this proposal re-passes.

**No liquidation threshold moves.** \`setCollateralFactor(address,uint256,uint256)\` takes the collateral factor and the liquidation threshold together, so every row re-passes its current on-chain threshold verbatim; the setter only writes the threshold when the value differs, so no threshold is written at all and no \`NewLiquidationThreshold\` event is emitted. No existing position becomes liquidatable — the collateral-factor cuts reduce new borrow power only. E-Mode parameters are equally untouched: this setter is hardcoded to the core pool.

Full rationale: [Allez Labs — Risk Parameter Updates 2026-06-23](https://community.venus.io/t/allez-labs-risk-parameter-updates-2026-06-23/5835/1).

#### Core Pool — collateral-factor changes

- **asBNB**: 72% → 60% (low DEX exit liquidity vs supply).
- **slisBNB**: 80% → 72% (move to sub-BNB CF).
- **XRP**: 65% → 50% (calibrated to EVT 5yr / 2h).
- **SOL**: 72% → 65% (EVT 5yr / 2h + on-chain liquidity).
- **USDe**: 75% → 70%. The forum post proposed 50% on minimal BSC DEX depth; this proposal reduces to 70% instead.
- **FDUSD**: 75% → 65% (the post proposed 50%; see stranded-exposure note below).
- **XVS**: 0% → 45% — resume as collateral, paired with the supply-cap reduction below. Liquidation threshold stays 60% (untouched).

**wBETH is excluded.** The table proposed 80% → 60% on liquidation load at a −10% price move. It is not part of this proposal; wBETH keeps its current 80% collateral factor.

#### Core Pool — supply-cap change

- **XVS**: supply cap 1,850,000 → 1,150,000 XVS. About 898.6k XVS is supplied today, so the new cap is above current usage and strands no existing supplier; it bounds further growth. Together with the 45% collateral factor, the borrow power this resumption can create is capped at ~517,500 XVS-equivalent (~$1.4M at the 2026-08-05 price of ~$2.70), against ~$2.5M under a 50% factor at the old cap. Borrowing XVS itself remains paused with a zero borrow cap.

#### E-Mode "Stablecoins" pool (pool 1) — liquidation-incentive change

- **sUSDe**: liquidation incentive 8% → 6%. Beyond aligning with USDe (6%) in the same pool, this restores a solvency margin: at the pool's 92.5% liquidation threshold, an 8% incentive leaves a liquidator eligible to seize 99.9% of the collateral backing a liquidatable position, versus 98.05% at 6%.

#### Emergency-brake snapshot

XVS's collateral factor was set to 0% on 2026-06-24 by the emergency brake, which recorded the pre-brake pair (55% / 60%) as a snapshot. That snapshot is write-once, so leaving it in place would keep pointing at 55% rather than the 45% governed here, and would prevent a future brake from recording the value this proposal sets. The proposal therefore also calls \`resetCFSnapshot\` on the emergency brake for the XVS market, clearing it. This changes no market parameter.

#### FDUSD note

FDUSD lands at CF 65%. At 65% two small positions become repay-only (not liquidatable — the liquidation threshold is untouched): ~$193K debt on one account (~$3.9K short of its 66.34% break-even) and a ~$18K dust account, for ~$206K of accepted stranded exposure. That figure was measured against the original June bundle, which also cut wBETH to 60% and USDe to 50%; since dropping and softening those rows can only raise an account's borrow power, it is an upper bound here. The multi-million looping position that forced the June rollback is no longer present.

PT-sUSDE-26JUN2025 (in the original post at CF 70% → 0%) is excluded: its CF and LT were already set to 0% on 2026-07-12.
`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip664 = () =>
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

export default vip664;
