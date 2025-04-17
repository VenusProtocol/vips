import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip483 from "../../vips/vip-483/bsctestnet";
import RATE_MODEL_ABI from "./abi/JumpRateModelV2.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import { RateCurvePoints, VTokenContractAndSymbol, getAllVTokens, getRateCurve } from "./common";

forking(50310901, async () => {
  const poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.bsctestnet.POOL_REGISTRY);
  const allVTokens = await getAllVTokens(poolRegistry);

  const oldRates: Record<string, RateCurvePoints> = Object.fromEntries(
    await Promise.all(
      allVTokens.map(async (vToken: VTokenContractAndSymbol) => {
        return [vToken.symbol, await getRateCurve(vToken.contract)];
      }),
    ),
  );

  testVip("VIP-483", await vip483(), {});

  describe("Interest rates after checkpoint", () => {
    for (const vToken of allVTokens) {
      const oldRateCurve = oldRates[vToken.symbol];
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
