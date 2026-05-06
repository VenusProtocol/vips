import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { assetsToEnable } from "./utils/asset-configs-bscmainnet.json";

export type AssetToEnable = {
  name: string;
  asset: string;
  vToken: string;
};

export const ASSETS_TO_ENABLE: AssetToEnable[] = assetsToEnable as AssetToEnable[];
export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";

export const vip666 = () => {
  const meta = {
    version: "v2",
    title: "VIP-666 [BNB Chain] Enable bounded pricing on the remaining 23 core-pool assets",
    description: `#### Summary

Follow-up to VIP-665. Activates DeviationBoundedOracle protection on the 23 core-pool assets that were left disabled at rollout. After this VIP executes, all 24 core-pool assets (including TRX from VIP-665) will have \`isBoundedPricingEnabled = true\` and the DeviationBoundedOracle will start clipping collateral / debt prices when spot deviates beyond each asset's seeded \`triggerThreshold\`.

#### Assets enabled

${ASSETS_TO_ENABLE.map(c => `- ${c.name} \`${c.asset}\``).join("\n")}

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

export default vip666;
