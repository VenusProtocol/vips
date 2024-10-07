import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import LEGACY_POOL_COMPTROLLER_ABI from "../abi/comptroller.json";
import IL_COMPTROLLER_ABI from "../abi/il_comptroller.json";
import VTOKEN_ABI from "../abi/il_vToken.json";
import { TokenSpec } from "./checkVToken";

export type RiskParameters = {
  borrowCap: string | BigNumber;
  supplyCap: string | BigNumber;
  collateralFactor: string | BigNumber;
  liquidationThreshold: string | BigNumber;
  reserveFactor: string | BigNumber;
  protocolSeizeShare: string | BigNumber;
};

export type LegacyPoolRiskParameters = {
  borrowCap: string | BigNumber;
  supplyCap: string | BigNumber;
  collateralFactor: string | BigNumber;
  reserveFactor: string | BigNumber;
};

const parseIfNeeded = (value: string | BigNumber, decimals: number) => {
  if (typeof value === "string") {
    return parseUnits(value, decimals);
  }
  return value;
};

const formatIfNeeded = (value: string | BigNumber, decimals: number) => {
  if (typeof value === "string") {
    return value;
  }
  return formatUnits(value, decimals);
};

const checkCommonRiskParameters = (
  vTokenAddress: string,
  spec: { underlying: TokenSpec; comptroller?: string; symbol?: string },
  riskParameters: RiskParameters | LegacyPoolRiskParameters,
) => {
  const vToken = new ethers.Contract(vTokenAddress, VTOKEN_ABI, ethers.provider);
  let comptroller: Contract;

  before(async () => {
    const comptrollerAddress = spec.comptroller ?? (await vToken.comptroller());
    comptroller = new ethers.Contract(comptrollerAddress, LEGACY_POOL_COMPTROLLER_ABI, ethers.provider);
  });

  it(`should set ${spec.symbol} reserve factor to ${formatIfNeeded(riskParameters.reserveFactor, 18)}`, async () => {
    expect(await vToken.reserveFactorMantissa()).to.equal(parseIfNeeded(riskParameters.reserveFactor, 18));
  });

  it(`should set ${spec.symbol} collateral factor to ${formatIfNeeded(
    riskParameters.collateralFactor,
    18,
  )}`, async () => {
    const market = await comptroller.markets(vToken.address);
    expect(market.collateralFactorMantissa).to.equal(parseIfNeeded(riskParameters.collateralFactor, 18));
  });

  it(`should set ${spec.symbol} supply cap to ${formatIfNeeded(
    riskParameters.supplyCap,
    spec.underlying.decimals,
  )}`, async () => {
    expect(await comptroller.supplyCaps(vToken.address)).to.equal(
      parseIfNeeded(riskParameters.supplyCap, spec.underlying.decimals),
    );
  });

  it(`should set ${spec.symbol} borrow cap to ${formatIfNeeded(
    riskParameters.borrowCap,
    spec.underlying.decimals,
  )}`, async () => {
    expect(await comptroller.borrowCaps(vToken.address)).to.equal(
      parseIfNeeded(riskParameters.borrowCap, spec.underlying.decimals),
    );
  });
};

const checkILRiskParameters = (
  vTokenAddress: string,
  spec: { underlying: TokenSpec; comptroller?: string; symbol?: string },
  riskParameters: RiskParameters,
) => {
  const vToken = new ethers.Contract(vTokenAddress, VTOKEN_ABI, ethers.provider);
  let comptroller: Contract;

  before(async () => {
    const comptrollerAddress = spec.comptroller ?? (await vToken.comptroller());
    comptroller = new ethers.Contract(comptrollerAddress, IL_COMPTROLLER_ABI, ethers.provider);
  });

  it(`should set ${spec.symbol} liquidation threshold to ${formatIfNeeded(
    riskParameters.liquidationThreshold,
    18,
  )}`, async () => {
    const market = await comptroller.markets(vToken.address);
    expect(market.liquidationThresholdMantissa).to.equal(parseIfNeeded(riskParameters.liquidationThreshold, 18));
  });

  it(`should set ${spec.symbol} protocol seize share to ${riskParameters.protocolSeizeShare}`, async () => {
    expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseIfNeeded(riskParameters.protocolSeizeShare, 18));
  });
};

export function checkRiskParameters(
  vTokenAddress: string,
  spec: { underlying: TokenSpec; comptroller?: string; symbol?: string; isLegacyPool?: boolean },
  riskParameters: RiskParameters | LegacyPoolRiskParameters,
) {
  describe(`${spec.symbol ?? vTokenAddress} risk parameters`, () => {
    checkCommonRiskParameters(vTokenAddress, spec, riskParameters);

    if (!spec.isLegacyPool) {
      checkILRiskParameters(vTokenAddress, spec, riskParameters as RiskParameters);
    }
  });
}
