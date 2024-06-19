import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

export const MANTISSA_ONE = parseUnits("1", 18);

export interface AccountSnapshotUsd {
  supplyUsd: BigNumber;
  borrowsUsd: BigNumber;
  liquidity: BigNumber;
  shortfall: BigNumber;
}

export interface MarketDebtData {
  market: Market;
  debts: Record<string, Value>;
  totalDebt: Value;
}

export class Market {
  public readonly address: string;
  public readonly exchangeRate: BigNumber;
  public readonly symbol: string;
  public readonly underlying: string;
  public readonly underlyingSymbol: string;
  public readonly underlyingDecimals: number;
  public readonly underlyingPrice: BigNumber;

  constructor({
    address,
    exchangeRate,
    symbol,
    underlying,
    underlyingSymbol,
    underlyingDecimals,
    underlyingPrice,
  }: {
    address: string;
    exchangeRate: BigNumber;
    symbol: string;
    underlying: string;
    underlyingSymbol: string;
    underlyingDecimals: number;
    underlyingPrice: BigNumber;
  }) {
    this.address = address;
    this.exchangeRate = exchangeRate;
    this.symbol = symbol;
    this.underlying = underlying;
    this.underlyingSymbol = underlyingSymbol;
    this.underlyingDecimals = underlyingDecimals;
    this.underlyingPrice = underlyingPrice;
  }

  marketDebtDataFromBorrowBalances(borrowBalances: [string, BigNumber][]): MarketDebtData {
    const debts = Object.fromEntries(
      borrowBalances
        .filter(([, debt]: [string, BigNumber]) => debt.gt(0))
        .map(([account, debt]: [string, BigNumber]) => [account, this.valueFromUnderlyingAmount(debt)]),
    );
    const totalDebtInUnderlying = Object.values(debts).reduce(
      (acc: BigNumber, x: Value) => acc.add(x.underlyingAmount),
      BigNumber.from(0),
    );
    const totalDebt = this.valueFromUnderlyingAmount(totalDebtInUnderlying);
    return {
      market: this,
      debts,
      totalDebt,
    };
  }

  valueFromUnderlyingAmount(underlyingAmount: BigNumber): Value {
    return new UnderlyingValue(underlyingAmount, this);
  }

  valueFromVTokenAmount(vTokenAmount: BigNumber): Value {
    return new VTokenValue(vTokenAmount, this);
  }
}

export interface Value {
  readonly market: Market;
  readonly underlyingAmount: BigNumber;
  readonly vTokenAmount: BigNumber;
  readonly usdValue: BigNumber;
}

class UnderlyingValue implements Value {
  private readonly _u: BigNumber;
  public readonly market: Market;

  constructor(underlyingAmount: BigNumber, market: Market) {
    this._u = underlyingAmount;
    this.market = market;
  }

  get underlyingAmount() {
    return this._u;
  }

  get vTokenAmount() {
    return this._u.mul(MANTISSA_ONE).div(this.market.exchangeRate);
  }

  get usdValue() {
    return this._u.mul(this.market.underlyingPrice).div(MANTISSA_ONE);
  }
}

class VTokenValue implements Value {
  private readonly _vt: BigNumber;
  public readonly market: Market;

  constructor(vTokenAmount: BigNumber, market: Market) {
    this._vt = vTokenAmount;
    this.market = market;
  }

  get underlyingAmount() {
    return this._vt.mul(this.market.exchangeRate).div(MANTISSA_ONE);
  }

  get vTokenAmount() {
    return this._vt;
  }

  get usdValue() {
    return this.underlyingAmount.mul(this.market.underlyingPrice).div(MANTISSA_ONE);
  }
}
