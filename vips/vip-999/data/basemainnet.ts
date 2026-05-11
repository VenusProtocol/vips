import { parseUnits } from "ethers/lib/utils";

import { CapEntry, DelistEntry, PauseEntry } from "../bscmainnet";

export const COMPTROLLER = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";

// ─── vToken addresses (Base Core)
const vcbBTC = "0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72";
const vUSDC = "0x3cb752d175740043Ec463673094e06ACDa2F9a2e";
const vWETH = "0xEB8A79bD44cF4500943bf94a2b4434c95C008599";
const vwstETH = "0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5";
const vwsuperOETHb = "0x75201D81B3B0b9D17b179118837Be37f64fc4930";

// Full delist: borrow was already paused by the emergency pause.
// wsuperOETHb has non-zero CF (73%) and needs a setCollateralFactor call.
export const delistAssets: DelistEntry[] = [
  {
    symbol: "wsuperOETHb",
    vToken: vwsuperOETHb,
    oldCollateralFactor: parseUnits("0.73", 18),
    liquidationThreshold: parseUnits("0.78", 18),
    oldSupplyCap: parseUnits("2000", 18),
    oldBorrowCap: "0",
    borrowAlreadyPaused: true,
  },
];

export const marketCapChanges: CapEntry[] = [
  {
    symbol: "cbBTC",
    vToken: vcbBTC,
    supplyCap: { old: parseUnits("400", 8), new: parseUnits("65", 8) },
    borrowCap: { old: parseUnits("200", 8), new: parseUnits("52", 8) },
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    supplyCap: { old: parseUnits("30000000", 6), new: parseUnits("5000000", 6) },
    borrowCap: { old: parseUnits("27000000", 6), new: parseUnits("4000000", 6) },
  },
  {
    symbol: "WETH",
    vToken: vWETH,
    supplyCap: { old: parseUnits("10000", 18), new: parseUnits("2100", 18) },
    borrowCap: { old: parseUnits("9000", 18), new: parseUnits("1600", 18) },
  },
  {
    symbol: "wstETH",
    vToken: vwstETH,
    supplyCap: { old: parseUnits("2600", 18), new: parseUnits("1700", 18) },
    borrowCap: { old: parseUnits("260", 18), new: "0" },
  },
];

// Borrow pause changes
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "cbBTC", vToken: vcbBTC, old: true, new: false },
  { symbol: "USDC", vToken: vUSDC, old: true, new: false },
  { symbol: "WETH", vToken: vWETH, old: true, new: false },
];
