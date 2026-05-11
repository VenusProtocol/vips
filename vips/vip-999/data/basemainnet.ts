import { parseUnits } from "ethers/lib/utils";

import { CFEntry, CapEntry, PauseEntry } from "../bscmainnet";

export const COMPTROLLER = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";

// ─── vToken addresses (Base Core)
const vcbBTC = "0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72";
const vUSDC = "0x3cb752d175740043Ec463673094e06ACDa2F9a2e";
const vWETH = "0xEB8A79bD44cF4500943bf94a2b4434c95C008599";
const vwstETH = "0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5";
const vwsuperOETHb = "0x75201D81B3B0b9D17b179118837Be37f64fc4930";

export const cfChanges: CFEntry[] = [
  // Full delist of wsuperOETHb. LT preserved at current 78%.
  {
    symbol: "wsuperOETHb",
    vToken: vwsuperOETHb,
    before: parseUnits("0.73", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.78", 18).toString(),
  },
];

export const supplyCapChanges: CapEntry[] = [
  { symbol: "cbBTC", vToken: vcbBTC, before: parseUnits("400", 8).toString(), after: parseUnits("65", 8).toString() },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("30000000", 6).toString(),
    after: parseUnits("5000000", 6).toString(),
  },
  {
    symbol: "WETH",
    vToken: vWETH,
    before: parseUnits("10000", 18).toString(),
    after: parseUnits("2100", 18).toString(),
  },
  {
    symbol: "wstETH",
    vToken: vwstETH,
    before: parseUnits("2600", 18).toString(),
    after: parseUnits("1700", 18).toString(),
  },
  { symbol: "wsuperOETHb", vToken: vwsuperOETHb, before: parseUnits("2000", 18).toString(), after: "0" },
];

export const borrowCapChanges: CapEntry[] = [
  { symbol: "cbBTC", vToken: vcbBTC, before: parseUnits("200", 8).toString(), after: parseUnits("52", 8).toString() },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("27000000", 6).toString(),
    after: parseUnits("4000000", 6).toString(),
  },
  {
    symbol: "WETH",
    vToken: vWETH,
    before: parseUnits("9000", 18).toString(),
    after: parseUnits("1600", 18).toString(),
  },
  { symbol: "wstETH", vToken: vwstETH, before: parseUnits("260", 18).toString(), after: "0" },
];

// Borrow pause changes
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "cbBTC", vToken: vcbBTC, before: true, after: false },
  { symbol: "USDC", vToken: vUSDC, before: true, after: false },
  { symbol: "WETH", vToken: vWETH, before: true, after: false },
];
