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

const vip427 = () => {
  const meta = {
    version: "v2",
    title: "VIP-427 [Ethereum][Arbitrum] Incentives for Token Converters (1/2)",
    description: `If passed, this VIP will set the following incentives for every conversion pair in every Token Converter contract used by the Venus Protocol, following the [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-ethereum-token-converter-10-24-24/4673).

- Ethereum: 0.03% (currently 0.01%)
- Arbitrum one: 0.01% (currently 0%)

Token Converters are permissionless: anyone is able to perform a conversion on those contracts. Incentives on the Token Converters should create arbitrage opportunities, returning on each conversion slightly more than the expected amounts only considering the oracle prices of the tokens involved, or requiring fewer tokens than expected (depending on the type of conversion set by the caller).

The increase of the incentives on Ethereum should help cover the higher gas costs. Increasing the incentives on Arbitrum one should help make them more fluent.

This VIP updates the incentives on every converter on Arbitrum one, and the incentives on the following Ethereum converters:

- USDT Prime Converter
- USDC Prime Converter
- WBTC Prime Converter

There will be another VIP soon to update the incentives on the Ethereum's converters WETH Prime Converter and XVS Vault Converter. These commands are not included in this VIP due to the limitation on the payload size that can be sent through the LayerZero bridge in one message.

#### References

- [VIP Simulation](https://github.com/VenusProtocol/vips/pull/456)
- [Token Converters documentation](https://docs-v4.venus.io/whats-new/token-converter)
- [Technical article about Token Converters](https://docs-v4.venus.io/technical-reference/reference-technical-articles/token-converters)
- Addresses of the deployed Token Converter contracts: [Ethereum](https://docs-v4.venus.io/deployed-contracts/token-converters#ethereum), [Arbitrum one](https://docs-v4.venus.io/deployed-contracts/token-converters#arbitrum-one)
- [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-ethereum-token-converter-10-24-24/4673)`,
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
    ProposalType.FAST_TRACK,
  );
};
export default vip427;
