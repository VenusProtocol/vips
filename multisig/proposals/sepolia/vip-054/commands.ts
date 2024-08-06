import { Assets } from "./addresses";

type IncentiveAndAccessibility = [number, number];
const incentiveAndAccessibility: IncentiveAndAccessibility = [1e14, 1]; // ALL

export const incentiveAndAccessibilityForConverters: IncentiveAndAccessibility[] = [];

for (let i = 0; i < Assets.length - 1; i++) {
  incentiveAndAccessibilityForConverters.push(incentiveAndAccessibility);
}
