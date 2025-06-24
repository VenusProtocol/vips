import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import vip520 from "../../vips/vip-520/bsctestnet-addendum";
import CORE_POOL_RATE_MODEL_ABI from "./abi/JumpRateModel.json";
import { RateCurvePoints, VTokenContractAndSymbol, getCorePoolRateCurve, getVTokenContractAndSymbol } from "./common";

const USDF_VTOKEN = "0x140d5Da2cE9fb9A8725cabdDB2Fe8ea831342C78";

forking(55902730, async () => {
  const corePoolVTokens = [await getVTokenContractAndSymbol(USDF_VTOKEN)];

  const oldCorePoolRates: Record<string, RateCurvePoints> = Object.fromEntries(
    await Promise.all(
      corePoolVTokens.map(async (vToken: VTokenContractAndSymbol) => {
        return [vToken.symbol, await getCorePoolRateCurve(vToken.contract)];
      }),
    ),
  );

  testVip("VIP-520", await vip520(), {});

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

          it("set to 42048000 blocks per year", async () => {
            const rateModelAddress = await vToken.contract.interestRateModel();
            const rateModel = await ethers.getContractAt(CORE_POOL_RATE_MODEL_ABI, rateModelAddress);
            const blocksPerYear = await Promise.any([rateModel.blocksPerYear(), rateModel.BLOCKS_PER_YEAR()]);
            expect(blocksPerYear).to.equal(42048000);
          });
        });
      }
    });
  });
});
