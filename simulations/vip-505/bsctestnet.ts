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
  xSolvBTC,
  xSolvBTC_Oracle,
  marketSpec,
  vip505,
  vxSolvBTC
} from "../../vips/vip-505/bsctestnet";
import xSolvBTC_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import USD1_ABI from "./abi/mockToken.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const RATE_MODEL = "0xE0d3774406296322f42CBf25e96e8388cDAf0A66";
const INITIAL_VTOKENS = parseUnits("1", 8);
const { RESILIENT_ORACLE, REDSTONE_ORACLE, UNITROLLER, ACCESS_CONTROL_MANAGER, VTREASURY } =
  NETWORK_ADDRESSES.bsctestnet;

const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

forking(53058755, async () => {
  let comptroller: Contract;
  let xsolvbtc: Contract;
  let vxsolvbtc: Contract;
  let oracle: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    xsolvbtc = new ethers.Contract(xSolvBTC, USD1_ABI, provider);
    vxsolvbtc = new ethers.Contract(vxSolvBTC, xSolvBTC_ABI, provider);
    oracle = new ethers.Contract(RESILIENT_ORACLE, PRICE_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check xsolvbtc market not listed ", async () => {
      const market = await comptroller.markets(xSolvBTC);
      expect(market.isListed).to.equal(false);
    });

    it("enter market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(xSolvBTC, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(false);
    });
  });

  testVip("VIP-505-testnet", await vip505(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, xSolvBTC_ABI],
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
    it("get price of xsolvbtc from oracle", async () => {
      const price = await oracle.getPrice(xSolvBTC);
      expect(price).to.equal(parseUnits("60000", 8));
    })

    it("adds a new xsolvbtc market and set collateral factor to 0%", async () => {
      const market = await comptroller.markets(vxSolvBTC);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(marketSpec.riskParameters.collateralFactor);
    });

    it("reserves factor equals 25%", async () => {
      const reserveFactor = await vxsolvbtc.reserveFactorMantissa();
      expect(reserveFactor).to.equal(marketSpec.riskParameters.reserveFactor);
    });

    it("sets protocol share reserve", async () => {
      expect(await vxsolvbtc.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("sets Reduce Reserves Block Delta to 28800", async () => {
      expect(await vxsolvbtc.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
    });

    it("sets the supply cap", async () => {
      const newCap = await comptroller.supplyCaps(vxSolvBTC);
      expect(newCap).to.equal(marketSpec.riskParameters.supplyCap);
    });

    it("sets the borrow cap", async () => {
      const newCap = await comptroller.borrowCaps(vxSolvBTC);
      expect(newCap).to.equal(marketSpec.riskParameters.borrowCap);
    });

    it("does not leave xsolvbtc balance on the address of the timelock", async () => {
      const timelockBalance = await xsolvbtc.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("does not leave vxsolvbtc balance on the address of the timelock", async () => {
      const timelockBalance = await vxsolvbtc.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("moves INITIAL_VTOKENS vxsolvbtc to VENUS_TREASURY", async () => {
      const vTokenReceiverBalance = await vxsolvbtc.balanceOf(marketSpec.initialSupply.vTokenReceiver);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS.sub(marketSpec.initialSupply.vTokensToBurn));
    });

    it("sets the admin to normal timelock", async () => {
      expect(await vxsolvbtc.admin()).to.equal(NORMAL_TIMELOCK);
    });

    it("should burn $100 vxsolvbtc", async () => {
      const burnt = await vxsolvbtc.balanceOf(ethers.constants.AddressZero);
      expect(burnt).to.equal(marketSpec.initialSupply.vTokensToBurn);
    });

    it("borrow market paused", async () => {
      const borrowPaused = await comptroller.actionPaused(vxSolvBTC, Actions.BORROW);
      expect(borrowPaused).to.equal(true);
    });

    await checkInterestRate(RATE_MODEL, "xSolvBTC", { base: "0", kink: "0.5", multiplier: "0.09", jump: "2" });
    await checkVToken(vxSolvBTC, {
      name: "Venus xSolvBTC",
      symbol: "vxSolvBTC",
      decimals: 8,
      underlying: xSolvBTC,
      // In exchangeRateStoredInternal()
      // If there are no tokens minted: exchangeRate = initialExchangeRate
      // Otherwise: exchangeRate = (totalCash + totalBorrows - totalReserves) / totalSupply
      exchangeRate: parseUnits("1", 28),
      comptroller: marketSpec.vToken.comptroller,
    });
  });
});
