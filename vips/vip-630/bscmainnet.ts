import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { assetsToEnable, newAssetConfigs } from "./utils/asset-configs-bscmainnet.json";

export type AssetToEnable = {
  name: string;
  asset: string;
  vToken: string;
};

export type NewAssetConfig = {
  name: string;
  asset: string;
  vToken: string;
  cooldownPeriod: number;
  triggerThreshold: string;
  resetThreshold: string;
  isBoundedPricingEnabled: boolean;
  cachingEnabled: boolean;
};

// New DBO tokens to configure and enable for using DBO.
export const NEW_ASSET_CONFIGS = newAssetConfigs as NewAssetConfig[];

// All remaining already-configured assets to enable.
export const ASSETS_TO_ENABLE = assetsToEnable as AssetToEnable[];

export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";

export const vip630 = () => {
  const meta = {
    version: "v2",
    title: "VIP-630 [BNB Chain] Enable bounded pricing on the remaining Core Pool assets (VIP 3 of 3)",
    description: `#### Summary

This is **VIP 3 of 3**, the final step of the DeviationBoundedOracle (DBO) rollout on BNB Chain. The rollout has been delivered in phases across three VIPs, progressively extending bounded pricing across the Core Pool:

- **VIP 1 (VIP-617)** deployed the DBO, wired it into the Comptroller, and configured 24 Core Pool assets — enabling bounded pricing for the **first** asset, **TRX** (\`isBoundedPricingEnabled = true\`), while leaving the other 23 configured but disabled.
- **VIP 2 (VIP-626)** enabled the **second** group of 8 assets: AAVE, ADA, BCH, DOGE, LINK, LTC, TWT and UNI.
- **This VIP (VIP 3)** enables every remaining Core Pool asset — and additionally configures the 5 markets that were never given a DBO config — completing the rollout.

Concretely, this VIP:

1. Add DBO token configs for **DAI, FDUSD, lisUSD, sUSDe and USDe** — 5 Core Pool markets not configured in VIP-617 — enabling them in the same \`setTokenConfigs\` call.
2. Flipping \`isBoundedPricingEnabled = true\` for the **15 remaining already-configured assets** so that protection becomes active across the Core Pool.

After this VIP executes, the following 20 assets transition to bounded pricing active: asBNB, BNB, BTCB, CAKE, DAI, ETH, FDUSD, lisUSD, slisBNB, SOL, SolvBTC, sUSDe, USDe, vPT-clisBNB-25JUN2026, WBETH, WBNB, XAUM, XRP, xSolvBTC and XVS. Together with the 9 assets enabled earlier (TRX in VIP 1; AAVE, ADA, BCH, DOGE, LINK, LTC, TWT and UNI in VIP 2), this brings the total to **29 Core Pool assets** that now price through the DeviationBoundedOracle's bounded (protected) price rather than the raw ResilientOracle spot.

On enable, each asset's rolling window re-seeds at the current spot price, so there is no stale-window risk. The DBO returns \`(spot, spot)\` until the keeper observes spot deviating beyond the asset's \`triggerThreshold\`, at which point collateral is valued at \`min(spot, windowMin)\` and debt at \`max(spot, windowMax)\`.

Parameters for the newly configured assets keep the VIP-617 conventions \`cooldownPeriod = 1h\` and \`cachingEnabled = false\`. All 5 are stablecoins (DAI, FDUSD, lisUSD, sUSDe and USDe), so each uses a tight, flat \`triggerThreshold = 5%\` with \`resetThreshold = 2%\` rather than the CF-derived formula used for volatile assets — that formula would arm a needlessly wide band on assets expected to hold their peg.

In every config \`resetThreshold\` is strictly below \`triggerThreshold\`, as the DBO requires.

#### Deployed contracts

- **DeviationBoundedOracle**: ${DEVIATION_BOUNDED_ORACLE}
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure the assets not included in initial VIP-617: DAI, FDUSD, lisUSD, sUSDe and USDe.
      // The config itself enables (isBoundedPricingEnabled = true) bounded pricing.
      {
        target: DEVIATION_BOUNDED_ORACLE,
        signature: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])",
        params: [
          NEW_ASSET_CONFIGS.map(c => [
            c.asset,
            c.cooldownPeriod,
            c.triggerThreshold,
            c.resetThreshold,
            c.isBoundedPricingEnabled,
            c.cachingEnabled,
          ]),
        ],
      },

      // Enable bounded pricing for the remaining 15 assets already configured but left
      // disabled. Each flip re-seeds the asset's price window at spot.
      // Assets: asBNB, BNB, BTCB, CAKE, ETH, slisBNB, SOL, SolvBTC,
      // vPT-clisBNB-25JUN2026, WBETH, WBNB, XAUM, XRP, xSolvBTC, XVS.
      ...ASSETS_TO_ENABLE.map(c => ({
        target: DEVIATION_BOUNDED_ORACLE,
        signature: "setAssetBoundedPricingEnabled(address,bool)",
        params: [c.asset, true],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip630;
