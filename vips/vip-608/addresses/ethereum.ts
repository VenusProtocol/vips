import { LzChainId } from "src/types";

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ETHEREUM_NORMAL_TIMELOCK = "0xd969E79406c35E80750aAae061D402Aab9325714";
export const ETHEREUM_CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const ETHEREUM_VTOKEN_BEACON = "0xfc08aADC7a1A93857f6296C3fb78aBA1d286533a";
export const ETHEREUM_NEW_VTOKEN_IMPLEMENTATION = "TODO"; // Not yet deployed
export const ETHEREUM_DST_CHAIN_ID = LzChainId.ethereum;

export const ETHEREUM_CORE_VTOKENS = [
  "0x8716554364f20bca783cb2baa744d39361fd1d8d", // vWBTC_Core
  "0x7c8ff7d2a1372433726f879bd945ffb250b94c65", // vWETH_Core
  "0x17c07e0c232f2f80dfdbd7a95b942d893a4c5acb", // vUSDC_Core
  "0x8c3e3821259b82ffb32b2450a95d2dcbf161c24e", // vUSDT_Core
  "0x672208c10aaaa2f9a6719f449c4c8227bc0bc202", // vcrvUSD_Core
  "0xd8add9b41d4e1cd64edad8722ab0ba8d35536657", // vDAI_Core
  "0x13eb80fdbe5c5f4a7039728e258a6f05fb3b912b", // vTUSD_Core
  "0x4fafbdc4f2a9876bd1764827b26fb8dc4fd1db95", // vFRAX_Core, Paused
  "0x17142a05fe678e9584fa1d88efac1bf181bf7abe", // vsFRAX_Core
  "0x256addbe0a387c98f487e44b85c29eb983413c5e", // vEIGEN, have differenet proxy
  "0x325ceb02fe1c2ff816a83a5770ea0e88e2faecf2", // veBTC, have different proxy
  "0x25c20e6e110a1ce3febacc8b7e48368c7b2f0c91", // vLBTC_Core
  "0x0c6b19287999f1e31a5c0a44393b24b62d2c0468", // vUSDS_Core
  "0xe36ae842dbbd7ae372eba02c8239cd431cc063d6", // vsUSDS_Core
  "0x0ec5488e4f8f319213a14cab188e01fb8517faa8", // vBAL_Core
  "0xf87c0a64dc3a8622d6c63265fa29137788163879", // vyvUSDC-1_Core, Paused
  "0x475d0c68a8cd275c15d1f01f4f291804e445f677", // vyvUSDT-1_Core, Paused
  "0x520d67226bc904ac122dce66ed2f8f61aa1ed764", // vyvUSDS-1_Core, Paused
  "0xba3916302cba4abcb51a01e706fc6051aaf272a0", // vyvWETH-1_Core, Paused
  "0xc42e4bfb996ed35235bda505430cbe404eb49f77", // vweETHs_Core
  "0xa836ce315b7a6bb19397ee996551659b1d92298e", // vsUSDe_Core
  "0xa0ee2baa024cc3aa1bc9395522d07b7970ca75b3", // vUSDe_Core
  "0x5e35c312862d53fd566737892adcf010cb4928f7", // vtBTC_Core
];
