import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ETH_BORROW_CAP,
  ETH_SUPPLY_CAP,
  liquidStakedETH_Comptroller,
  vETH_LiquidStakedETH,
  vip533,
  vweETH_LiquidStakedETH,
  vwstETH_LiquidStakedETH,
  weETH_BORROW_CAP,
  weETH_CF,
  weETH_LIQUIDATION_THRESHOLD,
  weETH_SUPPLY_CAP,
  wstETH_BORROW_CAP,
  wstETH_CF,
  wstETH_LIQUIDATION_THRESHOLD,
  wstETH_SUPPLY_CAP,
} from "../../vips/vip-533/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const OLD_vETH_SUPPLY_CAP = parseUnits("3600", 18);
const OLD_vETH_BORROW_CAP = parseUnits("3250", 18);

const weETH = "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A";
const OLD_weETH_SUPPLY_CAP = parseUnits("120", 18);
const OLD_weETH_BORROW_CAP = parseUnits("60", 18);
const OLD_weETH_COLLATERAL_FACTOR = parseUnits("0", 18);

const wstETH = "0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C";
const OLD_wstETH_SUPPLY_CAP = parseUnits("3200", 18);
const OLD_wstETH_BORROW_CAP = parseUnits("320", 18);
const OLD_wstETH_COLLATERAL_FACTOR = parseUnits("0", 18);

forking(54799658, async () => {
  const provider = ethers.provider;
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(liquidStakedETH_Comptroller, COMPTROLLER_ABI, provider);

    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
      ETH,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
    );
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
      weETH,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
    );
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
      wstETH,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
    );
  });

  describe("Pre-VIP behaviour", async () => {
    it("check initial supply caps", async () => {
      const ethSupplyCap = await comptroller.supplyCaps(vETH_LiquidStakedETH);
      expect(ethSupplyCap).to.equals(OLD_vETH_SUPPLY_CAP);

      const weETHSupplyCap = await comptroller.supplyCaps(vweETH_LiquidStakedETH);
      expect(weETHSupplyCap).to.equals(OLD_weETH_SUPPLY_CAP);

      const wstETHSupplyCap = await comptroller.supplyCaps(vwstETH_LiquidStakedETH);
      expect(wstETHSupplyCap).to.equals(OLD_wstETH_SUPPLY_CAP);
    });

    it("check initial borrow caps", async () => {
      const ethBorrowCap = await comptroller.borrowCaps(vETH_LiquidStakedETH);
      expect(ethBorrowCap).to.equals(OLD_vETH_BORROW_CAP);

      const weETHBorrowCap = await comptroller.borrowCaps(vweETH_LiquidStakedETH);
      expect(weETHBorrowCap).to.equals(OLD_weETH_BORROW_CAP);

      const wstETHBorrowCap = await comptroller.borrowCaps(vwstETH_LiquidStakedETH);
      expect(wstETHBorrowCap).to.equals(OLD_wstETH_BORROW_CAP);
    });

    it("check initial collateral factors", async () => {
      const weETHMarket = await comptroller.markets(vweETH_LiquidStakedETH);
      expect(weETHMarket.isListed).to.be.true;
      expect(weETHMarket.collateralFactorMantissa).to.equals(OLD_weETH_COLLATERAL_FACTOR);
      expect(weETHMarket.liquidationThresholdMantissa).to.equals(weETH_LIQUIDATION_THRESHOLD);

      const wstETHMarket = await comptroller.markets(vwstETH_LiquidStakedETH);
      expect(wstETHMarket.isListed).to.be.true;
      expect(wstETHMarket.collateralFactorMantissa).to.equals(OLD_wstETH_COLLATERAL_FACTOR);
      expect(wstETHMarket.liquidationThresholdMantissa).to.equals(wstETH_LIQUIDATION_THRESHOLD);
    });
  });

  testVip("vip-532", await vip533(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewSupplyCap", "NewBorrowCap", "NewCollateralFactor", "NewLiquidationThreshold"],
        [3, 3, 2, 0],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check updated supply caps", async () => {
      const ethSupplyCap = await comptroller.supplyCaps(vETH_LiquidStakedETH);
      expect(ethSupplyCap).to.equals(ETH_SUPPLY_CAP);

      const weETHSupplyCap = await comptroller.supplyCaps(vweETH_LiquidStakedETH);
      expect(weETHSupplyCap).to.equals(weETH_SUPPLY_CAP);

      const wstETHSupplyCap = await comptroller.supplyCaps(vwstETH_LiquidStakedETH);
      expect(wstETHSupplyCap).to.equals(wstETH_SUPPLY_CAP);
    });

    it("check updated borrow caps", async () => {
      const ethBorrowCap = await comptroller.borrowCaps(vETH_LiquidStakedETH);
      expect(ethBorrowCap).to.equals(ETH_BORROW_CAP);

      const weETHBorrowCap = await comptroller.borrowCaps(vweETH_LiquidStakedETH);
      expect(weETHBorrowCap).to.equals(weETH_BORROW_CAP);

      const wstETHBorrowCap = await comptroller.borrowCaps(vwstETH_LiquidStakedETH);
      expect(wstETHBorrowCap).to.equals(wstETH_BORROW_CAP);
    });

    it("check updated collateral factors", async () => {
      const weETHMarket = await comptroller.markets(vweETH_LiquidStakedETH);
      expect(weETHMarket.isListed).to.be.true;
      expect(weETHMarket.collateralFactorMantissa).to.equals(weETH_CF);
      expect(weETHMarket.liquidationThresholdMantissa).to.equals(weETH_LIQUIDATION_THRESHOLD);

      const wstETHMarket = await comptroller.markets(vwstETH_LiquidStakedETH);
      expect(wstETHMarket.isListed).to.be.true;
      expect(wstETHMarket.collateralFactorMantissa).to.equals(wstETH_CF);
      expect(wstETHMarket.liquidationThresholdMantissa).to.equals(wstETH_LIQUIDATION_THRESHOLD);
    });
  });
});
