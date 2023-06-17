import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { Actions, vip129 } from "../../../vips/vip-129/vip-129";
import TUSD_ABI from "./abi/IERC20UpgradableAbi.json";
import VTUSD_ABI from "./abi/VBep20Abi.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20DelegatorAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const OLD_VTUSD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VTOKEN_IMPLEMENTATION = "0x13f816511384D3534783241ddb5751c4b7a7e148"; // Original implementation
const NEW_TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
const OLD_TUSD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const ORACLE_FEED = "0xa3334A9762090E827413A7495AfeCE76F41dFc06";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTOKEN_RECEIVER = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

forking(29178963, () => {
  let comptroller: ethers.Contract;
  let tusd: ethers.Contract;
  let vTusdOld: ethers.Contract;
  let vTusd: ethers.Contract;
  let oracle: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    oracle = new ethers.Contract(CHAINLINK_ORACLE, PRICE_ORACLE_ABI, provider);
    tusd = new ethers.Contract(NEW_TUSD, TUSD_ABI, provider);
    vTusdOld = new ethers.Contract(OLD_VTUSD, VTUSD_ABI, provider);
    vTusd = new ethers.Contract(NEW_VTUSD, VTUSD_ABI, provider);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, OLD_TUSD, ORACLE_FEED, NORMAL_TIMELOCK);
  });

  testVip("VIP-129 TUSD Contract Migration", vip129(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VBEP20_DELEGATOR_ABI],
        [
          "ActionPausedMarket",
          "NewImplementation",
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "VenusSupplySpeedUpdated",
          "VenusBorrowSpeedUpdated",
          "NewCollateralFactor",
          "NewReserveFactor",
        ],
        [3, 2, 1, 1, 1, 2, 2, 2, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it('sets TUSDOLD name to "Venus TUSDOLD"', async () => {
      expect(await vTusdOld.name()).to.equal("Venus TUSDOLD");
    });

    it('sets TUSDOLD symbol to "vTUSDOLD"', async () => {
      expect(await vTusdOld.symbol()).to.equal("vTUSDOLD");
    });

    it("restores TUSDOLD implementation to the original one", async () => {
      const vTusdOldDelegator = new ethers.Contract(OLD_VTUSD, VBEP20_DELEGATOR_ABI, provider);
      const impl = await vTusdOldDelegator.implementation();
      expect(impl).to.equal(VTOKEN_IMPLEMENTATION);
    });

    it("pauses TUSDOLD minting", async () => {
      const mintingPaused = await comptroller.actionPaused(OLD_VTUSD, Actions.MINT);
      expect(mintingPaused).to.equal(true);
    });

    it("pauses TUSDOLD borrowing", async () => {
      const borrowingPaused = await comptroller.actionPaused(OLD_VTUSD, Actions.BORROW);
      expect(borrowingPaused).to.equal(true);
    });

    it("pauses entering TUSDOLD market", async () => {
      const enteringMarketPaused = await comptroller.actionPaused(OLD_VTUSD, Actions.ENTER_MARKETS);
      expect(enteringMarketPaused).to.equal(true);
    });

    it("sets TUSDOLD reserve factor to 100%", async () => {
      const newReserveFactor = await vTusdOld.reserveFactorMantissa();
      expect(newReserveFactor).to.equal(parseUnits("1.0", 18));
    });

    it("adds a new TUSD market", async () => {
      const market = await comptroller.markets(NEW_VTUSD);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("checks TUSD reserve factor to 25%", async () => {
      const reserveFactor = await vTusd.reserveFactorMantissa();
      expect(reserveFactor).to.equal(parseUnits("0.25", 18));
    });

    it("sets the supply cap to 1,000,000 TUSD", async () => {
      const newCap = await comptroller.supplyCaps(NEW_VTUSD);
      expect(newCap).to.equal(parseUnits("1000000", 18));
    });

    it("sets the borrow cap to 600,000 TUSD", async () => {
      const newCap = await comptroller.borrowCaps(NEW_VTUSD);
      expect(newCap).to.equal(parseUnits("600000", 18));
    });

    it("sets the supply and borrow speeds to 217013888888889", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(NEW_VTUSD);
      const borrowSpeed = await comptroller.venusBorrowSpeeds(NEW_VTUSD);
      expect(supplySpeed).to.equal("217013888888889");
      expect(borrowSpeed).to.equal("217013888888889");
    });

    it("does not leave TUSD on the balance of the governance", async () => {
      const timelockBalance = await tusd.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("does not leave vTUSD on the balance of the governance", async () => {
      const timelockBalance = await vTusd.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("moves 10,000 vTUSD to VTOKEN_RECEIVER", async () => {
      const vTokenReceiverBalance = await vTusd.balanceOf(VTOKEN_RECEIVER);
      expect(vTokenReceiverBalance).to.equal(parseUnits("10000", 8));
    });

    it("has the correct oracle price", async () => {
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, NEW_TUSD, ORACLE_FEED, NORMAL_TIMELOCK);
      const priceOld = await oracle.getUnderlyingPrice(OLD_VTUSD);
      const priceNew = await oracle.getUnderlyingPrice(NEW_VTUSD);
      expect(priceNew).to.equal(priceOld);
    });

    it("sets the admin to governance", async () => {
      expect(await vTusd.admin()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
