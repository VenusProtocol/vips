import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUM_USDC_PRIME_CONVERTER,
  ARBITRUM_USDT_PRIME_CONVERTER,
  ARBITRUM_WBTC_PRIME_CONVERTER,
  ARBITRUM_WETH_PRIME_CONVERTER,
  ARBITRUM_XVS_VAULT_CONVERTER,
  ETHEREUM_USDC_PRIME_CONVERTER,
  ETHEREUM_USDT_PRIME_CONVERTER,
  ETHEREUM_WBTC_PRIME_CONVERTER,
  arbitrumBaseAssets,
  arbitrumIncentiveAndAccessibilities,
  arbitrumIncentiveAndAccessibilitiesForXVS,
  arbitrumUSDCPrimeConverterTokenOuts,
  arbitrumUSDTPrimeConverterTokenOuts,
  arbitrumWBTCPrimeConverterTokenOuts,
  arbitrumWETHPrimeConverterTokenOuts,
  arbitrumXVSVaultConverterTokenOuts,
  ethereumBaseAssets,
  ethereumUSDCPrimeConverterTokenOuts,
  ethereumUSDTPrimeConverterTokenOuts,
  ethereumWBTCPrimeConverterTokenOuts,
  incentiveAndAccessibilitiesEthereum,
} from "./addresses";

const vip421 = () => {
  const meta = {
    version: "v2",
    title: "VIP-421",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ARBITRUM_USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[0], arbitrumUSDTPrimeConverterTokenOuts, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[1], arbitrumUSDCPrimeConverterTokenOuts, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[2], arbitrumWBTCPrimeConverterTokenOuts, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[3], arbitrumWETHPrimeConverterTokenOuts, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[4], arbitrumXVSVaultConverterTokenOuts, arbitrumIncentiveAndAccessibilitiesForXVS],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[0], ethereumUSDTPrimeConverterTokenOuts, incentiveAndAccessibilitiesEthereum],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[1], ethereumUSDCPrimeConverterTokenOuts, incentiveAndAccessibilitiesEthereum],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[2], ethereumWBTCPrimeConverterTokenOuts, incentiveAndAccessibilitiesEthereum],
        dstChainId: LzChainId.ethereum,
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};
export default vip421;
