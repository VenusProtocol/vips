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

export const incentiveAndAccessibilityForUSDTPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[0],
);
export const incentiveAndAccessibilityForUSDCPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[1],
);
export const incentiveAndAccessibilityForWBTCPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[2],
);
export const incentiveAndAccessibilityForWETHPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[3],
);
export const incentiveAndAccessibilityForXVSVaultConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(
  BaseAssets[4],
);
