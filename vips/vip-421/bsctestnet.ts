import { NETWORK_ADDRESSES } from "src/networkAddresses";
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
  arbitrumSepoliaConverters,
  arbitrumSepoliaGrant,
  arbitrumSepoliaIncentiveAndAccessibilities,
  arbitrumSepoliaTokenAddresses,
  sepoliaBaseAssets,
  sepoliaUSDCPrimeConverterTokenOuts,
  sepoliaUSDTPrimeConverterTokenOuts,
  sepoliaWBTCPrimeConverterTokenOuts,
  sepoliaWETHPrimeConverterTokenOuts,
  sepoliaXVSVaultConverterTokenOuts,
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
      ...arbitrumSepoliaConverters.flatMap(converter => [
        ...[
          arbitrumsepolia.NORMAL_TIMELOCK,
          arbitrumsepolia.FAST_TRACK_TIMELOCK,
          arbitrumsepolia.CRITICAL_TIMELOCK,
        ].flatMap(timelock => [
          arbitrumSepoliaGrant(converter, "setConversionConfig(address,address,ConversionConfig)", timelock),
          arbitrumSepoliaGrant(converter, "pauseConversion()", timelock),
          arbitrumSepoliaGrant(converter, "resumeConversion()", timelock),
          arbitrumSepoliaGrant(converter, "setMinAmountToConvert(uint256)", timelock),
        ]),
      ]),
      {
        target: ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[0],
          arbitrumSepoliaTokenAddresses,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[1],
          arbitrumSepoliaTokenAddresses,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[2],
          arbitrumSepoliaTokenAddresses,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[3],
          arbitrumSepoliaTokenAddresses,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          arbitrumSepoliaBaseAssets[4],
          arbitrumSepoliaTokenAddresses,
          arbitrumSepoliaIncentiveAndAccessibilities,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: SEPOLIA_USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[0], [sepoliaUSDTPrimeConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[1], [sepoliaUSDCPrimeConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[2], [sepoliaWBTCPrimeConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[3], [sepoliaWETHPrimeConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[4], [sepoliaXVSVaultConverterTokenOuts], [[SEPOLIA_CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};
export default vip421;
