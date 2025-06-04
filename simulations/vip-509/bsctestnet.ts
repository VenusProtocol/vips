import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  vip509,
} from "../../vips/vip-509/bsctestnet";
const { RESILIENT_ORACLE } = NETWORK_ADDRESSES.bsctestnet;


forking(53622696, async () => {
  const provider = ethers.provider;

  before(async () => {
  });

  // describe("Pre-VIP behavior", async () => {
  //   it("check xsolvbtc market not listed ", async () => {
  //     const market = await comptroller.markets(xSolvBTC_BSC);
  //     expect(market.isListed).to.equal(false);
  //   });

  //   it("enter market not paused", async () => {
  //     const borrowPaused = await comptroller.actionPaused(xSolvBTC_BSC, Actions.ENTER_MARKET);
  //     expect(borrowPaused).to.equal(false);
  //   });
  // });

  testVip("VIP-508-testnet", await vip509(), {
    callbackAfterExecution: async txResponse => {
      
    },
  });

  // describe("Post-VIP behavior", async () => {
  //   it("get price of xsolvbtc from oracle", async () => {
  //     const price = await oracle.getPrice(xSolvBTC_BSC);
  //     expect(price).to.equal(parseUnits("60000", 18));
  //   });

  //   it("adds a new xsolvbtc market and set collateral factor to 72%", async () => {
  //     const market = await comptroller.markets(vxSolvBTC_BSC);
  //     expect(market.isListed).to.equal(true);
  //     expect(market.collateralFactorMantissa).to.equal(xSolvBTCMarketSpec.riskParameters.collateralFactor);
  //   });

  //   it("reserves factor equals 10%", async () => {
  //     const reserveFactor = await vxsolvbtc.reserveFactorMantissa();
  //     expect(reserveFactor).to.equal(xSolvBTCMarketSpec.riskParameters.reserveFactor);
  //   });

  //   it("sets protocol share reserve", async () => {
  //     expect(await vxsolvbtc.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE_BSC);
  //   });

  //   it("sets Reduce Reserves Block Delta to 28800", async () => {
  //     expect(await vxsolvbtc.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA_BSC);
  //   });

  //   it("sets the supply cap", async () => {
  //     const newCap = await comptroller.supplyCaps(vxSolvBTC_BSC);
  //     expect(newCap).to.equal(xSolvBTCMarketSpec.riskParameters.supplyCap);
  //   });

  //   it("sets the borrow cap", async () => {
  //     const newCap = await comptroller.borrowCaps(vxSolvBTC_BSC);
  //     expect(newCap).to.equal(xSolvBTCMarketSpec.riskParameters.borrowCap);
  //   });

  //   it("does not leave xsolvbtc balance on the address of the timelock", async () => {
  //     const timelockBalance = await xsolvbtc.balanceOf(NORMAL_TIMELOCK);
  //     expect(timelockBalance).to.equal(0);
  //   });

  //   it("does not leave vxsolvbtc balance on the address of the timelock", async () => {
  //     const timelockBalance = await vxsolvbtc.balanceOf(NORMAL_TIMELOCK);
  //     expect(timelockBalance).to.equal(0);
  //   });

  //   it("moves INITIAL_VTOKENS vxsolvbtc to VENUS_TREASURY", async () => {
  //     const vTokenReceiverBalance = await vxsolvbtc.balanceOf(xSolvBTCMarketSpec.initialSupply.vTokenReceiver);
  //     expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS.sub(xSolvBTCMarketSpec.initialSupply.vTokensToBurn));
  //   });

  //   it("sets the admin to normal timelock", async () => {
  //     expect(await vxsolvbtc.admin()).to.equal(NORMAL_TIMELOCK);
  //   });

  //   it("should burn $100 vxsolvbtc", async () => {
  //     const burnt = await vxsolvbtc.balanceOf(ethers.constants.AddressZero);
  //     expect(burnt).to.equal(xSolvBTCMarketSpec.initialSupply.vTokensToBurn);
  //   });

  //   it("borrow market paused", async () => {
  //     const borrowPaused = await comptroller.actionPaused(vxSolvBTC_BSC, Actions.BORROW);
  //     expect(borrowPaused).to.equal(true);
  //   });

  //   await checkInterestRate(RATE_MODEL, "xSolvBTC", { base: "0", kink: "0.5", multiplier: "0.09", jump: "2" });
  //   await checkVToken(vxSolvBTC_BSC, {
  //     name: "Venus xSolvBTC",
  //     symbol: "vxSolvBTC",
  //     decimals: 8,
  //     underlying: xSolvBTC_BSC,
  //     // In exchangeRateStoredInternal()
  //     // If there are no tokens minted: exchangeRate = initialExchangeRate
  //     // Otherwise: exchangeRate = (totalCash + totalBorrows - totalReserves) / totalSupply
  //     exchangeRate: parseUnits("1", 28),
  //     comptroller: xSolvBTCMarketSpec.vToken.comptroller,
  //   });
  // });
});
