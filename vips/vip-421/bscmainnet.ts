import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUM_CONVERTER_NETWORK,
  ARBITRUM_USDC_PRIME_CONVERTER,
  ARBITRUM_USDT_PRIME_CONVERTER,
  ARBITRUM_WBTC_PRIME_CONVERTER,
  ARBITRUM_WETH_PRIME_CONVERTER,
  ARBITRUM_XVS_VAULT_CONVERTER,
  ARBITRUM_XVS_VAULT_TREASURY,
  ETHEREUM_USDC_PRIME_CONVERTER,
  ETHEREUM_USDT_PRIME_CONVERTER,
  ETHEREUM_WBTC_PRIME_CONVERTER,
  ETHEREUM_WETH_PRIME_CONVERTER,
  ETHEREUM_XVS_VAULT_CONVERTER,
  arbitrumBaseAssets,
  arbitrumConverters,
  arbitrumGrant,
  arbitrumIncentiveAndAccessibilities,
  arbitrumTokenAddresses,
  ethereumBaseAssets,
  ethereumUSDCPrimeConverterTokenOuts,
  ethereumUSDTPrimeConverterTokenOuts,
  ethereumWBTCPrimeConverterTokenOuts,
  ethereumWETHPrimeConverterTokenOuts,
  ethereumXVSVaultConverterTokenOuts,
} from "./addresses";

export const SEPOLIA_CONVERSION_INCENTIVE = 3e14;
const { arbitrumsepolia } = NETWORK_ADDRESSES;

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
      ...arbitrumConverters.flatMap(converter => [
        ...[
          arbitrumsepolia.NORMAL_TIMELOCK,
          arbitrumsepolia.FAST_TRACK_TIMELOCK,
          arbitrumsepolia.CRITICAL_TIMELOCK,
        ].flatMap(timelock => [
          arbitrumGrant(converter, "setConversionConfig(address,address,ConversionConfig)", timelock),
          arbitrumGrant(converter, "pauseConversion()", timelock),
          arbitrumGrant(converter, "resumeConversion()", timelock),
          arbitrumGrant(converter, "setMinAmountToConvert(uint256)", timelock),
        ]),
      ]),
      ...[
        arbitrumsepolia.NORMAL_TIMELOCK,
        arbitrumsepolia.FAST_TRACK_TIMELOCK,
        arbitrumsepolia.CRITICAL_TIMELOCK,
      ].flatMap(timelock => [
        arbitrumGrant(ARBITRUM_CONVERTER_NETWORK, "addTokenConverter(address)", timelock),
        arbitrumGrant(ARBITRUM_CONVERTER_NETWORK, "removeTokenConverter(address)", timelock),
        arbitrumGrant(ARBITRUM_XVS_VAULT_TREASURY, "fundXVSVault(uint256)", timelock),
      ]),
      {
        target: ARBITRUM_USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[0], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[1], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[2], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[3], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[4], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: ETHEREUM_USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[0], [ethereumUSDTPrimeConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[1], [ethereumUSDCPrimeConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[2], [ethereumWBTCPrimeConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[3], [ethereumWETHPrimeConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[4], [ethereumXVSVaultConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};
export default vip421;
