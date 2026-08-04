import { parseUnits } from "ethers/lib/utils";

import { CFEntry, LIEntry } from "../bscmainnet";

// BNB Core Comptroller (Diamond / Unitroller).
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

// ─── vToken addresses (BNB Core).
const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
const vslisBNB = "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc";
const vwBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const vXRP = "0xB248a295732e0225acd3337607cc01068e3b9c10";
const vSOL = "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC";
const vUSDe = "0x74ca6930108F775CC667894EEa33843e691680d7";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const vXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

// E-Mode "Stablecoins" pool (pool 1) sUSDe market.
const vsUSDe = "0x699658323d58eE25c69F1a29d476946ab011bD18";

// Core-pool CF changes. setCollateralFactor(address,uint256,uint256).
// Only the collateral factor moves — the liquidation threshold is preserved at
// its current on-chain value for every row (the setter takes both, so LT must
// be re-passed unchanged). `old`/`liquidationThreshold` are pinned to on-chain
// reads (block 2026-08-04) so the pre-VIP simulation asserts them.
export const cfChanges: CFEntry[] = [
  {
    symbol: "asBNB",
    vToken: vasBNB,
    old: parseUnits("0.72", 18),
    new: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.72", 18),
  },
  {
    symbol: "slisBNB",
    vToken: vslisBNB,
    old: parseUnits("0.8", 18),
    new: parseUnits("0.72", 18),
    liquidationThreshold: parseUnits("0.8", 18),
  },
  {
    symbol: "wBETH",
    vToken: vwBETH,
    old: parseUnits("0.8", 18),
    new: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.8", 18),
  },
  {
    symbol: "XRP",
    vToken: vXRP,
    old: parseUnits("0.65", 18),
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.65", 18),
  },
  {
    symbol: "SOL",
    vToken: vSOL,
    old: parseUnits("0.72", 18),
    new: parseUnits("0.65", 18),
    liquidationThreshold: parseUnits("0.72", 18),
  },
  {
    symbol: "USDe",
    vToken: vUSDe,
    old: parseUnits("0.75", 18),
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.75", 18),
  },
  {
    symbol: "FDUSD",
    vToken: vFDUSD,
    old: parseUnits("0.75", 18),
    new: parseUnits("0.65", 18),
    liquidationThreshold: parseUnits("0.75", 18),
  },
  // XVS: resume as collateral, 0% -> 50%. LT stays 60% (untouched).
  {
    symbol: "XVS",
    vToken: vXVS,
    old: "0",
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.6", 18),
  },
];

// E-Mode pool liquidation-incentive change. setLiquidationIncentive(uint96,address,uint256).
// Aligns sUSDe's liquidation bonus in the "Stablecoins" pool (pool 1) with USDe
// (1.06e18) in the same pool. Only sUSDe's LI moves.
export const liChanges: LIEntry[] = [
  {
    symbol: "sUSDe",
    poolId: 1,
    poolLabel: "Stablecoins",
    vToken: vsUSDe,
    old: parseUnits("1.08", 18),
    new: parseUnits("1.06", 18),
  },
];
