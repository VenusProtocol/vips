import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip564, { Actions, vPT_USDe_30OCT2025 } from "../../vips/vip-564/bsctestnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const provider = ethers.provider;

const { bsctestnet } = NETWORK_ADDRESSES;

forking(71412509, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Check vPT_USDe_30OCT2025 market CF and LT is zero", async () => {
      const market = await comptroller.markets(vPT_USDe_30OCT2025);
      expect(market.collateralFactorMantissa).to.be.equal(0);
      expect(market.liquidationThresholdMantissa).to.be.equal(0);
    });

    it("Check vPT_USDe_30OCT2025 market actions are paused or not", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await comptroller.actionPaused(vPT_USDe_30OCT2025, actionId);
        if (actionId === 2) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should not be paused`).to.be.false;
        }
      }
    });

    it("check borrow and supply caps for vPT_USDe_30OCT2025", async () => {
      const borrowCap = await comptroller.borrowCaps(vPT_USDe_30OCT2025);
      const supplyCap = await comptroller.supplyCaps(vPT_USDe_30OCT2025);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.not.equal(0);
    });

    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market is listed", async () => {
      const market = await comptroller.markets(vPT_USDe_30OCT2025);
      expect(market.isListed).to.be.true;
    });
  });

  testVip("VIP-564 bscmainnet", await vip564(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewSupplyCap", "MarketUnlisted", "ActionPausedMarket"],
        [1, 1, 8],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check vPT_USDe_30OCT2025 market CF and LT is zero", async () => {
      const market = await comptroller.markets(vPT_USDe_30OCT2025);
      expect(market.collateralFactorMantissa).equal(0);
      expect(market.liquidationThresholdMantissa).to.be.equal(0);
    });

    it("Check vPT_USDe_30OCT2025 market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await comptroller.actionPaused(vPT_USDe_30OCT2025, actionId);
        expect(isPaused, `${actionName} should be paused`).to.be.true;
      }
    });

    it("check borrow and supply caps for vPT_USDe_30OCT2025", async () => {
      const borrowCap = await comptroller.borrowCaps(vPT_USDe_30OCT2025);
      const supplyCap = await comptroller.supplyCaps(vPT_USDe_30OCT2025);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.equal(0);
    });

    it("Check vPT_USDe_30OCT2025 market is listed", async () => {
      const market = await comptroller.markets(vPT_USDe_30OCT2025);
      expect(market.isListed).to.be.false;
    });
  });
});
