import { parseUnits } from "ethers/lib/utils";

import { CFEntry, CapEntry, PauseEntry } from "../bscmainnet";

export const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

// ─── vToken addresses (Ethereum Core)
const vUSDT = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
const vWETH = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
const vsUSDS = "0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6";
const vWBTC = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
const vUSDC = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
const vTUSD = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";
const vweETHs = "0xc42E4bfb996ED35235bda505430cBE404Eb49F77";
const vLBTC = "0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91";
const vEIGEN = "0x256AdDBe0a387c98f487e44b85c29eb983413c5e";
const vDAI = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
const vBAL = "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8";
const vcrvUSD = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
const vUSDe = "0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3";
const vsUSDe = "0xa836ce315b7A6Bb19397Ee996551659B1D92298e";
const vtBTC = "0x5e35C312862d53FD566737892aDCf010cb4928F7";
const vUSDS = "0x0c6B19287999f1e31a5c0a44393b24B62D2C0468";
const vsFRAX = "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe";
const vyvUSDS_1 = "0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764";
const vyvUSDC_1 = "0xf87c0a64dc3a8622D6c63265FA29137788163879";
const vyvUSDT_1 = "0x475d0C68a8CD275c15D1F01F4f291804E445F677";
const vyvWETH_1 = "0xba3916302cBA4aBcB51a01e706fC6051AaF272A0";

export const cfChanges: CFEntry[] = [
  // Full delist on TUSD / EIGEN. BAL CF already 0 — no-op.
  // Demote DAI / crvUSD / USDe to borrow-only.
  {
    symbol: "TUSD",
    vToken: vTUSD,
    old: parseUnits("0.75", 18),
    new: "0",
    liquidationThreshold: parseUnits("0.77", 18),
  },
  {
    symbol: "EIGEN",
    vToken: vEIGEN,
    old: parseUnits("0.5", 18),
    new: "0",
    liquidationThreshold: parseUnits("0.6", 18),
  },

  {
    symbol: "DAI",
    vToken: vDAI,
    old: parseUnits("0.75", 18),
    new: "0",
    liquidationThreshold: parseUnits("0.77", 18),
  },
  {
    symbol: "crvUSD",
    vToken: vcrvUSD,
    old: parseUnits("0.78", 18),
    new: "0",
    liquidationThreshold: parseUnits("0.8", 18),
  },
  {
    symbol: "USDe",
    vToken: vUSDe,
    old: parseUnits("0.72", 18),
    new: "0",
    liquidationThreshold: parseUnits("0.75", 18),
  },
];

export const capChanges: CapEntry[] = [
  {
    symbol: "TUSD",
    vToken: vTUSD,
    supplyCap: { old: parseUnits("2000000", 18), new: "0" },
    borrowCap: { old: parseUnits("1800000", 18), new: "0" },
  },
  {
    symbol: "EIGEN",
    vToken: vEIGEN,
    supplyCap: { old: parseUnits("3000000", 18), new: "0" },
    borrowCap: { old: parseUnits("1500000", 18), new: "0" },
  },
  {
    symbol: "BAL",
    vToken: vBAL,
    supplyCap: { old: parseUnits("4100000", 18), new: "0" },
    borrowCap: { old: parseUnits("700000", 18), new: "0" },
  },
  {
    symbol: "yvUSDS-1",
    vToken: vyvUSDS_1,
    supplyCap: { old: parseUnits("640000", 18), new: "0" },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "yvUSDC-1",
    vToken: vyvUSDC_1,
    supplyCap: { old: parseUnits("400000", 6), new: "0" },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "yvUSDT-1",
    vToken: vyvUSDT_1,
    supplyCap: { old: parseUnits("630000", 6), new: "0" },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "yvWETH-1",
    vToken: vyvWETH_1,
    supplyCap: { old: parseUnits("56", 18), new: "0" },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "USDT",
    vToken: vUSDT,
    supplyCap: { old: parseUnits("50000000", 6), new: parseUnits("5000000", 6) },
    borrowCap: { old: parseUnits("45000000", 6), new: parseUnits("4000000", 6) },
  },
  {
    symbol: "WETH",
    vToken: vWETH,
    supplyCap: { old: parseUnits("20000", 18), new: parseUnits("2100", 18) },
    borrowCap: { old: parseUnits("18000", 18), new: parseUnits("1600", 18) },
  },
  {
    symbol: "sUSDS",
    vToken: vsUSDS,
    supplyCap: { old: parseUnits("30000000", 18), new: parseUnits("4500000", 18) },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "WBTC",
    vToken: vWBTC,
    supplyCap: { old: parseUnits("1000", 8), new: parseUnits("65", 8) },
    borrowCap: { old: parseUnits("850", 8), new: parseUnits("52", 8) },
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    supplyCap: { old: parseUnits("50000000", 6), new: parseUnits("5000000", 6) },
    borrowCap: { old: parseUnits("45000000", 6), new: parseUnits("4000000", 6) },
  },
  {
    symbol: "weETHs",
    vToken: vweETHs,
    supplyCap: { old: parseUnits("2800", 18), new: parseUnits("2000", 18) },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "LBTC",
    vToken: vLBTC,
    supplyCap: { old: parseUnits("450", 8), new: parseUnits("65", 8) },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "DAI",
    vToken: vDAI,
    supplyCap: { old: parseUnits("5000000", 18), new: parseUnits("5000000", 18) },
    borrowCap: { old: parseUnits("4500000", 18), new: parseUnits("4000000", 18) },
  },
  {
    symbol: "crvUSD",
    vToken: vcrvUSD,
    supplyCap: { old: parseUnits("10000000", 18), new: parseUnits("5000000", 18) },
    borrowCap: { old: parseUnits("9000000", 18), new: parseUnits("4000000", 18) },
  },
  {
    symbol: "USDe",
    vToken: vUSDe,
    supplyCap: { old: parseUnits("30000000", 18), new: parseUnits("5000000", 18) },
    borrowCap: { old: parseUnits("25000000", 18), new: parseUnits("4000000", 18) },
  },
  {
    symbol: "sUSDe",
    vToken: vsUSDe,
    supplyCap: { old: parseUnits("20000000", 18), new: parseUnits("4000000", 18) },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "tBTC",
    vToken: vtBTC,
    supplyCap: { old: parseUnits("120", 18), new: parseUnits("65", 18) },
    borrowCap: { old: parseUnits("60", 18), new: parseUnits("52", 18) },
  },
  {
    symbol: "USDS",
    vToken: vUSDS,
    supplyCap: { old: parseUnits("65000000", 18), new: parseUnits("5000000", 18) },
    borrowCap: { old: parseUnits("7680000", 18), new: parseUnits("4000000", 18) },
  },
  {
    symbol: "sFRAX",
    vToken: vsFRAX,
    supplyCap: { old: parseUnits("10000000", 18), new: parseUnits("4300000", 18) },
    borrowCap: { old: parseUnits("2000000", 18), new: parseUnits("2000000", 18) },
  },
];

// Borrow pause changes
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "USDT", vToken: vUSDT, old: true, new: false },
  { symbol: "WETH", vToken: vWETH, old: true, new: false },
  { symbol: "WBTC", vToken: vWBTC, old: true, new: false },
  { symbol: "USDC", vToken: vUSDC, old: true, new: false },
  { symbol: "DAI", vToken: vDAI, old: true, new: false },
  { symbol: "crvUSD", vToken: vcrvUSD, old: true, new: false },
  { symbol: "USDe", vToken: vUSDe, old: true, new: false },
  { symbol: "tBTC", vToken: vtBTC, old: true, new: false },
  { symbol: "USDS", vToken: vUSDS, old: true, new: false },
];
