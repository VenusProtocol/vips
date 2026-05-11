import { parseUnits } from "ethers/lib/utils";

import { CFEntry, CapEntry, PauseEntry } from "../bscmainnet";

// Arbitrum Core Pool (IL-style Comptroller).
export const COMPTROLLER = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";

// ─── vToken addresses (Arbitrum Core) — verified against docs-v4.venus.io
// vUSDT_Core is the canonical USD₮0 market (Tether's omnichain USDT0 has
// replaced legacy bridged USDT on Arbitrum).
const vUSDT0 = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
const vWBTC = "0xaDa57840B372D4c28623E87FC175dE8490792811";
const vWETH = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
const vUSDC = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
const vARB = "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6";
// vgmBTC-USDC_Core (0x4f3a73f318C5EA67A86eaaCE24309F29f89900dF) and
// vgmETH-USDC_Core (0x9bb8cEc9C0d46F53b4f2173BB2A0221F66c353cC) have no
// active changes in this proposal — supply caps unchanged, borrow caps
// already 0, borrow paused already true.

// `before` values fetched via cast call against the live Core Comptroller.
export const cfChanges: CFEntry[] = [
  // ARB: 55% -> 25%. LT preserved at current 60%.
  {
    symbol: "ARB",
    vToken: vARB,
    before: parseUnits("0.55", 18).toString(),
    after: parseUnits("0.25", 18).toString(),
    liquidationThreshold: parseUnits("0.6", 18).toString(),
  },
];

export const supplyCapChanges: CapEntry[] = [
  {
    symbol: "USD₮0",
    vToken: vUSDT0,
    before: parseUnits("20000000", 6).toString(),
    after: parseUnits("5000000", 6).toString(),
  },
  { symbol: "WBTC", vToken: vWBTC, before: parseUnits("900", 8).toString(), after: parseUnits("65", 8).toString() },
  {
    symbol: "WETH",
    vToken: vWETH,
    before: parseUnits("26000", 18).toString(),
    after: parseUnits("2100", 18).toString(),
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("54000000", 6).toString(),
    after: parseUnits("5000000", 6).toString(),
  },
  {
    symbol: "ARB",
    vToken: vARB,
    before: parseUnits("16000000", 18).toString(),
    after: parseUnits("10000000", 18).toString(),
  },
  // gmBTC and gmETH supply caps unchanged per proposal — omitted (no-op).
];

export const borrowCapChanges: CapEntry[] = [
  {
    symbol: "USD₮0",
    vToken: vUSDT0,
    before: parseUnits("18000000", 6).toString(),
    after: parseUnits("4000000", 6).toString(),
  },
  { symbol: "WBTC", vToken: vWBTC, before: parseUnits("500", 8).toString(), after: parseUnits("52", 8).toString() },
  {
    symbol: "WETH",
    vToken: vWETH,
    before: parseUnits("23500", 18).toString(),
    after: parseUnits("1600", 18).toString(),
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("49000000", 6).toString(),
    after: parseUnits("4000000", 6).toString(),
  },
  { symbol: "ARB", vToken: vARB, before: parseUnits("9000000", 18).toString(), after: "0" },
  // gmBTC / gmETH borrow caps already 0 on-chain — omitted (no-op).
];

// Borrow pause changes — Arbitrum was emergency-paused 2026-03-20.
// ARB stays paused; GM markets stay paused.
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "USD₮0", vToken: vUSDT0, before: true, after: false },
  { symbol: "WBTC", vToken: vWBTC, before: true, after: false },
  { symbol: "WETH", vToken: vWETH, before: true, after: false },
  { symbol: "USDC", vToken: vUSDC, before: true, after: false },
];
