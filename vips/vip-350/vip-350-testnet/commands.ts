import {
  BTCBPrimeConverterTokenOuts,
  BaseAssets,
  ETHPrimeConverterTokenOuts,
  RiskFundConverterTokenOuts,
  USDCPrimeConverterTokenOuts,
  USDTPrimeConverterTokenOuts,
  XVSVaultConverterTokenOuts,
} from "./addresses";

type IncentiveAndAccessibility = [number, number];

function getIncentiveAndAccessibility(tokenIn: string, tokenOut: string): IncentiveAndAccessibility {
  const validTokenIns = [BaseAssets[2], BaseAssets[3], BaseAssets[4], BaseAssets[5]];

  // Every conversion of the baseAsset for USDT in a SingleTokenConverter with a baseAsset != USDT is enabled only for converters,
  // because the RiskFundConverter of the USDTPrimeConverter should be able to cover those conversions
  if (validTokenIns.includes(tokenIn) && tokenOut === BaseAssets[0]) {
    return [1e14, 2]; // ONLY_FOR_CONVERTERS
  } else {
    return [1e14, 1]; // ALL
  }
}

export const incentiveAndAccessibilityForRiskFundConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForUSDTPrimeConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForUSDCPrimeConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForBTCBPrimeConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForETHPrimeConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForXVSVaultConverter: IncentiveAndAccessibility[] = [];

for (let i = 0; i < RiskFundConverterTokenOuts.length; i++) {
  incentiveAndAccessibilityForRiskFundConverter.push(
    getIncentiveAndAccessibility(BaseAssets[0], RiskFundConverterTokenOuts[i]),
  );
  incentiveAndAccessibilityForUSDTPrimeConverter.push(
    getIncentiveAndAccessibility(BaseAssets[1], USDTPrimeConverterTokenOuts[i]),
  );
  incentiveAndAccessibilityForUSDCPrimeConverter.push(
    getIncentiveAndAccessibility(BaseAssets[2], USDCPrimeConverterTokenOuts[i]),
  );
  incentiveAndAccessibilityForBTCBPrimeConverter.push(
    getIncentiveAndAccessibility(BaseAssets[3], BTCBPrimeConverterTokenOuts[i]),
  );
  incentiveAndAccessibilityForETHPrimeConverter.push(
    getIncentiveAndAccessibility(BaseAssets[4], ETHPrimeConverterTokenOuts[i]),
  );
  incentiveAndAccessibilityForXVSVaultConverter.push(
    getIncentiveAndAccessibility(BaseAssets[5], XVSVaultConverterTokenOuts[i]),
  );
}
