import { parseUnits } from "ethers/lib/utils";

import { CFEntry, CapEntry, PauseEntry } from "../bscmainnet";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

// ─── vToken addresses (BSC Core)
const vBTCB = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const vWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
const vwBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const vCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const vXRP = "0xB248a295732e0225acd3337607cc01068e3b9c10";
const vUSD1 = "0x0C1DA220D301155b87318B90692Da8dc43B67340";
const vlisUSD = "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab";
const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";
const vLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
// vMATIC (0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8) is already fully wound
// down on-chain — CF=0, caps=0, borrow paused — so no actions remain.
const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";
const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";

export const cfChanges: CFEntry[] = [
  // DAI: 75% -> 0% (deprecated, demote from collateral).
  {
    symbol: "DAI",
    vToken: vDAI,
    before: parseUnits("0.75", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.75", 18).toString(),
  },
];

export const supplyCapChanges: CapEntry[] = [
  {
    symbol: "BTCB",
    vToken: vBTCB,
    before: parseUnits("22770", 18).toString(),
    after: parseUnits("13000", 18).toString(),
  },
  {
    symbol: "BNB",
    vToken: vBNB,
    before: parseUnits("2672000", 18).toString(),
    after: parseUnits("1600000", 18).toString(),
  },
  {
    symbol: "WBNB",
    vToken: vWBNB,
    before: parseUnits("2672000", 18).toString(),
    after: parseUnits("300000", 18).toString(),
  },
  {
    symbol: "ETH",
    vToken: vETH,
    before: parseUnits("100000", 18).toString(),
    after: parseUnits("72000", 18).toString(),
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("360000000", 18).toString(),
    after: parseUnits("180000000", 18).toString(),
  },
  {
    symbol: "asBNB",
    vToken: vasBNB,
    before: parseUnits("216000", 18).toString(),
    after: parseUnits("130000", 18).toString(),
  },
  {
    symbol: "xSolvBTC",
    vToken: vxSolvBTC,
    before: parseUnits("2000", 18).toString(),
    after: parseUnits("1200", 18).toString(),
  },
  {
    symbol: "wBETH",
    vToken: vwBETH,
    before: parseUnits("40000", 18).toString(),
    after: parseUnits("10000", 18).toString(),
  },
  {
    symbol: "CAKE",
    vToken: vCAKE,
    before: parseUnits("24000000", 18).toString(),
    after: parseUnits("18000000", 18).toString(),
  },
  {
    symbol: "FDUSD",
    vToken: vFDUSD,
    before: parseUnits("100000000", 18).toString(),
    after: parseUnits("37000000", 18).toString(),
  },
  {
    symbol: "XRP",
    vToken: vXRP,
    before: parseUnits("24000000", 18).toString(),
    after: parseUnits("7500000", 18).toString(),
  },
  {
    symbol: "USD1",
    vToken: vUSD1,
    before: parseUnits("16000000", 18).toString(),
    after: parseUnits("5000000", 18).toString(),
  },
  {
    symbol: "lisUSD",
    vToken: vlisUSD,
    before: parseUnits("12000000", 18).toString(),
    after: parseUnits("5000000", 18).toString(),
  },
  {
    symbol: "DOGE",
    vToken: vDOGE,
    before: parseUnits("120000000", 8).toString(),
    after: parseUnits("80000000", 8).toString(),
  },
  {
    symbol: "ADA",
    vToken: vADA,
    before: parseUnits("37510000", 18).toString(),
    after: parseUnits("15000000", 18).toString(),
  },
  {
    symbol: "LTC",
    vToken: vLTC,
    before: parseUnits("240000", 18).toString(),
    after: parseUnits("50000", 18).toString(),
  },
  {
    symbol: "LINK",
    vToken: vLINK,
    before: parseUnits("900000", 18).toString(),
    after: parseUnits("400000", 18).toString(),
  },
  // Wind-down: supply cap -> 0
  { symbol: "THE", vToken: vTHE, before: parseUnits("14500000", 18).toString(), after: "0" },
  { symbol: "TUSD", vToken: vTUSD, before: parseUnits("750000", 18).toString(), after: "0" },
  { symbol: "FIL", vToken: vFIL, before: parseUnits("1200000", 18).toString(), after: "0" },
];

export const borrowCapChanges: CapEntry[] = [
  // BTCB / ADA / SolvBTC borrow caps unchanged (no-op).
  {
    symbol: "BNB",
    vToken: vBNB,
    before: parseUnits("2008000", 18).toString(),
    after: parseUnits("800000", 18).toString(),
  },
  {
    symbol: "WBNB",
    vToken: vWBNB,
    before: parseUnits("2008000", 18).toString(),
    after: parseUnits("150000", 18).toString(),
  },
  {
    symbol: "ETH",
    vToken: vETH,
    before: parseUnits("60000", 18).toString(),
    after: parseUnits("37000", 18).toString(),
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("324000000", 18).toString(),
    after: parseUnits("110000000", 18).toString(),
  },
  {
    symbol: "wBETH",
    vToken: vwBETH,
    before: parseUnits("16000", 18).toString(),
    after: parseUnits("1000", 18).toString(),
  },
  {
    symbol: "CAKE",
    vToken: vCAKE,
    before: parseUnits("19200000", 18).toString(),
    after: parseUnits("500000", 18).toString(),
  },
  {
    symbol: "FDUSD",
    vToken: vFDUSD,
    before: parseUnits("80000000", 18).toString(),
    after: parseUnits("20000000", 18).toString(),
  },
  {
    symbol: "XRP",
    vToken: vXRP,
    before: parseUnits("6000000", 18).toString(),
    after: parseUnits("1000000", 18).toString(),
  },
  {
    symbol: "USD1",
    vToken: vUSD1,
    before: parseUnits("14400000", 18).toString(),
    after: parseUnits("4000000", 18).toString(),
  },
  {
    symbol: "lisUSD",
    vToken: vlisUSD,
    before: parseUnits("10000000", 18).toString(),
    after: parseUnits("4000000", 18).toString(),
  },
  {
    symbol: "DOGE",
    vToken: vDOGE,
    before: parseUnits("4500000", 8).toString(),
    after: parseUnits("3000000", 8).toString(),
  },
  { symbol: "LTC", vToken: vLTC, before: parseUnits("20000", 18).toString(), after: parseUnits("8000", 18).toString() },
  {
    symbol: "LINK",
    vToken: vLINK,
    before: parseUnits("80000", 18).toString(),
    after: parseUnits("20000", 18).toString(),
  },
  // Wind-down assets (MATIC already at 0 on-chain — skipped)
  { symbol: "THE", vToken: vTHE, before: parseUnits("8000000", 18).toString(), after: "0" },
  { symbol: "TUSD", vToken: vTUSD, before: parseUnits("600000", 18).toString(), after: "0" },
  { symbol: "FIL", vToken: vFIL, before: parseUnits("90000", 18).toString(), after: "0" },
];

// Borrow pause changes — BSC was operational. THE and MATIC are already paused (no-ops).
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "TUSD", vToken: vTUSD, before: false, after: true },
  { symbol: "FIL", vToken: vFIL, before: false, after: true },
];
