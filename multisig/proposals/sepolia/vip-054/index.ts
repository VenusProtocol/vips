import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BaseAssets,
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
} from "./addresses";
import { incentiveAndAccessibilityForConverters } from "./commands";

export const vip054 = () => {
  const meta = {
    version: "v2",
    title: "Token converter: Incentive upgrade",
    description: `VIP-054`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], USDTPrimeConverterTokenOuts, incentiveAndAccessibilityForConverters],
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], USDCPrimeConverterTokenOuts, incentiveAndAccessibilityForConverters],
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], WBTCPrimeConverterTokenOuts, incentiveAndAccessibilityForConverters],
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], WETHPrimeConverterTokenOuts, incentiveAndAccessibilityForConverters],
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], XVSVaultConverterTokenOuts, incentiveAndAccessibilityForConverters],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip054;
