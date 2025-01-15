import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ARBITRUM_USDC_PRIME_CONVERTER,
  ARBITRUM_USDT_PRIME_CONVERTER,
  ARBITRUM_WBTC_PRIME_CONVERTER,
  ARBITRUM_WETH_PRIME_CONVERTER,
  ARBITRUM_XVS_VAULT_CONVERTER,
  arbitrumBaseAssets,
  arbitrumIncentiveAndAccessibilities,
  arbitrumTokenAddresses,
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
        params: [arbitrumBaseAssets[0], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[1], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[2], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[3], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [arbitrumBaseAssets[4], arbitrumTokenAddresses, arbitrumIncentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};
export default vip421;
