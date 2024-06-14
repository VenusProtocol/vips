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

export const XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const PROTOCOL_SHARE_RESERVE_PROXY = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";

export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const COMPTROLLER_LST = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";
export const PLP = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";

export const USDT = BaseAssets[0];
export const USDC = BaseAssets[1];
export const WBTC = BaseAssets[2];
export const WETH = BaseAssets[3];

export const VUSDT_CORE = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const VUSDC_CORE = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const VWBTC_CORE = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
export const VWETH_LST = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";

const vipConverter = () => {
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

export default vipConverter;
