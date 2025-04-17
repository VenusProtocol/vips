import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip486 from "../../vips/vip-486/bsctestnet";
import CORE_POOL_RATE_MODEL_ABI from "./abi/JumpRateModel.json";
import RATE_MODEL_ABI from "./abi/JumpRateModelV2.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import {
  RateCurvePoints,
  VTokenContractAndSymbol,
  getAllVTokens,
  getCorePoolRateCurve,
  getPoolVTokens,
  getRateCurve,
} from "./common";

const CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

forking(50558070, async () => {
  const poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.bsctestnet.POOL_REGISTRY);
  const corePoolVTokens = await getPoolVTokens(CORE_COMPTROLLER, { onlyListed: true });
  const isolatedPoolsVTokens = await getAllVTokens(poolRegistry);

  const oldCorePoolRates: Record<string, RateCurvePoints> = Object.fromEntries(
    await Promise.all(
      corePoolVTokens.map(async (vToken: VTokenContractAndSymbol) => {
        return [vToken.symbol, await getCorePoolRateCurve(vToken.contract)];
      }),
    ),
  );
  const oldILRates: Record<string, RateCurvePoints> = Object.fromEntries(
    await Promise.all(
      isolatedPoolsVTokens.map(async (vToken: VTokenContractAndSymbol) => {
        return [vToken.symbol, await getRateCurve(vToken.contract)];
      }),
    ),
  );

  testVip("VIP-486", await vip486(), {});

  describe("Interest rates after checkpoint", () => {
    describe("Core pool", () => {
      for (const vToken of corePoolVTokens) {
        const oldRateCurve = oldCorePoolRates[vToken.symbol];
        let newRateCurve: RateCurvePoints;

        before(async () => {
          newRateCurve = await getCorePoolRateCurve(vToken.contract);
        });

        describe(`${vToken.symbol} rate curve`, () => {
          it("has the same utilization points", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              expect(oldRateCurve[idx].utilizationRate).to.equal(newRateCurve[idx].utilizationRate);
            }
          });

          it("has new supply rate ≈ old supply rate / 2 at all utilizations", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              const expectedSupplyRate = oldRateCurve[idx].supplyRate.div(2);
              expect(newRateCurve[idx].supplyRate).to.be.closeTo(expectedSupplyRate, 5);
            }
          });

          it("has new borrow rate ≈ old borrow rate / 2 at all utilizations", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              const expectedBorrowRate = oldRateCurve[idx].borrowRate.div(2);
              expect(newRateCurve[idx].borrowRate).to.be.closeTo(expectedBorrowRate, 5);
            }
          });

          it("set to 21024000 blocks per year", async () => {
            const rateModelAddress = await vToken.contract.interestRateModel();
            const rateModel = await ethers.getContractAt(CORE_POOL_RATE_MODEL_ABI, rateModelAddress);
            const blocksPerYear = await Promise.any([rateModel.blocksPerYear(), rateModel.BLOCKS_PER_YEAR()]);
            expect(blocksPerYear).to.equal(21024000);
          });
        });
      }
    });

    describe("Isolated pools", () => {
      for (const vToken of isolatedPoolsVTokens) {
        const oldRateCurve = oldILRates[vToken.symbol];
        let newRateCurve: RateCurvePoints;

        before(async () => {
          newRateCurve = await getRateCurve(vToken.contract);
        });

        describe(`${vToken.symbol} rate curve`, () => {
          it("has the same utilization points", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              expect(oldRateCurve[idx].utilizationRate).to.equal(newRateCurve[idx].utilizationRate);
            }
          });

          it("has new supply rate ≈ old supply rate / 2 at all utilizations", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              const expectedSupplyRate = oldRateCurve[idx].supplyRate.div(2);
              expect(newRateCurve[idx].supplyRate).to.be.closeTo(expectedSupplyRate, 5);
            }
          });

          it("has new borrow rate ≈ old borrow rate / 2 at all utilizations", async () => {
            for (const [idx] of oldRateCurve.entries()) {
              const expectedBorrowRate = oldRateCurve[idx].borrowRate.div(2);
              expect(newRateCurve[idx].borrowRate).to.be.closeTo(expectedBorrowRate, 5);
            }
          });

          it("set to 21024000 blocks per year", async () => {
            const rateModelAddress = await vToken.contract.interestRateModel();
            const rateModel = await ethers.getContractAt(RATE_MODEL_ABI, rateModelAddress);
            expect(await rateModel.blocksOrSecondsPerYear()).to.equal(21024000);
          });
        });
      }
    });
  });
});
