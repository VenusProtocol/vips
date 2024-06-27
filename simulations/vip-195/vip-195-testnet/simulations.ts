import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { vip195Testnet } from "../../../vips/vip-195/vip-195-testnet";
import UNI_ABI from "./abi/UNI_ABI.json";
import USDT_ABI from "./abi/USDT_ABI.json";
import VUNI_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const UNI = "0x8D2f061C75780d8D91c10A7230B907411aCBC8fC";
const VUNI = "0x171B468b52d7027F12cEF90cd065d6776a25E24e";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const RATE_MODEL = "0x0FA6E7E2e978eF0B184a02E2A7870A5beac12024";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const VENUS_TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const INITIAL_VTOKENS = parseUnits("2454.8886400", 8);

forking(34650257, async () => {
  let comptroller: Contract;
  let uni: Contract;
  let vUni: Contract;
  let oracle: Contract;
  let usdt: Contract;
  let communityBalanceBefore: any;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    uni = new ethers.Contract(UNI, UNI_ABI, provider);
    vUni = new ethers.Contract(VUNI, VUNI_ABI, provider);
    oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, provider);
    usdt = new ethers.Contract(USDT, USDT_ABI, provider);
    communityBalanceBefore = await usdt.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-195-testnet Add UNI Market", await vip195Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VUNI_ABI],
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
    it("adds a new UNI market and set collateral factor to 55%", async () => {
      const market = await comptroller.markets(VUNI);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.55", 18));
    });
    it("reserves factor equals 25%", async () => {
      const reserveFactor = await vUni.reserveFactorMantissa();
      expect(reserveFactor).to.equal(parseUnits("0.25", 18));
    });
    it("sets protocol share reserve", async () => {
      expect(await vUni.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });
    it("sets Reduce Reserves Block Delta to 100", async () => {
      expect(await vUni.reduceReservesBlockDelta()).to.equal(100);
    });
    it("sets the supply cap to 50,000 UNI", async () => {
      const newCap = await comptroller.supplyCaps(VUNI);
      expect(newCap).to.equal(parseUnits("50000", 18));
    });
    it("sets the borrow cap to 30,000 UNI", async () => {
      const newCap = await comptroller.borrowCaps(VUNI);
      expect(newCap).to.equal(parseUnits("30000", 18));
    });
    it("sets the supply and borrow speeds to 81250000000000", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VUNI);
      const borrowSpeed = await comptroller.venusBorrowSpeeds(VUNI);
      expect(supplySpeed).to.equal("81250000000000");
      expect(borrowSpeed).to.equal("81250000000000");
    });
    it("does not leave UNI balance on the address of the timelock", async () => {
      const timelockBalance = await uni.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });
    it("does not leave vUNI balance on the address of the timelock", async () => {
      const timelockBalance = await vUni.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });
    it("moves INITIAL_VTOKENS vUNI to VENUS_TREASURY", async () => {
      const vTokenReceiverBalance = await vUni.balanceOf(VENUS_TREASURY);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS);
    });
    it("sets the admin to normal timelock", async () => {
      expect(await vUni.admin()).to.equal(NORMAL_TIMELOCK);
    });
    it("get correct price from oracle ", async () => {
      const price = await oracle.getUnderlyingPrice(VUNI);
      expect(price).to.equal(parseUnits("4.10", 18));
    });
    it("Community wallet balance should be increased by 10,000 USDT", async () => {
      expect(await usdt.balanceOf(COMMUNITY_WALLET)).to.equal(communityBalanceBefore.add(parseUnits("10000", 18)));
    });
    await checkInterestRate(RATE_MODEL, "UNI", { base: "0", kink: "0.5", multiplier: "0.20", jump: "3" });
  });
});
