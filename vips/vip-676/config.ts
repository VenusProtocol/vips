import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { ethereum, arbitrumone, basemainnet } = NETWORK_ADDRESSES;

// Granted to EBrake on the Core pool comptroller by VIP-610
export const CORE_COMPTROLLER_PERMISSIONS = [
  "_setActionsPaused(address[],uint8[],bool)",
  "setCollateralFactor(uint96,address,uint256,uint256)",
  "setCollateralFactor(address,uint256,uint256)",
  "_setMarketBorrowCaps(address[],uint256[])",
  "_setMarketSupplyCaps(address[],uint256[])",
  "setFlashLoanPaused(bool)",
  "setIsBorrowAllowed(uint96,address,bool)",
  "setWhiteListFlashLoanAccount(address,bool)",
];

// Every comptroller function EBrake calls, on the Core pool and on Spoke pools
export const EBRAKE_WILDCARD_PERMISSIONS = [
  ...CORE_COMPTROLLER_PERMISSIONS,
  "setActionsPaused(address[],uint256[],bool)",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
];

// What EBrake calls on an isolated pool comptroller, granted per comptroller on the remote chains by VIP-616
export const IL_COMPTROLLER_PERMISSIONS = [
  "setActionsPaused(address[],uint256[],bool)",
  "setCollateralFactor(address,uint256,uint256)",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
];

export const REMOTE_CHAINS = [
  {
    name: "Ethereum",
    dstChainId: LzChainId.ethereum,
    acm: ethereum.ACCESS_CONTROL_MANAGER,
    coreComptroller: ethereum.CORE_COMPTROLLER,
    proxyAdmin: "0xa6a4e5196fa108008b68fe6d6629d508c902d61c",
    eBrake: "0xCD09042c5DFFed762998Df9a058ec5944e39949B",
    newEBrakeImplementation: "0x0Dab769617B2d690DDbe8A6D730D9C9b85F26ca0",
  },
  {
    name: "Arbitrum One",
    dstChainId: LzChainId.arbitrumone,
    acm: arbitrumone.ACCESS_CONTROL_MANAGER,
    coreComptroller: arbitrumone.CORE_COMPTROLLER,
    proxyAdmin: "0x9fa1031e7f9578e9d4a260cf0df79d4540cd1836",
    eBrake: "0xFc4CE7Ca9BB5119705Cfb84d6e4476e8a4032b26",
    newEBrakeImplementation: "0x8A7d8589A597619A7842d3BC284b9a5a276FaE56",
  },
  {
    name: "Base",
    dstChainId: LzChainId.basemainnet,
    acm: basemainnet.ACCESS_CONTROL_MANAGER,
    coreComptroller: basemainnet.CORE_COMPTROLLER,
    proxyAdmin: "0x70d73ee950f2436483b6e410915cb53d473f6eb1",
    eBrake: "0x062C68Af7B9Fb059DCB7FA4B6b92E633350fb7c2",
    newEBrakeImplementation: "0x10d63B1203E5A0719AbbE927C8BFc87135b2F129",
  },
];
