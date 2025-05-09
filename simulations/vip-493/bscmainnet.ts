import { expect } from "chai";
import { BigNumber } from "ethers";
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
  USD1_REDSTONE_FEED,
  USDT,
  VANGUARD_VANTAGE_AMOUNT_USDT,
  VANGUARD_VANTAGE_TREASURY,
  VUSD1,
  marketSpec,
  vip493,
} from "../../vips/vip-493/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VUSD1_ABI from "./abi/VBep20_ABI.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const ONE_YEAR = 365 * 24 * 3600;

const RATE_MODEL = "0x4eFbf2f6E63eCad12dE015E5be2a1094721633EE";
const INITIAL_VTOKENS = parseUnits("4988.03272766", 8);

forking(49362932, async () => {
  const comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, ethers.provider);
  const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
  const usd1 = new ethers.Contract(USD1, ERC20_ABI, ethers.provider);
  const vusd1 = new ethers.Contract(VUSD1, VUSD1_ABI, ethers.provider);
  const oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, ethers.provider);
  let prevUSDTBalanceOfVanguard: BigNumber;

  before(async () => {
    prevUSDTBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VANTAGE_TREASURY);
    await setRedstonePrice(REDSTONE_ORACLE, USD1, USD1_REDSTONE_FEED, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", async () => {
    it("check usd1 market not listed ", async () => {
      const market = await comptroller.markets(VUSD1);
      expect(market.isListed).to.equal(false);
    });
  });

  testVip("VIP-493 Add USD1 Market", await vip493(ONE_YEAR), {
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
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]); // bootstrap liquidity + refund
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

    it("should burn $100 vusd1", async () => {
      const burnt = await vusd1.balanceOf(ethers.constants.AddressZero);
      expect(burnt).to.equal(marketSpec.initialSupply.vTokensToBurn);
    });

    it("moves INITIAL_VTOKENS vusd1 to VENUS_TREASURY", async () => {
      const vTokenReceiverBalance = await vusd1.balanceOf(marketSpec.initialSupply.vTokenReceiver);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS.sub(marketSpec.initialSupply.vTokensToBurn));
    });

    it("sets the admin to normal timelock", async () => {
      expect(await vusd1.admin()).to.equal(NORMAL_TIMELOCK);
    });

    it("get correct price from oracle ", async () => {
      const price = await oracle.getPrice(USD1);
      expect(price).to.equal(parseUnits("1.00132727", 18));
    });

    it("Refund to Vanguard", async () => {
      const currentUSDTBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VANTAGE_TREASURY);
      expect(currentUSDTBalanceOfVanguard.sub(prevUSDTBalanceOfVanguard)).to.equal(VANGUARD_VANTAGE_AMOUNT_USDT);
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
