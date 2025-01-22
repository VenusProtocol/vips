import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ETHEREUM_WETH_PRIME_CONVERTER,
  ETHEREUM_XVS_VAULT_CONVERTER,
  ethereumBaseAssets,
  ethereumWETHPrimeConverterTokenOuts,
  ethereumXVSVaultConverterTokenOuts,
  incentiveAndAccessibilitiesEthereum,
  incentiveAndAccessibilitiesEthereumForXVS,
} from "./addresses";

const vip430 = () => {
  const meta = {
    version: "v2",
    title: "VIP-430 [Ethereum][Arbitrum] Incentives for Token Converters (2/2)",
    description: `If passed, this VIP will set a 0.03% (currently 0.01%) incentive for every conversion pair in the [WETH Prime Converter](https://etherscan.io/address/0xb8fD67f215117FADeF06447Af31590309750529D) and [XVS Vault Converter](https://etherscan.io/address/0x1FD30e761C3296fE36D9067b1e398FD97B4C0407) on Ethereum, following the [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-ethereum-token-converter-10-24-24/4673).

This is the second part of the changes initiated by the [VIP-427 [Ethereum][Arbitrum] Incentives for Token Converters (1/2)](https://app.venus.io/#/governance/proposal/427?chainId=56).

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
        target: ETHEREUM_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[3], ethereumWETHPrimeConverterTokenOuts, incentiveAndAccessibilitiesEthereum],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [ethereumBaseAssets[4], ethereumXVSVaultConverterTokenOuts, incentiveAndAccessibilitiesEthereumForXVS],
        dstChainId: LzChainId.ethereum,
      },
    ],

    meta,
    ProposalType.FAST_TRACK,
  );
};
export default vip430;
