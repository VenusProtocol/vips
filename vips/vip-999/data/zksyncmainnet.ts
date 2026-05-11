import { parseUnits } from "ethers/lib/utils";

import { CapEntry, DelistEntry, PauseEntry } from "../bscmainnet";

export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";

// ─── vToken addresses (zkSync Era Core)
const vwUSDM = "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c";
const vZK = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";
const vWETH = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";
const vUSDT = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";
const vUSDC_e = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
const vWBTC = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";
const vUSDC = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";
const vwstETH = "0x03CAd66259f7F34EE075f8B62D133563D249eDa4";
const vzkETH = "0xCEb7Da150d16aCE58F090754feF2775C23C8b631";

// Full delist: borrow was already paused by the 2026-03-20 emergency pause.
// ZK / wstETH have non-zero CF and need a setCollateralFactor call.
// wUSDM / zkETH have CF already 0.
export const delistAssets: DelistEntry[] = [
  {
    symbol: "ZK",
    vToken: vZK,
    oldCollateralFactor: parseUnits("0.40", 18),
    liquidationThreshold: parseUnits("0.45", 18),
    oldSupplyCap: parseUnits("300000000", 18),
    oldBorrowCap: parseUnits("100000000", 18),
    borrowAlreadyPaused: true,
  },
  {
    symbol: "wstETH",
    vToken: vwstETH,
    oldCollateralFactor: parseUnits("0.71", 18),
    liquidationThreshold: parseUnits("0.76", 18),
    oldSupplyCap: parseUnits("350", 18),
    oldBorrowCap: parseUnits("35", 18),
    borrowAlreadyPaused: true,
  },
  {
    symbol: "wUSDM",
    vToken: vwUSDM,
    oldCollateralFactor: "0",
    liquidationThreshold: parseUnits("0.78", 18),
    oldSupplyCap: parseUnits("5000000", 18),
    oldBorrowCap: parseUnits("4000000", 18),
    borrowAlreadyPaused: true,
  },
  {
    symbol: "zkETH",
    vToken: vzkETH,
    oldCollateralFactor: "0",
    liquidationThreshold: parseUnits("0.75", 18),
    oldSupplyCap: parseUnits("650", 18),
    oldBorrowCap: "0",
    borrowAlreadyPaused: true,
  },
];

export const marketCapChanges: CapEntry[] = [
  {
    symbol: "WETH",
    vToken: vWETH,
    supplyCap: { old: parseUnits("6000", 18), new: parseUnits("450", 18) },
    borrowCap: { old: parseUnits("3400", 18), new: parseUnits("225", 18) },
  },
  {
    symbol: "USDT",
    vToken: vUSDT,
    supplyCap: { old: parseUnits("4000000", 6), new: parseUnits("1000000", 6) },
    borrowCap: { old: parseUnits("3300000", 6), new: parseUnits("800000", 6) },
  },
  {
    symbol: "USDC.e",
    vToken: vUSDC_e,
    supplyCap: { old: parseUnits("31000000", 6), new: parseUnits("1000000", 6) },
    borrowCap: { old: parseUnits("28000000", 6), new: parseUnits("800000", 6) },
  },
  {
    symbol: "WBTC",
    vToken: vWBTC,
    supplyCap: { old: parseUnits("90", 8), new: parseUnits("5", 8) },
    borrowCap: { old: parseUnits("45", 8), new: "0" },
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    supplyCap: { old: parseUnits("35000000", 6), new: parseUnits("1000000", 6) },
    borrowCap: { old: parseUnits("27000000", 6), new: parseUnits("800000", 6) },
  },
];

// Borrow pause changes
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "WETH", vToken: vWETH, old: true, new: false },
  { symbol: "USDT", vToken: vUSDT, old: true, new: false },
  { symbol: "USDC.e", vToken: vUSDC_e, old: true, new: false },
  { symbol: "USDC", vToken: vUSDC, old: true, new: false },
];
