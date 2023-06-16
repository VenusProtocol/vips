import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { Actions, vip128Testnet } from "../../../vips/vip-128/vip-128-testnet";
import TUSD_ABI from "./abi/IERC20UpgradableAbi.json";
import VTUSD_ABI from "./abi/VBep20Abi.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20DelegatorAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const NEW_VTUSD = "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23";
const OLD_VTUSD = "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0";
const VTOKEN_IMPLEMENTATION = "0xc01902DBf72C2cCBFebADb9B7a9e23577893D3A3"; // Original implementation
const NEW_TUSD = "0xB32171ecD878607FFc4F8FC0bCcE6852BB3149E0";
const TUSD_INITIAL_SUPPLIER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

forking(30680185, () => {
  let comptroller: ethers.Contract;
  let tusd: ethers.Contract;
  let vTusdOld: ethers.Contract;
  let vTusd: ethers.Contract;
  let oracle: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    const oracleAddress = await comptroller.oracle();
    oracle = new ethers.Contract(oracleAddress, PRICE_ORACLE_ABI, provider);
    tusd = new ethers.Contract(NEW_TUSD, TUSD_ABI, provider);
    vTusdOld = new ethers.Contract(OLD_VTUSD, VTUSD_ABI, provider);
    vTusd = new ethers.Contract(NEW_VTUSD, VTUSD_ABI, provider);
  });

  testVip("VIP-128-testnet TUSD Contract Migration", vip128Testnet(), {
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

    it("moves 10,000 vTUSD to TUSD_INITIAL_SUPPLIER", async () => {
      const tusdInitialSupplierBalance = await vTusd.balanceOf(TUSD_INITIAL_SUPPLIER);
      expect(tusdInitialSupplierBalance).to.equal(parseUnits("10000", 8));
    });

    it("has the correct oracle price", async () => {
      const price = await oracle.getUnderlyingPrice(NEW_VTUSD);
      expect(price).to.equal(parseUnits("1", 18));
    });

    it("sets the admin to governance", async () => {
      expect(await vTusd.admin()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
