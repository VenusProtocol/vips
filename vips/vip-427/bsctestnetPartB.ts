import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  SEPOLIA_WETH_PRIME_CONVERTER,
  SEPOLIA_XVS_VAULT_CONVERTER,
  incentiveAndAccessibilitiesSepolia,
  incentiveAndAccessibilitiesSepoliaForXVS,
  sepoliaBaseAssets,
  sepoliaWETHPrimeConverterTokenOuts,
  sepoliaXVSVaultConverterTokenOuts,
} from "./addresses";

const vip429 = () => {
  const meta = {
    version: "v2",
    title: "VIP-429 Part B",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: SEPOLIA_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[3], sepoliaWETHPrimeConverterTokenOuts, incentiveAndAccessibilitiesSepolia],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [sepoliaBaseAssets[4], sepoliaXVSVaultConverterTokenOuts, incentiveAndAccessibilitiesSepoliaForXVS],
        dstChainId: LzChainId.sepolia,
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};
export default vip429;
