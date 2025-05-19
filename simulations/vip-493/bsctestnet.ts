import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  USD1,
  VUSD1,
  marketSpec,
  vip493,
} from "../../vips/vip-493/bsctestnet";
import VUSD1_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import USD1_ABI from "./abi/mockToken.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const RATE_MODEL = "0xaE81cA4E6eA7f7E72165dc68dBa2A0B1465E3B1f";
const INITIAL_VTOKENS = parseUnits("4988.03272766", 8);

const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

forking(51296001, async () => {
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
  });

  describe("Pre-VIP behavior", async () => {
    it("check usd1 market not listed ", async () => {
      const market = await comptroller.markets(VUSD1);
      expect(market.isListed).to.equal(false);
    });

    it("enter market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VUSD1, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(false);
    });
  });

  testVip("VIP-493-testnet: Add USD1 Market", await vip493(), {
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
    it("adds a new usd1 market and set collateral factor to 0%", async () => {
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
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS.sub(marketSpec.initialSupply.vTokensToBurn));
    });

    it("sets the admin to normal timelock", async () => {
      expect(await vusd1.admin()).to.equal(NORMAL_TIMELOCK);
    });

    it("get correct price from oracle ", async () => {
      const price = await oracle.getUnderlyingPrice(VUSD1);
      expect(price).to.equal(parseUnits("1", 18));
    });

    it("should burn $100 vusd1", async () => {
      const burnt = await vusd1.balanceOf(ethers.constants.AddressZero);
      expect(burnt).to.equal(marketSpec.initialSupply.vTokensToBurn);
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
