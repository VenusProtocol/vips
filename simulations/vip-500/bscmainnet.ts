import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { setRedstonePrice } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  NORMAL_TIMELOCK,
  PROTOCOL_SHARE_RESERVE,
  REDSTONE_ORACLE,
  REDUCE_RESERVES_BLOCK_DELTA,
  USD1,
  USDE_REDSTONE_FEED,
  VUSD1,
  marketSpec,
  vip500,
} from "../../vips/vip-500/bscmainnet";
import VUSD1_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import USD1_ABI from "./abi/mockToken.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const RATE_MODEL = "0x4eFbf2f6E63eCad12dE015E5be2a1094721633EE";
const INITIAL_VTOKENS = parseUnits("4988.03272766", 8);

const Actions = {
  ENTER_MARKET: 7,
};

forking(48883989, async () => {
  let comptroller: Contract;
  let usd1: Contract;
  let vusd1: Contract;
  let oracle: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    usd1 = new ethers.Contract(USD1, USD1_ABI, provider);
    vusd1 = new ethers.Contract(VUSD1, VUSD1_ABI, provider);
    oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, provider);
    // the feed for USD1 is not available yet, so we're using USDE_REDSTONE_FEED in the meantime
    await setRedstonePrice(REDSTONE_ORACLE, USD1, USDE_REDSTONE_FEED, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", async () => {
    it("check usd1 market not listed ", async () => {
      const market = await comptroller.markets(VUSD1);
      expect(market.isListed).to.equal(false);
    });

    it("check enter market action not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VUSD1, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(false);
    });
  });

  testVip("VIP-500 Add USD1 Market", await vip500(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VUSD1_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewReserveFactor",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
        ],
        [1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("adds a new USD1 market and set collateral factor to 0%", async () => {
      const market = await comptroller.markets(VUSD1);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(marketSpec.riskParameters.collateralFactor);
    });
    it("reserves factor equals 25%", async () => {
      const reserveFactor = await vusd1.reserveFactorMantissa();
      expect(reserveFactor).to.equal(marketSpec.riskParameters.reserveFactor);
    });
    it("sets protocol share reserve", async () => {
      expect(await vusd1.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });
    it("sets Reduce Reserves Block Delta to 28800", async () => {
      expect(await vusd1.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
    });
    it("sets the supply cap", async () => {
      const newCap = await comptroller.supplyCaps(VUSD1);
      expect(newCap).to.equal(marketSpec.riskParameters.supplyCap);
    });
    it("sets the borrow cap", async () => {
      const newCap = await comptroller.borrowCaps(VUSD1);
      expect(newCap).to.equal(marketSpec.riskParameters.borrowCap);
    });
    it("does not leave usd1 balance on the address of the timelock", async () => {
      const timelockBalance = await usd1.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });
    it("does not leave vusd1 balance on the address of the timelock", async () => {
      const timelockBalance = await vusd1.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });
    it("moves INITIAL_VTOKENS vusd1 to VENUS_TREASURY", async () => {
      const vTokenReceiverBalance = await vusd1.balanceOf(marketSpec.initialSupply.vTokenReceiver);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS);
    });
    it("sets the admin to normal timelock", async () => {
      expect(await vusd1.admin()).to.equal(NORMAL_TIMELOCK);
    });
    it("get correct price from oracle ", async () => {
      const price = await oracle.getPrice(USD1);
      expect(price).to.equal(parseUnits("1.0002741", 18));
    });
    it("enter market paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VUSD1, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(true);
    });

    await checkInterestRate(RATE_MODEL, "USD1", { base: "0", kink: "0.8", multiplier: "0.1", jump: "2.5" });
    await checkVToken(VUSD1, {
      name: "Venus USD1",
      symbol: "vUSD1",
      decimals: 8,
      underlying: USD1,
      // In exchangeRateStoredInternal()
      // If there are no tokens minted: exchangeRate = initialExchangeRate
      // Otherwise: exchangeRate = (totalCash + totalBorrows - totalReserves) / totalSupply
      exchangeRate: parseUnits("1.0000000000014954307010931156", 28),
      comptroller: marketSpec.vToken.comptroller,
    });
  });
});
