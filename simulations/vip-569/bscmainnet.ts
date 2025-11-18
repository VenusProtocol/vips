import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip569, { Actions, MATIC, POL_CHAINLINK_FEED, vBETH, vMATIC } from "../../vips/vip-569/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const provider = ethers.provider;

const { bscmainnet } = NETWORK_ADDRESSES;

forking(68602103, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    chainlinkOracle = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Check vBETH market CF and LT is not zero", async () => {
      const market = await comptroller.markets(vBETH);
      expect(market.collateralFactorMantissa).to.be.not.equal(0);
      expect(market.liquidationThresholdMantissa).to.be.not.equal(0);
    });

    it("Check vMATIC market CF and LT is non-zero", async () => {
      const market = await comptroller.markets(vMATIC);
      expect(market.collateralFactorMantissa).to.be.not.equal(0);
      expect(market.liquidationThresholdMantissa).to.be.not.equal(0);
    });

    it("Check vBETH market actions are paused or not", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await comptroller.actionPaused(vBETH, actionId);
        if (actionId == Actions.BORROW) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should not be paused`).to.be.false;
        }
      }
    });

    it("Check vMATIC market actions are paused or not", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await comptroller.actionPaused(vMATIC, actionId);
        expect(isPaused, `${actionName} should not be paused`).to.be.false;
      }
    });

    it("check borrow and supply caps for vMATIC", async () => {
      const borrowCap = await comptroller.borrowCaps(vMATIC);
      const supplyCap = await comptroller.supplyCaps(vMATIC);
      expect(borrowCap).to.be.not.equal(0);
      expect(supplyCap).to.be.not.equal(0);
    });

    it("check MATIC price", async () => {
      const price = await resilientOracle.getPrice(MATIC);
      expect(price).to.be.equal(ethers.utils.parseUnits("0.14469075", 18)); // 0.14469075 USD
    });

    it("check MATIC oracle config", async () => {
      const config = await chainlinkOracle.tokenConfigs(MATIC);
      expect(config.feed).to.be.equal("0x081195B56674bb87b2B92F6D58F7c5f449aCE19d");
    });
  });

  testVip("VIP-569 bscmainnet", await vip569(7 * 24 * 60 * 60), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewSupplyCap", "NewBorrowCap", "ActionPausedMarket"],
        [1, 1, 3],
      );

      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check vBETH market CF and LT is zero", async () => {
      const market = await comptroller.markets(vBETH);
      expect(market.collateralFactorMantissa).to.be.equal(0);
      expect(market.liquidationThresholdMantissa).to.be.equal(0);
    });

    it("Check vMATIC market CF and LT is zero", async () => {
      const market = await comptroller.markets(vMATIC);
      expect(market.collateralFactorMantissa).to.be.equal(0);
      expect(market.liquidationThresholdMantissa).to.be.equal(0);
    });

    it("Check vBETH market actions are paused or not", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await comptroller.actionPaused(vBETH, actionId);
        if (actionId == Actions.BORROW || actionId == Actions.MINT) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should not be paused`).to.be.false;
        }
      }
    });

    it("Check vMATIC market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await comptroller.actionPaused(vMATIC, actionId);
        if (actionId == Actions.BORROW || actionId == Actions.MINT) {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        } else {
          expect(isPaused, `${actionName} should not be paused`).to.be.false;
        }
      }
    });

    it("check borrow and supply caps for vMATIC", async () => {
      const borrowCap = await comptroller.borrowCaps(vMATIC);
      const supplyCap = await comptroller.supplyCaps(vMATIC);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.equal(0);
    });

    it("check MATIC price", async () => {
      const price = await resilientOracle.getPrice(MATIC);
      expect(price).to.be.equal(ethers.utils.parseUnits("0.14469075", 18)); // 0.14469075 USD
    });

    it("check MATIC oracle config", async () => {
      const config = await chainlinkOracle.tokenConfigs(MATIC);
      expect(config.feed).to.be.equal(POL_CHAINLINK_FEED);
    });
  });
});
