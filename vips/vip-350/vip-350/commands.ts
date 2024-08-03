import {
  Assets,
  BaseAssets,
} from "./addresses";

type IncentiveAndAccessibility = [number, number];

function getIncentiveAndAccessibility(baseAsset: string) {
  let incentivesAndAccess: Array<[number, number]> = [];

  for (const asset of Assets) {
    if (asset != baseAsset) {
      // Every conversion of the baseAsset for USDT in a SingleTokenConverter with a baseAsset != USDT is enabled only for converters,
      // because the RiskFundConverter of the USDTPrimeConverter should be able to cover those conversions
      if (asset === BaseAssets[0]) {
        if(baseAsset != BaseAssets[5]) {
          incentivesAndAccess.push([0, 2]); // ONLY_FOR_CONVERTERS
        } else {
          incentivesAndAccess.push([0, 1]); // ALL for XVSVaultConverter
        }
        // Exculde only when tokenIn and tokenOut are same
      } else {
        incentivesAndAccess.push([1e14, 1]); // ALL
      }
    }
  }
  return incentivesAndAccess;
}

export const incentiveAndAccessibilityForRiskFundConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(BaseAssets[0]);
export const incentiveAndAccessibilityForUSDTPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(BaseAssets[1]);
export const incentiveAndAccessibilityForUSDCPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(BaseAssets[2]);
export const incentiveAndAccessibilityForBTCBPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(BaseAssets[3]);
export const incentiveAndAccessibilityForETHPrimeConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(BaseAssets[4]);
export const incentiveAndAccessibilityForXVSVaultConverter: IncentiveAndAccessibility[] = getIncentiveAndAccessibility(BaseAssets[5]);

