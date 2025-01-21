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

const vip429 = () => {
  const meta = {
    version: "v2",
    title: "VIP-429",
    description: "",
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
export default vip429;
