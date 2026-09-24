import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { assetsToEnable } from "./utils/asset-configs-bscmainnet.json";

export type AssetToEnable = {
  name: string;
  asset: string;
  vToken: string;
};

export const ASSETS_TO_ENABLE = assetsToEnable as AssetToEnable[];
export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";

export const vip626 = () => {
  const meta = {
    version: "v2",
    title: "VIP-626 [BNB Chain] Enable bounded pricing on isolated pool assets",
    description: `#### Summary

Activates DeviationBoundedOracle protection on a targeted set of isolated pool assets: AAVE, ADA, BCH, DOGE, LINK, LTC, TWT and UNI. After this VIP executes, these 8 assets (alongside TRX, already enabled) will have isBoundedPricingEnabled = true and the DeviationBoundedOracle will start clipping collateral / debt prices when spot deviates beyond each asset's seeded triggerThreshold.

#### Deployed contracts

- **DeviationBoundedOracle**: ${DEVIATION_BOUNDED_ORACLE}
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    ASSETS_TO_ENABLE.map(c => ({
      target: DEVIATION_BOUNDED_ORACLE,
      signature: "setAssetBoundedPricingEnabled(address,bool)",
      params: [c.asset, true],
    })),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip626;
