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
  // Full delist: CF -> 0
  {
    symbol: "TUSD",
    vToken: vTUSD,
    before: parseUnits("0.75", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.77", 18).toString(),
  },
  {
    symbol: "EIGEN",
    vToken: vEIGEN,
    before: parseUnits("0.5", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.6", 18).toString(),
  },
  // BAL CF already 0 (no-op).
  // Demote from collateral (keep as borrow asset): CF -> 0
  {
    symbol: "DAI",
    vToken: vDAI,
    before: parseUnits("0.75", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.77", 18).toString(),
  },
  {
    symbol: "crvUSD",
    vToken: vcrvUSD,
    before: parseUnits("0.78", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.8", 18).toString(),
  },
  {
    symbol: "USDe",
    vToken: vUSDe,
    before: parseUnits("0.72", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.75", 18).toString(),
  },
];

export const supplyCapChanges: CapEntry[] = [
  {
    symbol: "USDT",
    vToken: vUSDT,
    before: parseUnits("50000000", 6).toString(),
    after: parseUnits("5000000", 6).toString(),
  },
  {
    symbol: "WETH",
    vToken: vWETH,
    before: parseUnits("20000", 18).toString(),
    after: parseUnits("2100", 18).toString(),
  },
  {
    symbol: "sUSDS",
    vToken: vsUSDS,
    before: parseUnits("30000000", 18).toString(),
    after: parseUnits("4500000", 18).toString(),
  },
  { symbol: "WBTC", vToken: vWBTC, before: parseUnits("1000", 8).toString(), after: parseUnits("65", 8).toString() },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("50000000", 6).toString(),
    after: parseUnits("5000000", 6).toString(),
  },
  {
    symbol: "weETHs",
    vToken: vweETHs,
    before: parseUnits("2800", 18).toString(),
    after: parseUnits("2000", 18).toString(),
  },
  { symbol: "LBTC", vToken: vLBTC, before: parseUnits("450", 8).toString(), after: parseUnits("65", 8).toString() },
  // DAI supply cap unchanged (no-op).
  {
    symbol: "crvUSD",
    vToken: vcrvUSD,
    before: parseUnits("10000000", 18).toString(),
    after: parseUnits("5000000", 18).toString(),
  },
  {
    symbol: "USDe",
    vToken: vUSDe,
    before: parseUnits("30000000", 18).toString(),
    after: parseUnits("5000000", 18).toString(),
  },
  {
    symbol: "sUSDe",
    vToken: vsUSDe,
    before: parseUnits("20000000", 18).toString(),
    after: parseUnits("4000000", 18).toString(),
  },
  { symbol: "tBTC", vToken: vtBTC, before: parseUnits("120", 18).toString(), after: parseUnits("65", 18).toString() },
  {
    symbol: "USDS",
    vToken: vUSDS,
    before: parseUnits("65000000", 18).toString(),
    after: parseUnits("5000000", 18).toString(),
  },
  {
    symbol: "sFRAX",
    vToken: vsFRAX,
    before: parseUnits("10000000", 18).toString(),
    after: parseUnits("4300000", 18).toString(),
  },
  // Full delist: supply cap -> 0
  { symbol: "TUSD", vToken: vTUSD, before: parseUnits("2000000", 18).toString(), after: "0" },
  { symbol: "EIGEN", vToken: vEIGEN, before: parseUnits("3000000", 18).toString(), after: "0" },
  { symbol: "BAL", vToken: vBAL, before: parseUnits("4100000", 18).toString(), after: "0" },
  { symbol: "yvUSDS-1", vToken: vyvUSDS_1, before: parseUnits("640000", 18).toString(), after: "0" },
  { symbol: "yvUSDC-1", vToken: vyvUSDC_1, before: parseUnits("400000", 6).toString(), after: "0" },
  { symbol: "yvUSDT-1", vToken: vyvUSDT_1, before: parseUnits("630000", 6).toString(), after: "0" },
  { symbol: "yvWETH-1", vToken: vyvWETH_1, before: parseUnits("56", 18).toString(), after: "0" },
];

export const borrowCapChanges: CapEntry[] = [
  {
    symbol: "USDT",
    vToken: vUSDT,
    before: parseUnits("45000000", 6).toString(),
    after: parseUnits("4000000", 6).toString(),
  },
  {
    symbol: "WETH",
    vToken: vWETH,
    before: parseUnits("18000", 18).toString(),
    after: parseUnits("1600", 18).toString(),
  },
  { symbol: "WBTC", vToken: vWBTC, before: parseUnits("850", 8).toString(), after: parseUnits("52", 8).toString() },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("45000000", 6).toString(),
    after: parseUnits("4000000", 6).toString(),
  },
  {
    symbol: "DAI",
    vToken: vDAI,
    before: parseUnits("4500000", 18).toString(),
    after: parseUnits("4000000", 18).toString(),
  },
  {
    symbol: "crvUSD",
    vToken: vcrvUSD,
    before: parseUnits("9000000", 18).toString(),
    after: parseUnits("4000000", 18).toString(),
  },
  {
    symbol: "USDe",
    vToken: vUSDe,
    before: parseUnits("25000000", 18).toString(),
    after: parseUnits("4000000", 18).toString(),
  },
  { symbol: "tBTC", vToken: vtBTC, before: parseUnits("60", 18).toString(), after: parseUnits("52", 18).toString() },
  {
    symbol: "USDS",
    vToken: vUSDS,
    before: parseUnits("7680000", 18).toString(),
    after: parseUnits("4000000", 18).toString(),
  },
  // sFRAX borrow cap unchanged (no-op).
  // Full delist: borrow cap -> 0
  { symbol: "TUSD", vToken: vTUSD, before: parseUnits("1800000", 18).toString(), after: "0" },
  { symbol: "EIGEN", vToken: vEIGEN, before: parseUnits("1500000", 18).toString(), after: "0" },
  { symbol: "BAL", vToken: vBAL, before: parseUnits("700000", 18).toString(), after: "0" },
];

// Borrow pause changes
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "USDT", vToken: vUSDT, before: true, after: false },
  { symbol: "WETH", vToken: vWETH, before: true, after: false },
  { symbol: "WBTC", vToken: vWBTC, before: true, after: false },
  { symbol: "USDC", vToken: vUSDC, before: true, after: false },
  { symbol: "DAI", vToken: vDAI, before: true, after: false },
  { symbol: "crvUSD", vToken: vcrvUSD, before: true, after: false },
  { symbol: "USDe", vToken: vUSDe, before: true, after: false },
  { symbol: "tBTC", vToken: vtBTC, before: true, after: false },
  { symbol: "USDS", vToken: vUSDS, before: true, after: false },
];
