import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

import { COLLATERAL_MARKETS_MAINSTREAM } from "../vip-675/addresses/bscmainnet";

const { ethereum, arbitrumone, basemainnet } = NETWORK_ADDRESSES;

// Core pool
export const vTSLAB = "0x97421799419Eb782628e73e7220d8E0A207469a3";
export const vNVDAB = "0xEb8Ca841cBe1BC4832A10b15c7dAB1081eDaD371";
export const vSPCXB = "0xC36dFaCc7a125859C106F29b9F2d874CCF29A55A";
export const vSKHYB = "0x3E281461efb3D53EC20DB207674373Ed8Ef3BbA9";
// bStock index Spoke pool
export const vQQQB = "0xeA32B70f4106d9ef6f0fF95f7422Fa679494c362";
export const vSPYB = "0x259311A868B49CdA457C1843F89D4dDA33be0390";

// The comptroller functions a Spoke pool checks, granted to EBrake as wildcards so they cover every Spoke pool
export const WILDCARD_PERMISSIONS = [
  "setActionsPaused(address[],uint256[],bool)",
  "setCollateralFactor(address,uint256,uint256)",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
];

// The only one the Core pool comptroller checks too, so the wildcard replaces EBrake's per-contract grant there
export const CORE_PERMISSIONS_TO_REVOKE = ["setCollateralFactor(address,uint256,uint256)"];

// EBrake's other grants on the Core pool comptroller, which only the Core pool checks, kept as they are
export const CORE_ONLY_PERMISSIONS = [
  "_setActionsPaused(address[],uint8[],bool)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
  "_setMarketBorrowCaps(address[],uint256[])",
  "_setMarketSupplyCaps(address[],uint256[])",
  "setFlashLoanPaused(bool)",
  "setIsBorrowAllowed(uint96,address,bool)",
  "setWhiteListFlashLoanAccount(address,bool)",
];

// The bStock mainstream Spoke pool's bStock markets
export const MAINSTREAM_BSTOCK_MARKETS = COLLATERAL_MARKETS_MAINSTREAM.map(market => market.vToken);

export const BSTOCK_MARKETS = [vTSLAB, vNVDAB, vSPCXB, vSKHYB, vQQQB, vSPYB, ...MAINSTREAM_BSTOCK_MARKETS];

export const REMOTE_CHAINS = [
  {
    name: "Ethereum",
    dstChainId: LzChainId.ethereum,
    acm: ethereum.ACCESS_CONTROL_MANAGER,
    coreComptroller: ethereum.CORE_COMPTROLLER,
    proxyAdmin: "0xa6a4e5196fa108008b68fe6d6629d508c902d61c",
    eBrake: "0xCD09042c5DFFed762998Df9a058ec5944e39949B",
    newImplementation: "0x0Dab769617B2d690DDbe8A6D730D9C9b85F26ca0",
  },
  {
    name: "Arbitrum One",
    dstChainId: LzChainId.arbitrumone,
    acm: arbitrumone.ACCESS_CONTROL_MANAGER,
    coreComptroller: arbitrumone.CORE_COMPTROLLER,
    proxyAdmin: "0x9fa1031e7f9578e9d4a260cf0df79d4540cd1836",
    eBrake: "0xFc4CE7Ca9BB5119705Cfb84d6e4476e8a4032b26",
    newImplementation: "0x8A7d8589A597619A7842d3BC284b9a5a276FaE56",
  },
  {
    name: "Base",
    dstChainId: LzChainId.basemainnet,
    acm: basemainnet.ACCESS_CONTROL_MANAGER,
    coreComptroller: basemainnet.CORE_COMPTROLLER,
    proxyAdmin: "0x70d73ee950f2436483b6e410915cb53d473f6eb1",
    eBrake: "0x062C68Af7B9Fb059DCB7FA4B6b92E633350fb7c2",
    newImplementation: "0x10d63B1203E5A0719AbbE927C8BFc87135b2F129",
  },
];
