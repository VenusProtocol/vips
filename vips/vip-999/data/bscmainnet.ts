import { parseUnits } from "ethers/lib/utils";

import { CFEntry, CapEntry, DelistEntry, EmodeBorrowAllowedEntry, EmodeCFEntry } from "../bscmainnet";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

// ─── vToken addresses (BSC).
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
const vwBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const vCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const vXRP = "0xB248a295732e0225acd3337607cc01068e3b9c10";
const vUSD1 = "0x0C1DA220D301155b87318B90692Da8dc43B67340";
const vlisUSD = "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab";
const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const vXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
const vslisBNB = "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc";
const vSolvBTC = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
const vPTclisBNBx = "0x6d3BD68E90B42615cb5abF4B8DE92b154ADc435e";

// eMode vTokens.
const vBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
const vTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";
const vLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
const vAAVE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";
const vDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";

// Complete delists: caps -> 0 + pause borrow/mint if not already paused.
// FIL also requires the eMode Pool 12 isBorrowAllowed toggle (see
// emodeBorrowAllowedChanges); THE requires the Pool 15 toggle.
export const delistAssets: DelistEntry[] = [
  {
    symbol: "THE",
    vToken: vTHE,
    oldCollateralFactor: "0",
    liquidationThreshold: parseUnits("0.53", 18),
    oldSupplyCap: parseUnits("14500000", 18),
    oldBorrowCap: parseUnits("8000000", 18),
    borrowAlreadyPaused: true,
    supplyAlreadyPaused: true,
  },
  {
    symbol: "TUSD",
    vToken: vTUSD,
    oldCollateralFactor: "0",
    liquidationThreshold: parseUnits("0.75", 18),
    oldSupplyCap: parseUnits("750000", 18),
    oldBorrowCap: parseUnits("600000", 18),
    borrowAlreadyPaused: false,
    supplyAlreadyPaused: true,
  },
  {
    symbol: "FIL",
    vToken: vFIL,
    oldCollateralFactor: "0",
    liquidationThreshold: parseUnits("0.63", 18),
    oldSupplyCap: parseUnits("1200000", 18),
    oldBorrowCap: parseUnits("90000", 18),
    borrowAlreadyPaused: false,
    supplyAlreadyPaused: false,
  },
];

// Core-pool CF changes. setCollateralFactor(address,uint256,uint256).
export const cfChanges: CFEntry[] = [
  {
    symbol: "DAI",
    vToken: vDAI,
    old: parseUnits("0.75", 18),
    new: "0",
    liquidationThreshold: parseUnits("0.75", 18),
  },
  {
    symbol: "CAKE",
    vToken: vCAKE,
    old: parseUnits("0.55", 18),
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.55", 18),
  },
  {
    symbol: "XVS",
    vToken: vXVS,
    old: parseUnits("0.6", 18),
    new: parseUnits("0.55", 18),
    liquidationThreshold: parseUnits("0.6", 18),
  },
  {
    symbol: "lisUSD",
    vToken: vlisUSD,
    old: "0",
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.55", 18),
  },
];

// eMode pool CF changes. setCollateralFactor(uint96,address,uint256,uint256).
// LT values pinned from poolMarkets(poolId, vToken) on-chain at HEAD.
export const emodeCfChanges: EmodeCFEntry[] = [
  {
    symbol: "BCH",
    poolId: 8,
    vToken: vBCH,
    old: "0",
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.6", 18),
  },
  {
    symbol: "TRX",
    poolId: 13,
    vToken: vTRX,
    old: parseUnits("0.525", 18),
    new: parseUnits("0.45", 18),
    liquidationThreshold: parseUnits("0.525", 18),
  },
  {
    symbol: "ADA",
    poolId: 10,
    vToken: vADA,
    old: parseUnits("0.63", 18),
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.63", 18),
  },
  {
    symbol: "LTC",
    poolId: 11,
    vToken: vLTC,
    old: "0",
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.63", 18),
  },
  {
    symbol: "LINK",
    poolId: 4,
    vToken: vLINK,
    old: parseUnits("0.63", 18),
    new: parseUnits("0.6", 18),
    liquidationThreshold: parseUnits("0.63", 18),
  },
  {
    symbol: "TWT",
    poolId: 9,
    vToken: vTWT,
    old: "0",
    new: parseUnits("0.3", 18),
    liquidationThreshold: parseUnits("0.5", 18),
  },
  {
    symbol: "AAVE",
    poolId: 6,
    vToken: vAAVE,
    old: "0",
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.55", 18),
  },
  {
    symbol: "DOGE",
    poolId: 7,
    vToken: vDOGE,
    old: parseUnits("0.43", 18),
    new: parseUnits("0.4", 18),
    liquidationThreshold: parseUnits("0.43", 18),
  },
  {
    symbol: "UNI",
    poolId: 5,
    vToken: vUNI,
    old: "0",
    new: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.55", 18),
  },
  {
    symbol: "DOT",
    poolId: 14,
    vToken: vDOT,
    old: "0",
    new: parseUnits("0.55", 18),
    liquidationThreshold: parseUnits("0.65", 18),
  },
];

// Market-wide cap changes. setMarketSupplyCaps / setMarketBorrowCaps take
// (address[], uint256[]) and store one cap per vToken, regardless of pool.
// No-op entries (old === new) are kept so the pre-VIP simulation asserts
// the current value matches the table; the proposal builder filters them
// out of the actual setter calls.
export const marketCapChanges: CapEntry[] = [
  // Core-pool cap changes (table items 1-16)
  {
    symbol: "ETH",
    vToken: vETH,
    supplyCap: { old: parseUnits("100000", 18), new: parseUnits("72000", 18) },
    borrowCap: { old: parseUnits("60000", 18), new: parseUnits("37000", 18) },
  },
  {
    symbol: "xSolvBTC",
    vToken: vxSolvBTC,
    supplyCap: { old: parseUnits("2000", 18), new: parseUnits("1200", 18) },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "wBETH",
    vToken: vwBETH,
    supplyCap: { old: parseUnits("40000", 18), new: parseUnits("40000", 18) },
    borrowCap: { old: parseUnits("16000", 18), new: parseUnits("1000", 18) },
  },
  {
    symbol: "FDUSD",
    vToken: vFDUSD,
    supplyCap: { old: parseUnits("100000000", 18), new: parseUnits("37000000", 18) },
    borrowCap: { old: parseUnits("80000000", 18), new: parseUnits("20000000", 18) },
  },
  {
    symbol: "XRP",
    vToken: vXRP,
    supplyCap: { old: parseUnits("24000000", 18), new: parseUnits("7500000", 18) },
    borrowCap: { old: parseUnits("6000000", 18), new: parseUnits("1000000", 18) },
  },
  {
    symbol: "USD1",
    vToken: vUSD1,
    supplyCap: { old: parseUnits("16000000", 18), new: parseUnits("5000000", 18) },
    borrowCap: { old: parseUnits("14400000", 18), new: parseUnits("4000000", 18) },
  },
  {
    symbol: "lisUSD",
    vToken: vlisUSD,
    supplyCap: { old: parseUnits("12000000", 18), new: parseUnits("5000000", 18) },
    borrowCap: { old: parseUnits("10000000", 18), new: parseUnits("4000000", 18) },
  },
  {
    symbol: "slisBNB",
    vToken: vslisBNB,
    supplyCap: { old: parseUnits("20000", 18), new: parseUnits("2000", 18) },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "SolvBTC",
    vToken: vSolvBTC,
    supplyCap: { old: parseUnits("3000", 18), new: parseUnits("3000", 18) },
    borrowCap: { old: parseUnits("110", 18), new: parseUnits("20", 18) },
  },
  // Core-pool no-op cap assertions (table marks as "unchanged")
  {
    symbol: "DAI",
    vToken: vDAI,
    supplyCap: { old: parseUnits("13910000", 18), new: parseUnits("13910000", 18) },
    borrowCap: { old: parseUnits("7500000", 18), new: parseUnits("7500000", 18) },
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    supplyCap: { old: parseUnits("360000000", 18), new: parseUnits("360000000", 18) },
    borrowCap: { old: parseUnits("324000000", 18), new: parseUnits("324000000", 18) },
  },
  {
    symbol: "XVS",
    vToken: vXVS,
    supplyCap: { old: parseUnits("1850000", 18), new: parseUnits("1850000", 18) },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "asBNB",
    vToken: vasBNB,
    supplyCap: { old: parseUnits("216000", 18), new: parseUnits("216000", 18) },
    borrowCap: { old: "0", new: "0" },
  },
  {
    symbol: "CAKE",
    vToken: vCAKE,
    supplyCap: { old: parseUnits("24000000", 18), new: parseUnits("24000000", 18) },
    borrowCap: { old: parseUnits("19200000", 18), new: parseUnits("19200000", 18) },
  },
  {
    symbol: "PT-clisBNBx-25JUN2026",
    vToken: vPTclisBNBx,
    supplyCap: { old: parseUnits("25000", 18), new: parseUnits("25000", 18) },
    borrowCap: { old: "0", new: "0" },
  },
  // Isolated-only assets (caps are market-wide; values match table targets)
  {
    symbol: "BCH",
    vToken: vBCH,
    supplyCap: { old: parseUnits("10000", 18), new: parseUnits("5000", 18) },
    borrowCap: { old: parseUnits("1000", 18), new: parseUnits("1000", 18) },
  },
  {
    symbol: "TRX",
    vToken: vTRX,
    supplyCap: { old: parseUnits("12000000", 6), new: parseUnits("3000000", 6) },
    borrowCap: { old: parseUnits("6000000", 6), new: parseUnits("1000000", 6) },
  },
  {
    symbol: "ADA",
    vToken: vADA,
    supplyCap: { old: parseUnits("37510000", 18), new: parseUnits("15000000", 18) },
    borrowCap: { old: parseUnits("3000000", 18), new: parseUnits("3000000", 18) },
  },
  {
    symbol: "LTC",
    vToken: vLTC,
    supplyCap: { old: parseUnits("240000", 18), new: parseUnits("50000", 18) },
    borrowCap: { old: parseUnits("20000", 18), new: parseUnits("8000", 18) },
  },
  {
    symbol: "LINK",
    vToken: vLINK,
    supplyCap: { old: parseUnits("900000", 18), new: parseUnits("400000", 18) },
    borrowCap: { old: parseUnits("80000", 18), new: parseUnits("20000", 18) },
  },
  {
    symbol: "TWT",
    vToken: vTWT,
    supplyCap: { old: parseUnits("8000000", 18), new: parseUnits("2000000", 18) },
    borrowCap: { old: parseUnits("1000000", 18), new: parseUnits("50000", 18) },
  },
  {
    symbol: "AAVE",
    vToken: vAAVE,
    supplyCap: { old: parseUnits("20000", 18), new: parseUnits("20000", 18) },
    borrowCap: { old: parseUnits("3000", 18), new: parseUnits("3000", 18) },
  },
  {
    symbol: "DOGE",
    vToken: vDOGE,
    supplyCap: { old: parseUnits("120000000", 8), new: parseUnits("80000000", 8) },
    borrowCap: { old: parseUnits("4500000", 8), new: parseUnits("3000000", 8) },
  },
  {
    symbol: "UNI",
    vToken: vUNI,
    supplyCap: { old: parseUnits("2200000", 18), new: parseUnits("2200000", 18) },
    borrowCap: { old: parseUnits("200000", 18), new: parseUnits("200000", 18) },
  },
  {
    symbol: "DOT",
    vToken: vDOT,
    supplyCap: { old: parseUnits("1200000", 18), new: parseUnits("1200000", 18) },
    borrowCap: { old: parseUnits("400000", 18), new: parseUnits("400000", 18) },
  },
];

// eMode borrow allowance toggles.
export const emodeBorrowAllowedChanges: EmodeBorrowAllowedEntry[] = [
  { symbol: "THE", poolId: 15, vToken: vTHE, old: true, new: false },
  { symbol: "FIL", poolId: 12, vToken: vFIL, old: true, new: false },
];
