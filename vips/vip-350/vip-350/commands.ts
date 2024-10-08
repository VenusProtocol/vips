import { Assets, BaseAssets } from "./addresses";

type IncentiveAndAccessibility = [number, number];

function getIncentiveAndAccessibility(baseAsset: string) {
  const incentivesAndAccess: Array<[number, number]> = [];

  for (const asset of Assets) {
    if (asset != baseAsset) {
      incentivesAndAccess.push([1e14, 1]); // ALL
    }
  }
  return incentivesAndAccess;
}

export const incentiveAndAccessibilityForRiskFundConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[0],
);
export const incentiveAndAccessibilityForUSDTPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[1],
);
export const incentiveAndAccessibilityForUSDCPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[2],
);
export const incentiveAndAccessibilityForBTCBPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[3],
);
export const incentiveAndAccessibilityForETHPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[4],
);
export const incentiveAndAccessibilityForXVSVaultConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[5],
);
