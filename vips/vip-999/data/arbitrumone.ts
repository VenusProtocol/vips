import { parseUnits } from "ethers/lib/utils";

import { CFEntry, CapEntry, PauseEntry } from "../bscmainnet";

export const COMPTROLLER = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";

// ─── vToken addresses (Arbitrum Core)
const vUSDT0 = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
const vWBTC = "0xaDa57840B372D4c28623E87FC175dE8490792811";
const vWETH = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
const vUSDC = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
const vARB = "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6";

export const cfChanges: CFEntry[] = [
  // ARB: 55% -> 25%. LT preserved at current 60%.
  {
    symbol: "ARB",
    vToken: vARB,
    old: parseUnits("0.55", 18),
    new: parseUnits("0.25", 18),
    liquidationThreshold: parseUnits("0.6", 18),
  },
];

export const capChanges: CapEntry[] = [
  // ARB borrow cap -> 0 (kept paused). gmBTC / gmETH supply caps unchanged — no-op.
  // gmBTC / gmETH borrow caps already 0 on-chain — no-op.
  {
    symbol: "USD₮0",
    vToken: vUSDT0,
    supplyCap: { old: parseUnits("20000000", 6), new: parseUnits("5000000", 6) },
    borrowCap: { old: parseUnits("18000000", 6), new: parseUnits("4000000", 6) },
  },
  {
    symbol: "WBTC",
    vToken: vWBTC,
    supplyCap: { old: parseUnits("900", 8), new: parseUnits("65", 8) },
    borrowCap: { old: parseUnits("500", 8), new: parseUnits("52", 8) },
  },
  {
    symbol: "WETH",
    vToken: vWETH,
    supplyCap: { old: parseUnits("26000", 18), new: parseUnits("2100", 18) },
    borrowCap: { old: parseUnits("23500", 18), new: parseUnits("1600", 18) },
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    supplyCap: { old: parseUnits("54000000", 6), new: parseUnits("5000000", 6) },
    borrowCap: { old: parseUnits("49000000", 6), new: parseUnits("4000000", 6) },
  },
  {
    symbol: "ARB",
    vToken: vARB,
    supplyCap: { old: parseUnits("16000000", 18), new: parseUnits("10000000", 18) },
    borrowCap: { old: parseUnits("9000000", 18), new: "0" },
  },
];

// Borrow pause changes
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "USD₮0", vToken: vUSDT0, old: true, new: false },
  { symbol: "WBTC", vToken: vWBTC, old: true, new: false },
  { symbol: "WETH", vToken: vWETH, old: true, new: false },
  { symbol: "USDC", vToken: vUSDC, old: true, new: false },
];
