import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

import {
  BaseAssets,
  CONVERTER_NETWORK,
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
import {
  acceptOwnershipCommandsAllConverters,
  callPermissionCommandsAllConverter,
  converterCommands,
  grant,
  incentiveAndAccessibilities,
} from "./commands";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";
export const COMPTROLLER_LST = "0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4";
export const PRIME = "0xAdB04AC4942683bc41E27d18234C8DC884786E89";
export const PLP = "0xE82c2c10F55D3268126C29ec813dC6F086904694";

export const XVS_VAULT_TREASURY = "0x309b71a417dA9CfA8aC47e6038000B1739d9A3A6";
export const PROTOCOL_SHARE_RESERVE_PROXY = "0x09267d30798B59c581ce54E861A084C6FC298666";
export const VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";

const vip016 = () => {
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

    grant(CONVERTER_NETWORK, "addTokenConverter(address)", arbitrumsepolia.GUARDIAN),
    grant(CONVERTER_NETWORK, "removeTokenConverter(address)", arbitrumsepolia.GUARDIAN),
    grant(XVS_VAULT_TREASURY, "fundXVSVault(uint256)", arbitrumsepolia.GUARDIAN),

    {
      target: PROTOCOL_SHARE_RESERVE_PROXY,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 6000, VTREASURY],
          [0, 2000, XVS_VAULT_CONVERTER],
          [0, 500, USDC_PRIME_CONVERTER], // 25% of the Prime allocation
          [0, 500, USDT_PRIME_CONVERTER], // 25% of the Prime allocation
          [0, 300, WBTC_PRIME_CONVERTER], // 15% of the Prime allocation
          [0, 700, WETH_PRIME_CONVERTER], // 35% of the Prime allocation
          [1, 8000, VTREASURY],
          [1, 2000, XVS_VAULT_CONVERTER],
        ],
      ],
    },
    ...converterCommands,
    {
      target: USDT_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[0], USDTPrimeConverterTokenOuts, incentiveAndAccessibilities],
    },
    {
      target: USDC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[1], USDCPrimeConverterTokenOuts, incentiveAndAccessibilities],
    },
    {
      target: WBTC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[2], WBTCPrimeConverterTokenOuts, incentiveAndAccessibilities],
    },
    {
      target: WETH_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[3], WETHPrimeConverterTokenOuts, incentiveAndAccessibilities],
    },
    {
      target: XVS_VAULT_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [BaseAssets[4], XVSVaultConverterTokenOuts, incentiveAndAccessibilities],
    },
  ]);
};

export default vip016;
