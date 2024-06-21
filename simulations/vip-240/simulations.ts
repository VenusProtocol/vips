import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { Actions, UNITROLLER, VTUSD, vip240 } from "../../vips/vip-240";
import VTOKEN_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const CHAINLINK_ORALCE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
const TUSD_FEED = "0xa3334A9762090E827413A7495AfeCE76F41dFc06";

forking(35315117, async () => {
  const provider = ethers.provider;
  let comptroller: Contract;
  let vTUSD: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
      vTUSD = new ethers.Contract(VTUSD, VTOKEN_ABI, provider);
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORALCE, TUSD, TUSD_FEED, NORMAL_TIMELOCK);
    });

    it("mint not paused", async () => {
      const mintPaused = await comptroller.actionPaused(VTUSD, Actions.MINT);
      expect(mintPaused).to.equal(false);
    });

    it("borrow not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VTUSD, Actions.BORROW);
      expect(borrowPaused).to.equal(false);
    });

    it("enter_market not paused", async () => {
      const enterMarketPaused = await comptroller.actionPaused(VTUSD, Actions.ENTER_MARKET);
      expect(enterMarketPaused).to.equal(false);
    });

    it("supply and borrow speeds is non zero", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VTUSD);
      expect(supplySpeed).to.equal("54253472222222");

      const borrowSpeed = await comptroller.venusBorrowSpeeds(VTUSD);
      expect(borrowSpeed).to.equal("54253472222222");
    });

    it("reserve factor is 25%", async () => {
      const oldReserveFactor = await vTUSD.reserveFactorMantissa();
      expect(oldReserveFactor).to.equal(parseUnits("0.25", 18));
    });

    it("collateral factor is 75%", async () => {
      const oldCollateralFactor = await comptroller.markets(VTUSD);
      expect(oldCollateralFactor.collateralFactorMantissa).to.equal(parseUnits("0.75", 18));
    });
  });

  testVip("VIP-240 Start TUSD deprecation", await vip240(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        [
          "ActionPausedMarket",
          "NewReserveFactor",
          "VenusSupplySpeedUpdated",
          "VenusSupplySpeedUpdated",
          "NewCollateralFactor",
          "Failure",
        ],
        [3, 1, 1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("mint paused", async () => {
      const mintPaused = await comptroller.actionPaused(VTUSD, Actions.MINT);
      expect(mintPaused).to.equal(true);
    });

    it("borrow paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VTUSD, Actions.BORROW);
      expect(borrowPaused).to.equal(true);
    });

    it("enter_market paused", async () => {
      const enterMarketPaused = await comptroller.actionPaused(VTUSD, Actions.ENTER_MARKET);
      expect(enterMarketPaused).to.equal(true);
    });

    it("supply and borrow speeds is zero", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VTUSD);
      expect(supplySpeed).to.equal(0);

      const borrowSpeed = await comptroller.venusBorrowSpeeds(VTUSD);
      expect(borrowSpeed).to.equal(0);
    });

    it("reserve factor is 100%", async () => {
      const newReserveFactor = await vTUSD.reserveFactorMantissa();
      expect(newReserveFactor).to.equal(parseUnits("1", 18));
    });

    it("collateral factor is 65%", async () => {
      const newCollateralFactor = await comptroller.markets(VTUSD);
      expect(newCollateralFactor.collateralFactorMantissa).to.equal(parseUnits("0.65", 18));
    });
  });
});
