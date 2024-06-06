import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkInterestRate } from "../../../src/vip-framework/checks/interestRateModel";
import { vip195 } from "../../../vips/vip-195/vip-195";
import UNI_ABI from "./abi/UNI_ABI.json";
import USDT_ABI from "./abi/USDT_ABI.json";
import VUNI_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const UNI = "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1";
const VUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const RATE_MODEL = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTOKEN_RECEIVER = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const INITIAL_VTOKENS = parseUnits("2454.8886400", 8);

forking(33050757, async () => {
  let comptroller: Contract;
  let uni: Contract;
  let vUni: Contract;
  let usdt: Contract;
  let oracle: Contract;

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

  testVip("VIP-195 Add UNI Market", await vip195(24 * 60 * 60 * 3), {
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
    it("adds a new UNI market", async () => {
      const market = await comptroller.markets(VUNI);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.55", 18));
    });

    it("reserves factor equals 25% ", async () => {
      const reserveFactor = await vUni.reserveFactorMantissa();
      expect(reserveFactor).to.equal(parseUnits("0.25", 18));
    });

    it("sets protocol share reserve", async () => {
      expect(await vUni.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("sets Reduce Reserves Block Delta to 28800", async () => {
      expect(await vUni.reduceReservesBlockDelta()).to.equal(28800);
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

    it("moves INITIAL_VTOKENS vUNI to VTOKEN_RECEIVER", async () => {
      const vTokenReceiverBalance = await vUni.balanceOf(VTOKEN_RECEIVER);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS);
    });

    it("sets the admin to normal timelock", async () => {
      expect(await vUni.admin()).to.equal(NORMAL_TIMELOCK);
    });

    it("get correct price from oracle ", async () => {
      const price = await oracle.getUnderlyingPrice(VUNI);
      expect(price).to.equal(parseUnits("4.1646289", 18));
    });
    it("Community wallet balance should be increased by 10,000 USDT", async () => {
      expect(await usdt.balanceOf(COMMUNITY_WALLET)).to.equal(communityBalanceBefore.add(parseUnits("10000", 18)));
    });
    await checkInterestRate(RATE_MODEL, "UNI", { base: "0", kink: "0.5", multiplier: "0.20", jump: "3" });
  });
});
