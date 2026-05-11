import { parseUnits } from "ethers/lib/utils";

import { CFEntry, CapEntry, PauseEntry } from "../bscmainnet";

export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";

// ─── vToken addresses
const vwUSDM = "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c";
const vZK = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";
const vWETH = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";
const vUSDT = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";
const vUSDC_e = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
const vWBTC = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";
const vUSDC = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";
const vwstETH = "0x03CAd66259f7F34EE075f8B62D133563D249eDa4";
const vzkETH = "0xCEb7Da150d16aCE58F090754feF2775C23C8b631";

export const cfChanges: CFEntry[] = [
  // Full delist of ZK / wstETH. LTs preserved at current values.
  {
    symbol: "ZK",
    vToken: vZK,
    before: parseUnits("0.4", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.45", 18).toString(),
  },
  {
    symbol: "wstETH",
    vToken: vwstETH,
    before: parseUnits("0.71", 18).toString(),
    after: "0",
    liquidationThreshold: parseUnits("0.76", 18).toString(),
  },
  // wUSDM and zkETH per the fetched on-chain state: CF=0 already
  { symbol: "wUSDM", vToken: vwUSDM, before: "0", after: "0", liquidationThreshold: parseUnits("0.78", 18).toString() },
  { symbol: "zkETH", vToken: vzkETH, before: "0", after: "0", liquidationThreshold: parseUnits("0.75", 18).toString() },
];

export const supplyCapChanges: CapEntry[] = [
  { symbol: "WETH", vToken: vWETH, before: parseUnits("6000", 18).toString(), after: parseUnits("450", 18).toString() },
  {
    symbol: "USDT",
    vToken: vUSDT,
    before: parseUnits("4000000", 6).toString(),
    after: parseUnits("1000000", 6).toString(),
  },
  {
    symbol: "USDC.e",
    vToken: vUSDC_e,
    before: parseUnits("31000000", 6).toString(),
    after: parseUnits("1000000", 6).toString(),
  },
  { symbol: "WBTC", vToken: vWBTC, before: parseUnits("90", 8).toString(), after: parseUnits("5", 8).toString() },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("35000000", 6).toString(),
    after: parseUnits("1000000", 6).toString(),
  },
  // Full delist quartet
  { symbol: "wUSDM", vToken: vwUSDM, before: parseUnits("5000000", 18).toString(), after: "0" },
  { symbol: "ZK", vToken: vZK, before: parseUnits("300000000", 18).toString(), after: "0" },
  { symbol: "wstETH", vToken: vwstETH, before: parseUnits("350", 18).toString(), after: "0" },
  { symbol: "zkETH", vToken: vzkETH, before: parseUnits("650", 18).toString(), after: "0" },
];

export const borrowCapChanges: CapEntry[] = [
  { symbol: "WETH", vToken: vWETH, before: parseUnits("3400", 18).toString(), after: parseUnits("225", 18).toString() },
  {
    symbol: "USDT",
    vToken: vUSDT,
    before: parseUnits("3300000", 6).toString(),
    after: parseUnits("800000", 6).toString(),
  },
  {
    symbol: "USDC.e",
    vToken: vUSDC_e,
    before: parseUnits("28000000", 6).toString(),
    after: parseUnits("800000", 6).toString(),
  },
  { symbol: "WBTC", vToken: vWBTC, before: parseUnits("45", 8).toString(), after: "0" },
  {
    symbol: "USDC",
    vToken: vUSDC,
    before: parseUnits("27000000", 6).toString(),
    after: parseUnits("800000", 6).toString(),
  },
  // Full delist
  { symbol: "wUSDM", vToken: vwUSDM, before: parseUnits("4000000", 18).toString(), after: "0" },
  { symbol: "ZK", vToken: vZK, before: parseUnits("100000000", 18).toString(), after: "0" },
  { symbol: "wstETH", vToken: vwstETH, before: parseUnits("35", 18).toString(), after: "0" },
  // zkETH borrow cap already 0 on-chain (no-op).
];

// Borrow pause changes
export const borrowPauseChanges: PauseEntry[] = [
  { symbol: "WETH", vToken: vWETH, before: true, after: false },
  { symbol: "USDT", vToken: vUSDT, before: true, after: false },
  { symbol: "USDC.e", vToken: vUSDC_e, before: true, after: false },
  { symbol: "USDC", vToken: vUSDC, before: true, after: false },
];
