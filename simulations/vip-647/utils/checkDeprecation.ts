import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { PoolDef } from "../../../vips/vip-634/phase4Markets";
import { marketsToZero } from "../../../vips/vip-647/zeroCollateralParams";

// Isolated-pool Comptroller getter (all inline chains are isolated pools).
const COMPTROLLER_ABI = [
  "function markets(address) view returns (bool, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
];

// Pre-VIP: every in-scope market still carries a non-zero liquidation threshold (proves the VIP is not a no-op).
export const checkDeprecationPreVip = (pools: PoolDef[]) => {
  describe("Pre-VIP behavior", () => {
    for (const pool of pools) {
      const markets = marketsToZero(pool);
      if (markets.length === 0) continue;
      it(`${pool.label}: liquidation threshold still non-zero (> 0)`, async () => {
        const comptroller = new Contract(pool.comptroller, COMPTROLLER_ABI, ethers.provider);
        for (const m of markets) {
          expect((await comptroller.markets(m.vToken)).liquidationThresholdMantissa.gt(0), m.symbol).to.be.true;
        }
      });
    }
  });
};

// Post-VIP: every in-scope market ends with a zero collateral factor and liquidation threshold.
export const checkDeprecationPostVip = (pools: PoolDef[]) => {
  describe("Post-VIP behavior", () => {
    for (const pool of pools) {
      const markets = marketsToZero(pool);
      if (markets.length === 0) continue;
      it(`${pool.label}: collateral factor and liquidation threshold set to 0`, async () => {
        const comptroller = new Contract(pool.comptroller, COMPTROLLER_ABI, ethers.provider);
        for (const m of markets) {
          const d = await comptroller.markets(m.vToken);
          expect(d.collateralFactorMantissa.toString(), `${m.symbol} cf`).to.equal("0");
          expect(d.liquidationThresholdMantissa.toString(), `${m.symbol} lt`).to.equal("0");
        }
      });
    }
  });
};
