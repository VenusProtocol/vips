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
  // Demote DAI to borrow-only.
  {
    symbol: "DAI",
    vToken: vDAI,
    old: parseUnits("0.75", 18),
    new: "0",
    liquidationThreshold: parseUnits("0.75", 18),
  },
];

export const capChanges: CapEntry[] = [
  {
    symbol: "THE",
    vToken: vTHE,
    supplyCap: { old: parseUnits("14500000", 18), new: "0" },
    borrowCap: { old: parseUnits("8000000", 18), new: "0" },
  },
  {
    symbol: "TUSD",
    vToken: vTUSD,
    supplyCap: { old: parseUnits("750000", 18), new: "0" },
    borrowCap: { old: parseUnits("600000", 18), new: "0" },
  },
  {
    symbol: "FIL",
    vToken: vFIL,
    supplyCap: { old: parseUnits("1200000", 18), new: "0" },
    borrowCap: { old: parseUnits("90000", 18), new: "0" },
  },

  // BTCB / ADA / xSolvBTC / asBNB borrow caps unchanged — supplyCap-only entries.
  {
    symbol: "BTCB",
    vToken: vBTCB,
    supplyCap: { old: parseUnits("22770", 18), new: parseUnits("13000", 18) },
  },
  {
    symbol: "BNB",
    vToken: vBNB,
    supplyCap: { old: parseUnits("2672000", 18), new: parseUnits("1600000", 18) },
    borrowCap: { old: parseUnits("2008000", 18), new: parseUnits("800000", 18) },
  },
  {
    symbol: "WBNB",
    vToken: vWBNB,
    supplyCap: { old: parseUnits("2672000", 18), new: parseUnits("300000", 18) },
    borrowCap: { old: parseUnits("2008000", 18), new: parseUnits("150000", 18) },
  },
  {
    symbol: "ETH",
    vToken: vETH,
    supplyCap: { old: parseUnits("100000", 18), new: parseUnits("72000", 18) },
    borrowCap: { old: parseUnits("60000", 18), new: parseUnits("37000", 18) },
  },
  {
    symbol: "USDC",
    vToken: vUSDC,
    supplyCap: { old: parseUnits("360000000", 18), new: parseUnits("180000000", 18) },
    borrowCap: { old: parseUnits("324000000", 18), new: parseUnits("110000000", 18) },
  },
  {
    symbol: "asBNB",
    vToken: vasBNB,
    supplyCap: { old: parseUnits("216000", 18), new: parseUnits("130000", 18) },
  },
  {
    symbol: "xSolvBTC",
    vToken: vxSolvBTC,
    supplyCap: { old: parseUnits("2000", 18), new: parseUnits("1200", 18) },
  },
  {
    symbol: "wBETH",
    vToken: vwBETH,
    supplyCap: { old: parseUnits("40000", 18), new: parseUnits("10000", 18) },
    borrowCap: { old: parseUnits("16000", 18), new: parseUnits("1000", 18) },
  },
  {
    symbol: "CAKE",
    vToken: vCAKE,
    supplyCap: { old: parseUnits("24000000", 18), new: parseUnits("18000000", 18) },
    borrowCap: { old: parseUnits("19200000", 18), new: parseUnits("500000", 18) },
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
    symbol: "DOGE",
    vToken: vDOGE,
    supplyCap: { old: parseUnits("120000000", 8), new: parseUnits("80000000", 8) },
    borrowCap: { old: parseUnits("4500000", 8), new: parseUnits("3000000", 8) },
  },
  {
    symbol: "ADA",
    vToken: vADA,
    supplyCap: { old: parseUnits("37510000", 18), new: parseUnits("15000000", 18) },
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
];

// THE / MATIC already paused — no-op.
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "TUSD", vToken: vTUSD, old: false, new: true },
  { symbol: "FIL", vToken: vFIL, old: false, new: true },
];
