import { makeProposal } from "../../../../src/utils";
import { acceptOwnershipCommandsAllConverters, callPermissionCommandsAllConverter } from "./commands";
import {
  WBTCPrimeConverterTokenOuts,
  WBTC_PRIME_CONVERTER,
  BaseAssets,
  CONVERTER_NETWORK,
  WETHPrimeConverterTokenOuts,
  WETH_PRIME_CONVERTER,
  USDCPrimeConverterTokenOuts,
  USDC_PRIME_CONVERTER,
  USDTPrimeConverterTokenOuts,
  USDT_PRIME_CONVERTER,
  XVSVaultConverterTokenOuts,
  XVS_VAULT_CONVERTER,
  GUARDIAN,
} from "./Addresses";
import {
  converterCommands,
  grant,
  incentiveAndAccessibilityForWBTCPrimeConverter,
  incentiveAndAccessibilityForWETHPrimeConverter,
  incentiveAndAccessibilityForUSDCPrimeConverter,
  incentiveAndAccessibilityForUSDTPrimeConverter,
  incentiveAndAccessibilityForXVSVaultConverter,
} from "./commands";

export const XVS_VAULT_TREASURY = "0xCCB08e5107b406E67Ad8356023dd489CEbc79B40";
const PROTOCOL_SHARE_RESERVE_PROXY = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const vipConverter = () => {
  return makeProposal(
    [
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
    ],
  );
};

export default vipConverter;
