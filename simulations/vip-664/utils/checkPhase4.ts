import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { PUSHOUT_IRM, PoolDef, RF_FULL } from "../../../vips/vip-664/phase4Markets";

// Documented pre-VIP collateral factor on the two BNB Liquid Staked ETH markets (5%).
const CF_GAP = parseUnits("0.05", 18);

const VTOKEN_ABI = [
  "function reserveFactorMantissa() view returns (uint256)",
  "function interestRateModel() view returns (address)",
];

const COMPTROLLER_ABI = [
  "function supplyCaps(address) view returns (uint256)",
  "function borrowCaps(address) view returns (uint256)",
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
];

// Asserts the pre-VIP state for the given pools, proving the VIP is not a no-op.
// Every assertion mirrors exactly one action emitted by generatePoolCommands, and a
// test is only registered when that action touches at least one market in the pool —
// so no check asserts state for a market the VIP does not modify, and an empty filter
// never shows up as a vacuously-passing test:
//   - reserve factor below 100% on markets being raised (skips already-100% markets)
//   - interest rate model not yet the push-out IRM (skips PLANET / stkBNB)
//   - leftover supply / borrow cap gaps still open (> 0)
//   - the two collateral-factor gaps still read 5%
export const checkPhase4PreVip = (pools: PoolDef[]) => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", () => {
    for (const pool of pools) {
      describe(pool.label, () => {
        const comptroller = new Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        const rfMarkets = pool.markets.filter(m => !m.rfAlready100);
        const irmMarkets = pool.markets.filter(m => !m.skipIrm);
        const supplyGap = pool.markets.filter(m => m.supplyCapGap);
        const borrowGap = pool.markets.filter(m => m.borrowCapGap);
        const cfGap = pool.markets.filter(m => m.cfGapLiqThreshold !== undefined);

        if (rfMarkets.length > 0) {
          it("reserve factor below 100% on markets being raised", async () => {
            for (const m of rfMarkets) {
              const vToken = new Contract(m.vToken, VTOKEN_ABI, provider);
              expect((await vToken.reserveFactorMantissa()).lt(RF_FULL), m.symbol).to.be.true;
            }
          });
        }

        if (irmMarkets.length > 0) {
          it("interest rate model is not yet the push-out IRM", async () => {
            const pushout = PUSHOUT_IRM[pool.irmKey].toLowerCase();
            for (const m of irmMarkets) {
              const vToken = new Contract(m.vToken, VTOKEN_ABI, provider);
              expect((await vToken.interestRateModel()).toLowerCase(), m.symbol).to.not.equal(pushout);
            }
          });
        }

        if (supplyGap.length > 0) {
          it("outstanding supply caps still open (> 0)", async () => {
            for (const m of supplyGap) {
              expect((await comptroller.supplyCaps(m.vToken)).gt(0), m.symbol).to.be.true;
            }
          });
        }

        if (borrowGap.length > 0) {
          it("outstanding borrow caps still open (> 0)", async () => {
            for (const m of borrowGap) {
              expect((await comptroller.borrowCaps(m.vToken)).gt(0), m.symbol).to.be.true;
            }
          });
        }

        if (cfGap.length > 0) {
          it("collateral-factor gaps still read 5% (liquidation threshold matches)", async () => {
            for (const m of cfGap) {
              const data = await comptroller.markets(m.vToken);
              expect(data.collateralFactorMantissa.toString(), m.symbol).to.equal(CF_GAP.toString());
              expect(data.liquidationThresholdMantissa.toString(), m.symbol).to.equal(m.cfGapLiqThreshold);
            }
          });
        }
      });
    }
  });
};

// Asserts the Phase-4 end state for the given pools. Every assertion mirrors exactly
// one action emitted by generatePoolCommands and is only registered when that action
// touches at least one market in the pool:
//   - reserve factor raised to 100% (skips already-100% markets)
//   - interest rate model repointed to the push-out IRM (skips PLANET / stkBNB)
//   - leftover supply / borrow cap gaps closed to 0
//   - collateral-factor gaps closed to 0 with the liquidation threshold preserved
export const checkPhase4PostVip = (pools: PoolDef[]) => {
  const provider = ethers.provider;

  describe("Post-VIP behavior", () => {
    for (const pool of pools) {
      describe(pool.label, () => {
        const comptroller = new Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        const rfMarkets = pool.markets.filter(m => !m.rfAlready100);
        const irmMarkets = pool.markets.filter(m => !m.skipIrm);
        const supplyGap = pool.markets.filter(m => m.supplyCapGap);
        const borrowGap = pool.markets.filter(m => m.borrowCapGap);
        const cfGap = pool.markets.filter(m => m.cfGapLiqThreshold !== undefined);

        if (rfMarkets.length > 0) {
          it("reserve factor raised to 100%", async () => {
            for (const m of rfMarkets) {
              const vToken = new Contract(m.vToken, VTOKEN_ABI, provider);
              expect((await vToken.reserveFactorMantissa()).toString(), m.symbol).to.equal(RF_FULL.toString());
            }
          });
        }

        if (irmMarkets.length > 0) {
          it("interest rate model repointed to the push-out IRM", async () => {
            const expected = PUSHOUT_IRM[pool.irmKey].toLowerCase();
            for (const m of irmMarkets) {
              const vToken = new Contract(m.vToken, VTOKEN_ABI, provider);
              expect((await vToken.interestRateModel()).toLowerCase(), m.symbol).to.equal(expected);
            }
          });
        }

        if (supplyGap.length > 0) {
          it("outstanding supply caps closed to 0", async () => {
            for (const m of supplyGap) {
              expect((await comptroller.supplyCaps(m.vToken)).toString(), m.symbol).to.equal("0");
            }
          });
        }

        if (borrowGap.length > 0) {
          it("outstanding borrow caps closed to 0", async () => {
            for (const m of borrowGap) {
              expect((await comptroller.borrowCaps(m.vToken)).toString(), m.symbol).to.equal("0");
            }
          });
        }

        if (cfGap.length > 0) {
          it("outstanding collateral factors closed to 0 (liquidation threshold preserved)", async () => {
            for (const m of cfGap) {
              const data = await comptroller.markets(m.vToken);
              expect(data.collateralFactorMantissa.toString(), m.symbol).to.equal("0");
              expect(data.liquidationThresholdMantissa.toString(), m.symbol).to.equal(m.cfGapLiqThreshold);
            }
          });
        }
      });
    }
  });
};
