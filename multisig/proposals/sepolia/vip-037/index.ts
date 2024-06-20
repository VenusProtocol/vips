import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";
import {
  BaseAssets,
  CONVERTER_NETWORK,
  GUARDIAN,
  USDCPrimeConverterTokenOuts,
  USDC_PRIME_CONVERTER,
  USDTPrimeConverterTokenOuts,
  USDT_PRIME_CONVERTER,
  WBTCPrimeConverterTokenOuts,
  WBTC_PRIME_CONVERTER,
  WETHPrimeConverterTokenOuts,
  WETH_PRIME_CONVERTER,
  XVSVaultConverterTokenOuts,
  XVS_VAULT_CONVERTER,
} from "./Addresses";
import { acceptOwnershipCommandsAllConverters, callPermissionCommandsAllConverter } from "./commands";
import {
  converterCommands,
  grant,
  incentiveAndAccessibilityForUSDCPrimeConverter,
  incentiveAndAccessibilityForUSDTPrimeConverter,
  incentiveAndAccessibilityForWBTCPrimeConverter,
  incentiveAndAccessibilityForWETHPrimeConverter,
  incentiveAndAccessibilityForXVSVaultConverter,
} from "./commands";

export const XVS_VAULT_TREASURY = "0xCCB08e5107b406E67Ad8356023dd489CEbc79B40";
export const PROTOCOL_SHARE_RESERVE_PROXY = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
export const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const COMPTROLLER_LST = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
export const PRIME = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";
export const PLP = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";

export const USDT = BaseAssets[0];
export const USDC = BaseAssets[1];
export const WBTC = BaseAssets[2];
export const WETH = BaseAssets[3];

export const VUSDT_CORE = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const VUSDC_CORE = "0xF87bceab8DD37489015B426bA931e08A4D787616";
export const VWBTC_CORE = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
export const VWETH_LST = "0x9f6213dFa9069a5426Fe8fAE73857712E1259Ed4";

const vip037 = () => {
  return makeProposal([
    ...acceptOwnershipCommandsAllConverters,
    {
      target: XVS_VAULT_TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: CONVERTER_NETWORK,
      signature: "acceptOwnership()",
      params: [],
    },
    ...callPermissionCommandsAllConverter,

    grant(CONVERTER_NETWORK, "addTokenConverter(address)", GUARDIAN),
    grant(CONVERTER_NETWORK, "removeTokenConverter(address)", GUARDIAN),
    grant(XVS_VAULT_TREASURY, "fundXVSVault(uint256)", GUARDIAN),

    {
      target: PROTOCOL_SHARE_RESERVE_PROXY,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 6000, VTREASURY],
          [0, 2000, XVS_VAULT_CONVERTER],
          [0, 200, USDC_PRIME_CONVERTER],
          [0, 200, USDT_PRIME_CONVERTER],
          [0, 100, WBTC_PRIME_CONVERTER],
          [0, 1500, WETH_PRIME_CONVERTER],
          [1, 8000, VTREASURY],
          [1, 2000, XVS_VAULT_CONVERTER],
        ],
      ],
    },
    ...converterCommands,
    {
      target: USDT_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[0], USDTPrimeConverterTokenOuts, incentiveAndAccessibilityForUSDTPrimeConverter],
    },
    {
      target: USDC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[1], USDCPrimeConverterTokenOuts, incentiveAndAccessibilityForUSDCPrimeConverter],
    },
    {
      target: WBTC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[2], WBTCPrimeConverterTokenOuts, incentiveAndAccessibilityForWBTCPrimeConverter],
    },
    {
      target: WETH_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[3], WETHPrimeConverterTokenOuts, incentiveAndAccessibilityForWETHPrimeConverter],
    },
    {
      target: XVS_VAULT_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[4], XVSVaultConverterTokenOuts, incentiveAndAccessibilityForXVSVaultConverter],
    },
    {
      target: COMPTROLLER_LST,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: PLP,
      signature: "initializeTokens(address[])",
      params: [[WETH, WBTC, USDC, USDT]],
    },
    {
      target: PLP,
      signature: "setTokensDistributionSpeed(address[],uint256[])",
      params: [
        [WETH, WBTC, USDC, USDT],
        [0, 0, 0, 0],
      ],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER_CORE, VWBTC_CORE, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER_CORE, VUSDC_CORE, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER_CORE, VUSDT_CORE, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER_LST, VWETH_LST, ethers.utils.parseEther("2"), ethers.utils.parseEther("4")],
    },
    {
      target: PRIME,
      signature: "setLimit(uint256,uint256)",
      params: [
        0, // irrevocable
        500, // revocable
      ],
    },
  ]);
};

export default vip037;
