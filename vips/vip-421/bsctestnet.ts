import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUM_SEPOLIA_USDC_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_WBTC_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_WETH_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_XVS_VAULT_CONVERTER,
  SEPOLIA_USDC_PRIME_CONVERTER,
  SEPOLIA_USDT_PRIME_CONVERTER,
  SEPOLIA_WBTC_PRIME_CONVERTER,
  SEPOLIA_WETH_PRIME_CONVERTER,
  SEPOLIA_XVS_VAULT_CONVERTER,
  arbitrumSepoliaBaseAssets,
  arbitrumSepoliaIncentiveAndAccessibilities,
  arbitrumSepoliaUSDCPrimeConverterTokenOuts,
  arbitrumSepoliaUSDTPrimeConverterTokenOuts,
  arbitrumSepoliaWBTCPrimeConverterTokenOuts,
  arbitrumSepoliaWETHPrimeConverterTokenOuts,
  arbitrumSepoliaXVSVaultConverterTokenOuts,
  incentiveAndAccessibilitiesSepolia,
  sepoliaBaseAssets,
  sepoliaUSDCPrimeConverterTokenOuts,
  sepoliaUSDTPrimeConverterTokenOuts,
  sepoliaWBTCPrimeConverterTokenOuts,
  sepoliaWETHPrimeConverterTokenOuts,
  sepoliaXVSVaultConverterTokenOuts,
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
        target: ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[0],
          arbitrumSepoliaUSDTPrimeConverterTokenOuts,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[1],
          arbitrumSepoliaUSDCPrimeConverterTokenOuts,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[2],
          arbitrumSepoliaWBTCPrimeConverterTokenOuts,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[3],
          arbitrumSepoliaWETHPrimeConverterTokenOuts,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[4],
          arbitrumSepoliaXVSVaultConverterTokenOuts,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: SEPOLIA_USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[0], sepoliaUSDTPrimeConverterTokenOuts, incentiveAndAccessibilitiesSepolia],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[1], sepoliaUSDCPrimeConverterTokenOuts, incentiveAndAccessibilitiesSepolia],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[2], sepoliaWBTCPrimeConverterTokenOuts, incentiveAndAccessibilitiesSepolia],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[3], sepoliaWETHPrimeConverterTokenOuts, incentiveAndAccessibilitiesSepolia],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[4], sepoliaXVSVaultConverterTokenOuts, incentiveAndAccessibilitiesSepolia],
        dstChainId: LzChainId.sepolia,
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};
export default vip421;
