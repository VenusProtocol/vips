import { BigNumber } from "ethers";
import { MarketDebtData, Value } from "./types";
import { formatUnits } from "ethers/lib/utils";

const vTokensCode = (value: Value) => {
  const formattedVTokenAmount = formatUnits(value.vTokenAmount, 8);
  return `parseUnits("${formattedVTokenAmount}", 8)`;
}

const underlyingCode = (value: Value) => {
  const formattedAmount = formatUnits(value.underlyingAmount, value.market.underlyingDecimals);
  return `parseUnits("${formattedAmount}", ${value.market.underlyingDecimals})`;
}

const underlyingWithUsdText = (value: Value) => {
  return `${underlyingText(value)} = ${usdText(value.usdValue)}`;
}

const underlyingText = (value: Value) => {
  const formattedAmount = formatUnits(value.underlyingAmount, value.market.underlyingDecimals);
  return `${formattedAmount} ${value.market.underlyingSymbol}`;
}

const usdText = (usd: BigNumber) => {
  return `$${formatUnits(usd, 18)}`;
}

const sumEntries = <T>(vs: ReadonlyArray<T>, accessor: (entry: T) => BigNumber): BigNumber => {
  return Object.values(vs).reduce(
    (acc: BigNumber, entry: T) => acc.add(accessor(entry)),
    BigNumber.from(0)
  );
}

export class Codegen {
  printVaiDebts({ market, debts, totalDebt }: MarketDebtData): string {
    return [
      `{`,
      ...Object.entries(debts).map(([account, debt]) => {
        return `  "${account}": ${underlyingCode(debt)}, // ${usdText(debt.usdValue)}`;
      }),
      `}; // total: ${underlyingText(totalDebt)} = ${usdText(totalDebt.usdValue)}`,
    ].join("\n");
  }

  printAnnotatedDebts(marketDebtData: MarketDebtData[]): string {
    const printSingleMarketDebts = ({ market, debts, totalDebt }: MarketDebtData): string[] => {
      return [
        `  "${market.symbol}": {`,
        ...Object.entries(debts).map(([account, debt]) => {
          return `    "${account}": ${underlyingCode(debt)}, // ${usdText(debt.usdValue)}`;
        }),
        `  }, // total: ${underlyingText(totalDebt)} = ${usdText(totalDebt.usdValue)}`,
        "",
      ];
    }
    const totalDebtUsd = sumEntries(marketDebtData, (entry) => entry.totalDebt.usdValue);
    return [
      `{`,
      ...marketDebtData.flatMap(printSingleMarketDebts),
      `} // total across all markets: ${usdText(totalDebtUsd)}`,
      "",
    ].join("\n");
  }
  
  printVTokenAmounts(vTokenAmounts: Record<string, Value>): string {
    const totaAmountUsd = sumEntries(Object.values(vTokenAmounts), (value) => value.usdValue);
    return [
      "{",
      ...Object.entries(vTokenAmounts).map(
        ([symbol, value]) => `  "${symbol}": ${vTokensCode(value)}, // ${underlyingWithUsdText(value)}`
      ),
      `} // total: ${usdText(totaAmountUsd)}`,
      "",
    ].join("\n");
  }

  printUnderlyingAmounts(underlyingAmounts: Record<string, Value>): string {
    const totaAmountUsd = sumEntries(Object.values(underlyingAmounts), (value) => value.usdValue);
    return [
      "{",
      ...Object.entries(underlyingAmounts).map(
        ([symbol, value]) => `  "${symbol}": ${underlyingCode(value)}, // ${usdText(value.usdValue)}`
      ),
      `} // total: ${usdText(totaAmountUsd)}`,
      "",
    ].join("\n");
  }
}
