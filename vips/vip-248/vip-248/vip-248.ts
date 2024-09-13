import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BTCBPrimeConverterTokenOuts,
  BTCB_PRIME_CONVERTER,
  BaseAssets,
  CONVERTER_NETWORK,
  CRITICAL_TIMELOCK,
  ETHPrimeConverterTokenOuts,
  ETH_PRIME_CONVERTER,
  FAST_TRACK_TIMELOCK,
  NORMAL_TIMELOCK,
  RISK_FUND_CONVERTER,
  RiskFundConverterTokenOuts,
  USDCPrimeConverterTokenOuts,
  USDC_PRIME_CONVERTER,
  USDTPrimeConverterTokenOuts,
  USDT_PRIME_CONVERTER,
  XVSVaultConverterTokenOuts,
  XVS_VAULT_CONVERTER,
} from "./Addresses";
import {
  converterCommands,
  grant,
  incentiveAndAccessibilityForBTCBPrimeConverter,
  incentiveAndAccessibilityForETHPrimeConverter,
  incentiveAndAccessibilityForRiskFundConverter,
  incentiveAndAccessibilityForUSDCPrimeConverter,
  incentiveAndAccessibilityForUSDTPrimeConverter,
  incentiveAndAccessibilityForXVSVaultConverter,
} from "./commands";

const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const RISK_FUND_PROXY = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const RISK_FUND_V2_IMPLEMENTATION = "0x2F377545Fd095fA59A56Cb1fD7456A2a0B781Cb6";

const PROTOCOL_SHARE_RESERVE_PROXY = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION = "0x86a2a5EB77984E923E7B5Af45819A8c8f870f061";

const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";

export const vip248 = () => {
  const meta = {
    version: "v2",
    title: "VIP-248 Token converter: deployment stage 2/2",
    description: `#### Summary

If passed, this VIP will enable the Token Converter contracts. Specifically this VIP would:

- Configure available conversions, considering every underlying token currently available in Venus, and the [tokenomics rules](https://docs-v4.venus.io/governance/tokenomics)
- Link the [Automatic Income Allocation system](https://docs-v4.venus.io/whats-new/automatic-income-allocation) with the converters, allowing anyone to send the market reserves from the [ProtocolShareReserve](https://bscscan.com/address/0xCa01D5A9A248a830E9D93231e791B1afFed7c446) contract to the converters. This is done via the the distribution rules configured in the ProtocolShareReserve contract
- Upgrade the implementation of the ProtocolShareReserve contract, to allow income distribution using percentages with two decimals
- Upgrade the implementation of the [RiskFund](https://bscscan.com/address/0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42) contract, to make it compatible with the [RiskFundConverter](https://bscscan.com/address/0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0) contract
- Authorize fast-track and critical timelocks to execute privilege functions in the converter related contracts

After executing this VIP, anyone (token converters are permissionless) will be able to convert the Venus reserves. The contracts enforce it following the protocol tokenomics.

#### Description

This VIP is part of the proposal [Automatic Income Allocation & Token Converter](https://community.venus.io/t/automatic-income-allocation-token-converter/3702), published in the Venus community forum. Specifically, this VIP is related to the Token Converter subsystem. This VIP is the follow-up of the [VIP-245 Token converter: deployment stage 1/2](https://app.venus.io/#/governance/proposal/245).

Token converters are permissionless: they allow anyone to convert the available tokens in the converters for the required tokens according to the Venus tokenomics. Specifically, the following converters will be enabled:

- [RiskFundConverter](https://bscscan.com/address/0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0): accepting [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955), offering 40% of the interest reserves and 50% of the liquidation income
- [XVSVaultConverter](https://bscscan.com/address/0xd5b9AE835F4C59272032B3B954417179573331E0): accepting [XVS](https://bscscan.com/address/0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63), offering 10% of the interest reserves and 10% of the liquidation income
- Prime converters:
    - [USDTPrimeConverter](https://bscscan.com/address/0xD9f101AA67F3D72662609a2703387242452078C3): accepting [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955) and offering 4% of the interest reserves
    - [USDCPrimeConverter](https://bscscan.com/address/0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b): accepting [USDC](https://bscscan.com/address/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d) and offering 3% of the interest reserves
    - [BTCBPrimeConverter](https://bscscan.com/address/0xE8CeAa79f082768f99266dFd208d665d2Dd18f53): accepting [BTCB](https://bscscan.com/address/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c) and offering 0.5% of the interest reserves
    - [ETHPrimeConverter](https://bscscan.com/address/0xca430B8A97Ea918fF634162acb0b731445B8195E): accepting [ETH](https://bscscan.com/address/0x2170Ed0880ac9A755fd29B2688956BD959F933F8) and offering 2.5% of the interest reserves

The incentive of every conversion is zero. This can be changed in the future via VIP.

Private conversions are configured: when new funds arrive at a token converter contract, the rest of the converters are checked, and a private conversion will be performed if possible. Conversions for USDT in the following converters are only allowed via private conversions: XVSVaultConverter, USDCPrimeConverter, BTCBPrimeConverter, ETHPrimeConverter. The RiskFundConverter and the USDTPrimeConverter should have enough funds to complete the conversions for USDT in the rest of converters with a private conversion (that are more efficient).

The RiskFundConverter will directly transfer to the RiskFund contract every BTCB and ETH received from the Core pool. These tokens are not converted to USDT, and will be used to reduce the Venus shortfall.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- Configuration post VIP: in a simulation environment, validating the parameters of the Token Converter contracts are the expected ones after the VIP.
- Token conversions: in a simulation environment, validating the token reserves generated by the protocol can be converted to the expected tokens following the tokenomics, including private conversions.
- Deployment on testnet: the same contracts were deployed and configured to testnet, and used in the Venus Protocol testnet deployment
- Audit: OpenZeppelin, Certik, Peckshield and Fairyproof have audited the deployed code. Additionally, OpenZeppelin and Certik audited the private conversions feature.

#### Audit reports

- Token converters
    - [OpenZeppelin audit report (2023/10/10)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/066_tokenConverter_openzeppelin_20231010.pdf)
    - [Certik audit audit report (2023/11/07)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/074_tokenConverter_certik_20231107.pdf)
    - [Peckshield audit report (2023/09/27)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/068_tokenConverter_peckshield_20230927.pdf)
    - [Fairyproof audit report (2023/08/28)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/067_tokenConverter_fairyproof_20230828.pdf)
- Private conversions
    - [Certik audit report (2023/11/27)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/081_privateConversions_certik_20231127.pdf)
    - [OpenZeppelin report (2024/01/09)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/082_privateConversions_openzeppelin_20240109.pdf)

#### Deployed contracts to mainnet

- [RiskFundConverter](https://bscscan.com/address/0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0)
- [XVSVaultTreasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a)
- [SingleTokenConverterBeacon](https://bscscan.com/address/0x4c9D57b05B245c40235D720A5f3A592f3DfF11ca)
- [USDTPrimeConverter](https://bscscan.com/address/0xD9f101AA67F3D72662609a2703387242452078C3)
- [USDCPrimeConverter](https://bscscan.com/address/0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b)
- [BTCBPrimeConverter](https://bscscan.com/address/0xE8CeAa79f082768f99266dFd208d665d2Dd18f53)
- [ETHPrimeConverter](https://bscscan.com/address/0xca430B8A97Ea918fF634162acb0b731445B8195E)
- [XVSVaultConverter](https://bscscan.com/address/0xd5b9AE835F4C59272032B3B954417179573331E0)
- [ConverterNetwork](https://bscscan.com/address/0xF7Caad5CeB0209165f2dFE71c92aDe14d0F15995)

#### References

- [Pull request with the Token Converter contracts](https://github.com/VenusProtocol/protocol-reserve/pull/9)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/49)
- [Documentation](https://docs-v4.venus.io/whats-new/token-converter)`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      grant(RISK_FUND_CONVERTER, "setPoolsAssetsDirectTransfer(address[],address[][],bool[][])", NORMAL_TIMELOCK),
      grant(RISK_FUND_CONVERTER, "setPoolsAssetsDirectTransfer(address[],address[][],bool[][])", FAST_TRACK_TIMELOCK),
      grant(RISK_FUND_CONVERTER, "setPoolsAssetsDirectTransfer(address[],address[][],bool[][])", CRITICAL_TIMELOCK),

      grant(CONVERTER_NETWORK, "addTokenConverter(address)", NORMAL_TIMELOCK),
      grant(CONVERTER_NETWORK, "addTokenConverter(address)", FAST_TRACK_TIMELOCK),
      grant(CONVERTER_NETWORK, "addTokenConverter(address)", CRITICAL_TIMELOCK),

      grant(CONVERTER_NETWORK, "removeTokenConverter(address)", NORMAL_TIMELOCK),
      grant(CONVERTER_NETWORK, "removeTokenConverter(address)", FAST_TRACK_TIMELOCK),
      grant(CONVERTER_NETWORK, "removeTokenConverter(address)", CRITICAL_TIMELOCK),

      grant(XVS_VAULT_TREASURY, "fundXVSVault(uint256)", NORMAL_TIMELOCK),
      grant(XVS_VAULT_TREASURY, "fundXVSVault(uint256)", FAST_TRACK_TIMELOCK),
      grant(XVS_VAULT_TREASURY, "fundXVSVault(uint256)", CRITICAL_TIMELOCK),
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_PROXY, RISK_FUND_V2_IMPLEMENTATION],
      },
      {
        target: RISK_FUND_PROXY,
        signature: "setRiskFundConverter(address)",
        params: [RISK_FUND_CONVERTER],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfigs((uint8,uint8,address)[])", // set to 0 every percentage, to allow us to remove them in the next command
        params: [
          [
            [0, 0, RISK_FUND_PROXY],
            [0, 0, VTREASURY],
            [1, 0, RISK_FUND_PROXY],
            [1, 0, VTREASURY],
          ],
        ],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "removeDistributionConfig(uint8,address)", // schema 0
        params: [0, RISK_FUND_PROXY],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "removeDistributionConfig(uint8,address)", // schema 0
        params: [0, VTREASURY],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "removeDistributionConfig(uint8,address)", // schema 1
        params: [1, RISK_FUND_PROXY],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "removeDistributionConfig(uint8,address)", // schema 1
        params: [1, VTREASURY],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PROTOCOL_SHARE_RESERVE_PROXY, PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 4000, RISK_FUND_CONVERTER],
            [0, 4000, VTREASURY],
            [0, 1000, XVS_VAULT_CONVERTER],
            [0, 300, USDC_PRIME_CONVERTER],
            [0, 400, USDT_PRIME_CONVERTER],
            [0, 50, BTCB_PRIME_CONVERTER],
            [0, 250, ETH_PRIME_CONVERTER],
            [1, 5000, RISK_FUND_CONVERTER],
            [1, 4000, VTREASURY],
            [1, 1000, XVS_VAULT_CONVERTER],
          ],
        ],
      },
      ...converterCommands,
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

export default vip248;
