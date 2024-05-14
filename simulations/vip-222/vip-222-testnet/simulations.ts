import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkVToken } from "../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../src/vip-framework/checks/interestRateModel";
import { vip222Testnet } from "../../../vips/vip-222/vip-222-testnet";
import USDT_ABI from "./abi/USDT_ABI.json";
import VFDUSD_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import FDUSD_ABI from "./abi/mockToken.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const FDUSD = "0xcF27439fA231af9931ee40c4f27Bb77B83826F3C";
const VFDUSD = "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636";
const VENUS_TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const INITIAL_VTOKENS = parseUnits("10000", 8);
const COMMUNITY_WALLET_FUNDING = parseUnits("10000", 18);
const BORROW_CAP = parseUnits("4400000", 18);
const SUPPLY_CAP = parseUnits("5500000", 18);
const REWARDS_SUPPLY_SPEED = 173611111111111;
const REWARDS_BORROW_SPEED = 173611111111111;
const COLLATERAL_FACTOR = parseUnits("0.75", 18);
const RESERVES_BLOCK_DELTA = 100;
const RESERVE_FACTOR = parseUnits("0.1", 18);
const RATE_MODEL = "0xf59B7f2733a549dCF82b804d69d9c6a38985B90B";

forking(36131280, async () => {
  let comptroller: Contract;
  let fdusd: Contract;
  let vFdusd: Contract;
  let oracle: Contract;
  let usdt: Contract;
  let communityBalanceBefore: any;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    fdusd = new ethers.Contract(FDUSD, FDUSD_ABI, provider);
    vFdusd = new ethers.Contract(VFDUSD, VFDUSD_ABI, provider);
    oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, provider);
    usdt = new ethers.Contract(USDT, USDT_ABI, provider);
    communityBalanceBefore = await usdt.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-222-testnet Add FDUSD Market", await vip222Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VFDUSD_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewReserveFactor",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "VenusSupplySpeedUpdated",
          "VenusBorrowSpeedUpdated",
          "NewCollateralFactor",
          "Mint",
          "Failure",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("adds a new FDUSD market and set collateral factor to 75%", async () => {
      const market = await comptroller.markets(VFDUSD);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(COLLATERAL_FACTOR);
    });
    it("reserves factor equals 10%", async () => {
      const reserveFactor = await vFdusd.reserveFactorMantissa();
      expect(reserveFactor).to.equal(RESERVE_FACTOR);
    });
    it("sets protocol share reserve", async () => {
      expect(await vFdusd.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });
    it("sets Reduce Reserves Block Delta to 100", async () => {
      expect(await vFdusd.reduceReservesBlockDelta()).to.equal(RESERVES_BLOCK_DELTA);
    });
    it("sets the supply cap to 5,500,000 FDUSD", async () => {
      const newCap = await comptroller.supplyCaps(VFDUSD);
      expect(newCap).to.equal(SUPPLY_CAP);
    });
    it("sets the borrow cap to 4,400,000 FDUSD", async () => {
      const newCap = await comptroller.borrowCaps(VFDUSD);
      expect(newCap).to.equal(BORROW_CAP);
    });
    it("sets the supply and borrow speeds to 173611111111111", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VFDUSD);
      const borrowSpeed = await comptroller.venusBorrowSpeeds(VFDUSD);
      expect(supplySpeed).to.equal(REWARDS_SUPPLY_SPEED);
      expect(borrowSpeed).to.equal(REWARDS_BORROW_SPEED);
    });
    it("does not leave FDUSD balance on the address of the timelock", async () => {
      const timelockBalance = await fdusd.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });
    it("does not leave vFDUSD balance on the address of the timelock", async () => {
      const timelockBalance = await vFdusd.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });
    it("moves INITIAL_VTOKENS vFDUSD to VENUS_TREASURY", async () => {
      const vTokenReceiverBalance = await vFdusd.balanceOf(VENUS_TREASURY);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS);
    });
    it("sets the admin to normal timelock", async () => {
      expect(await vFdusd.admin()).to.equal(NORMAL_TIMELOCK);
    });
    it("get correct price from oracle ", async () => {
      const price = await oracle.getUnderlyingPrice(VFDUSD);
      expect(price).to.equal(parseUnits("1", 18));
    });
    it("Community wallet balance should be increased by 10,000 USDT", async () => {
      expect(await usdt.balanceOf(COMMUNITY_WALLET)).to.equal(communityBalanceBefore.add(COMMUNITY_WALLET_FUNDING));
    });
    await checkInterestRate(RATE_MODEL, "FDUSD", { base: "0", kink: "0.8", multiplier: "0.06875", jump: "2.5" });
    await checkVToken(VFDUSD, {
      name: "Venus FDUSD",
      symbol: "vFDUSD",
      decimals: 8,
      underlying: FDUSD,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER,
    });
  });
});
