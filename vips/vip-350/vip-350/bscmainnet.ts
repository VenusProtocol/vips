import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BTCBPrimeConverterTokenOuts,
  BTCB_PRIME_CONVERTER,
  BaseAssets,
  ETHPrimeConverterTokenOuts,
  ETH_PRIME_CONVERTER,
  RISK_FUND_CONVERTER,
  RiskFundConverterTokenOuts,
  USDCPrimeConverterTokenOuts,
  USDC_PRIME_CONVERTER,
  USDTPrimeConverterTokenOuts,
  USDT_PRIME_CONVERTER,
  XVSVaultConverterTokenOuts,
  XVS_VAULT_CONVERTER,
} from "./addresses";
import {
  incentiveAndAccessibilityForBTCBPrimeConverter,
  incentiveAndAccessibilityForETHPrimeConverter,
  incentiveAndAccessibilityForRiskFundConverter,
  incentiveAndAccessibilityForUSDCPrimeConverter,
  incentiveAndAccessibilityForUSDTPrimeConverter,
  incentiveAndAccessibilityForXVSVaultConverter,
} from "./commands";

export const vip350 = () => {
  const meta = {
    version: "v2",
    title: "VIP-350 Incentives for Token Converters",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- set to 0.01% the incentive for every conversion pair in every Token Converter contract used by the Venus Protocol on BNB Chain, following the [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-token-converter/4521).
- enable USDT conversions on every Token Converter, for any wallet, not only for other converters

#### Description

Token Converters are permissionless: anyone is able to perform a conversion on those contracts. Incentives on the Token Converters should create arbitrage opportunities, returning on each conversion slightly more than the expected amounts only considering the oracle prices of the tokens involved, or requiring fewer tokens than expected (depending on the type of conversion set by the caller). The community is expected to take advantage of these arbitrages and operate the Token Converter contracts fluently because they should be economically profitable.

The distribution of funds to the RiskFundConverter has been zero since [VIP-332](https://app.venus.io/#/governance/proposal/332?chainId=56). Nowadays there is no converter interested in USDT receiving a fluent flow of tokens that could be used to convert the offer of the rest of the converters. So, it doesn’t make sense to maintain “only private” conversions of USDT in those converters. This VIP will open the USDT conversions in the following Token Converters on BNB Chain:

- [USDTPrimeConverter](https://bscscan.com/address/0xD9f101AA67F3D72662609a2703387242452078C3)
- [USDCPrimeConverter](https://bscscan.com/address/0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b)
- [BTCBPrimeConverter](https://bscscan.com/address/0xE8CeAa79f082768f99266dFd208d665d2Dd18f53)
- [ETHPrimeConverter](https://bscscan.com/address/0xca430B8A97Ea918fF634162acb0b731445B8195E)

#### References

- [VIP Simulation](https://github.com/VenusProtocol/vips/pull/339)
- [Token Converters documentation](https://docs-v4.venus.io/whats-new/token-converter)
- [Technical article about Token Converters](https://docs-v4.venus.io/technical-reference/reference-technical-articles/token-converters)
- [Addresses of the deployed Token Converter contracts](https://docs-v4.venus.io/deployed-contracts/token-converters)
- [Chaos Labs recommendation](https://community.venus.io/t/chaos-labs-token-converter/4521)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: RISK_FUND_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], RiskFundConverterTokenOuts, incentiveAndAccessibilityForRiskFundConverter],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], USDTPrimeConverterTokenOuts, incentiveAndAccessibilityForUSDTPrimeConverter],
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], USDCPrimeConverterTokenOuts, incentiveAndAccessibilityForUSDCPrimeConverter],
      },
      {
        target: BTCB_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], BTCBPrimeConverterTokenOuts, incentiveAndAccessibilityForBTCBPrimeConverter],
      },
      {
        target: ETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], ETHPrimeConverterTokenOuts, incentiveAndAccessibilityForETHPrimeConverter],
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[5], XVSVaultConverterTokenOuts, incentiveAndAccessibilityForXVSVaultConverter],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip350;
