import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { PoolDef } from "../../../vips/vip-634/phase4Markets";
import { CoreEmodeEntry, marketsToZero } from "../../../vips/vip-645/deprecationStep2";

// Isolated-pool Comptroller: markets(address) → (isListed, collateralFactor, liquidationThreshold).
const ISOLATED_ABI = [
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
];

// BNB Core diamond: poolMarkets(poolId, vToken) → (isListed, collateralFactor, _, liquidationThreshold, isBorrowAllowed).
const CORE_ABI = [
  "function poolMarkets(uint96, address) view returns (bool isListed, uint256 collateralFactorMantissa, uint256 unused, uint256 liquidationThresholdMantissa, bool isBorrowAllowed)",
];

const isCorePool = (pool: PoolDef): boolean => pool.legacy === true;

// Reads (collateralFactor, liquidationThreshold) for a market. BNB Core markets are read from
// the base pool (poolId 0); every other pool is read through the isolated-pool getter.
const readRisk = async (comptroller: Contract, pool: PoolDef, vToken: string) => {
  if (isCorePool(pool)) {
    const d = await comptroller.poolMarkets(0, vToken);
    return { cf: d.collateralFactorMantissa, lt: d.liquidationThresholdMantissa };
  }
  const d = await comptroller.markets(vToken);
  return { cf: d.collateralFactorMantissa, lt: d.liquidationThresholdMantissa };
};

const comptrollerFor = (pool: PoolDef) =>
  new Contract(pool.comptroller, isCorePool(pool) ? CORE_ABI : ISOLATED_ABI, ethers.provider);

// Asserts the pre-VIP state: every in-scope market still carries a non-zero liquidation
// threshold (proving the VIP is not a no-op). The e-mode entries are checked in their own pool.
export const checkStep2PreVip = (pools: PoolDef[], emode: CoreEmodeEntry[] = []) => {
  describe("Pre-VIP behavior", () => {
    for (const pool of pools) {
      const markets = marketsToZero(pool);
      if (markets.length === 0) continue;
      describe(pool.label, () => {
        const comptroller = comptrollerFor(pool);
        it("liquidation threshold still non-zero (> 0)", async () => {
          for (const m of markets) {
            const { lt } = await readRisk(comptroller, pool, m.vToken);
            expect(lt.gt(0), m.symbol).to.be.true;
          }
        });
      });
    }

    if (emode.length > 0) {
      describe("BNB Core pool (e-mode)", () => {
        const comptroller = new Contract(pools.find(isCorePool)!.comptroller, CORE_ABI, ethers.provider);
        it("e-mode liquidation threshold still non-zero (> 0)", async () => {
          for (const e of emode) {
            const d = await comptroller.poolMarkets(e.poolId, e.vToken);
            expect(d.liquidationThresholdMantissa.gt(0), `${e.symbol} (pool ${e.poolId})`).to.be.true;
          }
        });
      });
    }
  });
};

// Asserts the Phase-4 end state: every in-scope market ends with a zero collateral factor
// and a zero liquidation threshold, in both the base pool and any e-mode pool.
export const checkStep2PostVip = (pools: PoolDef[], emode: CoreEmodeEntry[] = []) => {
  describe("Post-VIP behavior", () => {
    for (const pool of pools) {
      const markets = marketsToZero(pool);
      if (markets.length === 0) continue;
      describe(pool.label, () => {
        const comptroller = comptrollerFor(pool);
        it("collateral factor and liquidation threshold set to 0", async () => {
          for (const m of markets) {
            const { cf, lt } = await readRisk(comptroller, pool, m.vToken);
            expect(cf.toString(), `${m.symbol} collateral factor`).to.equal("0");
            expect(lt.toString(), `${m.symbol} liquidation threshold`).to.equal("0");
          }
        });
      });
    }

    if (emode.length > 0) {
      describe("BNB Core pool (e-mode)", () => {
        const comptroller = new Contract(pools.find(isCorePool)!.comptroller, CORE_ABI, ethers.provider);
        it("e-mode collateral factor and liquidation threshold set to 0", async () => {
          for (const e of emode) {
            const d = await comptroller.poolMarkets(e.poolId, e.vToken);
            expect(d.collateralFactorMantissa.toString(), `${e.symbol} (pool ${e.poolId}) cf`).to.equal("0");
            expect(d.liquidationThresholdMantissa.toString(), `${e.symbol} (pool ${e.poolId}) lt`).to.equal("0");
          }
        });
      });
    }
  });
};
