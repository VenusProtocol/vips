import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import { CORE_POOL_ID, MARKETS_TO_DISABLE, vip630 } from "../../vips/vip-630/bsctestnet";
import COMPTROLLER_ABI from "../vip-587/abi/Comptroller.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 94679311;

forking(BLOCK_NUMBER, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    for (const market of MARKETS_TO_DISABLE) {
      it(`${market.symbol} should have non-zero collateral factor in Core Pool`, async () => {
        const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
        expect(data.collateralFactorMantissa).to.be.gt(0);
      });

      it(`${market.symbol} should have borrowing enabled in Core Pool`, async () => {
        const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
        expect(data.isBorrowAllowed).to.equal(true);
      });
    }
  });

  testVip("VIP-630", await vip630(), {
    callbackAfterExecution: async txResponse => {
      await expect(txResponse).to.emit(comptroller, "NewCollateralFactor");
      await expect(txResponse).to.emit(comptroller, "BorrowAllowedUpdated");
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const market of MARKETS_TO_DISABLE) {
      describe(`${market.symbol}`, () => {
        it("should have collateral factor set to 0 in Core Pool", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.collateralFactorMantissa).to.equal(0);
        });

        it("should keep liquidation threshold unchanged", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.liquidationThresholdMantissa).to.equal(market.liquidationThreshold);
        });

        it("should have borrowing disabled in Core Pool", async () => {
          const data = await comptroller.poolMarkets(CORE_POOL_ID, market.vToken);
          expect(data.isBorrowAllowed).to.equal(false);
        });
      });
    }
  });
});
