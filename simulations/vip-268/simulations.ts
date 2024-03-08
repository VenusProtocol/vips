import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriod } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  Actions,
  BORROW_CAP,
  COLLATERAL_FACTOR,
  COMPTROLLER,
  FD_USD_BORROW_CAP,
  FD_USD_SUPPLY_CAP,
  RESERVE_FACTOR,
  SUPPLY_CAP,
  vFDUSD,
  vTUSD,
  vip268,
} from "../../vips/vip-268/bscmainnet";
import ERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SETTER_FACET_ABI from "./abi/SetterFacet.json";
import VTOKEN_ABI from "./abi/VToken.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";

forking(36760588, () => {
  let comptroller: ethers.Contract;
  let resilientOracle: ethers.Contract;
  let tusdContract: ethers.Contract;
  let vTUSDContract: ethers.Contract;

  before(async () => {
    impersonateAccount(NORMAL_TIMELOCK);

    comptroller = await ethers.getContractAt(SETTER_FACET_ABI, COMPTROLLER, await ethers.getSigner(NORMAL_TIMELOCK));
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);
    tusdContract = await ethers.getContractAt(ERC20_ABI, TUSD);
    vTUSDContract = await ethers.getContractAt(VTOKEN_ABI, vTUSD, await ethers.getSigner(NORMAL_TIMELOCK));

    await setMaxStalePeriod(resilientOracle, tusdContract);
  });

  describe("Pre-VIP behavior", async () => {
    it("collateral factor", async () => {
      const market = await comptroller.markets(vTUSD);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("reserve factor", async () => {
      const rf = await vTUSDContract.reserveFactorMantissa();
      expect(rf).to.equal(parseUnits("1", 18));
    });

    it("borrow cap", async () => {
      let cap = await comptroller.borrowCaps(vTUSD);
      expect(cap).to.equal(parseUnits("4000000", 18));

      cap = await comptroller.borrowCaps(vFDUSD);
      expect(cap).to.equal(parseUnits("8000000", 18));
    });

    it("supply cap", async () => {
      let cap = await comptroller.supplyCaps(vTUSD);
      expect(cap).to.equal(parseUnits("5000000", 18));

      cap = await comptroller.supplyCaps(vFDUSD);
      expect(cap).to.equal(parseUnits("15000000", 18));
    });

    it("unpuased actions", async () => {
      let paused = await comptroller.actionPaused(vTUSD, Actions.BORROW);
      expect(paused).to.be.true;

      paused = await comptroller.actionPaused(vTUSD, Actions.MINT);
      expect(paused).to.be.true;

      paused = await comptroller.actionPaused(vTUSD, Actions.ENTER_MARKET);
      expect(paused).to.be.true;
    });
  });

  testVip("VIP-268", vip268(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [SETTER_FACET_ABI],
        ["ActionPausedMarket", "NewBorrowCap", "NewSupplyCap", "NewCollateralFactor"],
        [3, 2, 2, 1],
      );
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewReserveFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor", async () => {
      const market = await comptroller.markets(vTUSD);
      expect(market.collateralFactorMantissa).to.equal(COLLATERAL_FACTOR);
    });

    it("reserve factor", async () => {
      const rf = await vTUSDContract.reserveFactorMantissa();
      expect(rf).to.equal(RESERVE_FACTOR);
    });

    it("borrow cap", async () => {
      let cap = await comptroller.borrowCaps(vTUSD);
      expect(cap).to.equal(BORROW_CAP);

      cap = await comptroller.borrowCaps(vFDUSD);
      expect(cap).to.equal(FD_USD_BORROW_CAP);
    });

    it("supply cap", async () => {
      let cap = await comptroller.supplyCaps(vTUSD);
      expect(cap).to.equal(SUPPLY_CAP);

      cap = await comptroller.supplyCaps(vFDUSD);
      expect(cap).to.equal(FD_USD_SUPPLY_CAP);
    });

    it("unpuased actions", async () => {
      let paused = await comptroller.actionPaused(vTUSD, Actions.BORROW);
      expect(paused).to.be.false;

      paused = await comptroller.actionPaused(vTUSD, Actions.MINT);
      expect(paused).to.be.false;

      paused = await comptroller.actionPaused(vTUSD, Actions.ENTER_MARKET);
      expect(paused).to.be.false;
    });
  });
});
