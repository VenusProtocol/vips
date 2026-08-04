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

const meta = {
  version: "v2",
  title: "VIP-664 [BNB Chain] Risk Parameter Update (June 2026 Re-proposal)",
  description: `#### Summary

Re-proposal of the 2026-06-23 BNB Core risk-parameter update (Allez Labs consolidated change table, plus two Venus additions). All values were read on-chain from the BNB Core Comptroller on 2026-08-04 and match the table. Liquidation thresholds are left unchanged for every collateral-factor row, so no existing position becomes liquidatable — the collateral-factor cuts reduce new borrow power only.

Full rationale: [Allez Labs — Risk Parameter Updates 2026-06-23](https://community.venus.io/t/allez-labs-risk-parameter-updates-2026-06-23/5835/1).

#### Core Pool — collateral-factor changes

- **asBNB**: 72% → 60% (low DEX exit liquidity vs supply).
- **slisBNB**: 80% → 72% (move to sub-BNB CF).
- **wBETH**: 80% → 60% (liquidation load at a −10% price move).
- **XRP**: 65% → 50% (calibrated to EVT 5yr / 2h).
- **SOL**: 72% → 65% (EVT 5yr / 2h + on-chain liquidity).
- **USDe**: 75% → 50% (minimal BSC DEX depth).
- **FDUSD**: 75% → 65% (right-sized; see stranded-exposure note below).
- **XVS**: 0% → 50% — resume as collateral. Liquidation threshold stays 60% (untouched).

#### E-Mode "Stablecoins" pool (pool 1) — liquidation-incentive change

- **sUSDe**: liquidation incentive 8% → 6%, aligning with USDe (6%) in the same pool.

#### FDUSD note

FDUSD lands at CF 65% (the forum post proposed 50%). At 65% two small positions become repay-only (not liquidatable — the liquidation threshold is untouched): ~$193K debt on one account (~$3.9K short of its 66.34% break-even) and a ~$18K dust account, for ~$206K of accepted stranded exposure. The multi-million looping position that forced the June rollback is no longer present.

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
    ],
    meta,
    ProposalType.REGULAR,
  );

export default vip664;
