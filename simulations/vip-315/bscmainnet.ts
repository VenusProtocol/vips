import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStaleCoreAssets } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip315, {
  CF,
  COMPTROLLER,
  LT,
  stkBNB_BORROW_CAP,
  stkBNB_SUPPLY_CAP,
  vBNBx,
  vWBNB,
  vWBNB_IR,
  vWBNB_RF,
  vankrBNB,
  vslisBNB,
  vstkBNB,
} from "../../vips/vip-315/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const OLD_IR = "0x6765202c3e6d3FdD05F0b26105d0C8DF59D3efaf";

forking(39172100, async () => {
  const provider = ethers.provider;
  let vWBNBContract: Contract;
  let comptrollerContract: Contract;

  before(async () => {
    vWBNBContract = new ethers.Contract(vWBNB, VTOKEN_ABI, provider);
    comptrollerContract = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, await ethers.getSigner(NORMAL_TIMELOCK));

    await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vWBNBContract.interestRateModel();
      expect(ir).to.be.equal(OLD_IR);
    });

    it("check RF", async () => {
      const rf = await vWBNBContract.reserveFactorMantissa();
      expect(rf).to.be.equal(parseUnits("0.25", 18));
    });

    it("check CF and LT", async () => {
      const cf = await comptrollerContract.markets(vslisBNB);
      expect(cf.collateralFactorMantissa).to.be.equal(parseUnits("0.87", 18));

      const lt = await comptrollerContract.markets(vslisBNB);
      expect(lt.liquidationThresholdMantissa).to.be.equal(parseUnits("0.9", 18));

      const cf2 = await comptrollerContract.markets(vstkBNB);
      expect(cf2.collateralFactorMantissa).to.be.equal(parseUnits("0.87", 18));

      const lt2 = await comptrollerContract.markets(vstkBNB);
      expect(lt2.liquidationThresholdMantissa).to.be.equal(parseUnits("0.9", 18));

      const cf3 = await comptrollerContract.markets(vBNBx);
      expect(cf3.collateralFactorMantissa).to.be.equal(parseUnits("0.87", 18));

      const lt3 = await comptrollerContract.markets(vBNBx);
      expect(lt3.liquidationThresholdMantissa).to.be.equal(parseUnits("0.9", 18));

      const cf4 = await comptrollerContract.markets(vankrBNB);
      expect(cf4.collateralFactorMantissa).to.be.equal(parseUnits("0.87", 18));

      const lt4 = await comptrollerContract.markets(vankrBNB);
      expect(lt4.liquidationThresholdMantissa).to.be.equal(parseUnits("0.9", 18));
    });

    it("check supply and borrow cap", async () => {
      const supplyCap = await comptrollerContract.supplyCaps(vstkBNB);
      expect(supplyCap).to.be.equal(parseUnits("2500", 18));

      const borrowCap = await comptrollerContract.borrowCaps(vstkBNB);
      expect(borrowCap).to.be.equal(parseUnits("250", 18));
    });
  });

  testVip("VIP-315", vip315(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel", "NewReserveFactor"], [1, 1]);
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewLiquidationThreshold", "NewSupplyCap", "NewBorrowCap"],
        [4, 4, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vWBNBContract.interestRateModel();
      expect(ir).to.be.equal(vWBNB_IR);
    });

    it("check RF", async () => {
      const rf = await vWBNBContract.reserveFactorMantissa();
      expect(rf).to.be.equal(vWBNB_RF);
    });

    it("check CF and LT", async () => {
      const cf = await comptrollerContract.markets(vslisBNB);
      expect(cf.collateralFactorMantissa).to.be.equal(CF);

      const lt = await comptrollerContract.markets(vslisBNB);
      expect(lt.liquidationThresholdMantissa).to.be.equal(LT);

      const cf2 = await comptrollerContract.markets(vstkBNB);
      expect(cf2.collateralFactorMantissa).to.be.equal(CF);

      const lt2 = await comptrollerContract.markets(vstkBNB);
      expect(lt2.liquidationThresholdMantissa).to.be.equal(LT);

      const cf3 = await comptrollerContract.markets(vBNBx);
      expect(cf3.collateralFactorMantissa).to.be.equal(CF);

      const lt3 = await comptrollerContract.markets(vBNBx);
      expect(lt3.liquidationThresholdMantissa).to.be.equal(LT);

      const cf4 = await comptrollerContract.markets(vankrBNB);
      expect(cf4.collateralFactorMantissa).to.be.equal(CF);

      const lt4 = await comptrollerContract.markets(vankrBNB);
      expect(lt4.liquidationThresholdMantissa).to.be.equal(LT);
    });

    it("check supply and borrow cap", async () => {
      const supplyCap = await comptrollerContract.supplyCaps(vstkBNB);
      expect(supplyCap).to.be.equal(stkBNB_SUPPLY_CAP);

      const borrowCap = await comptrollerContract.borrowCaps(vstkBNB);
      expect(borrowCap).to.be.equal(stkBNB_BORROW_CAP);
    });
  });
});
