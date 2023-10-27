import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkInterestRate } from "../../../src/vip-framework/checks/interestRateModel";
import { vip195 } from "../../../vips/vip-195/vip-195";
import UNI_ABI from "./abi/UNI_ABI.json";
import VUNI_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const UNI = "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1";
const VUNI = "0x13582f709bb097c221BB2EA078c98901f739A7ba";
const RATE_MODEL = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTOKEN_RECEIVER = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const UNI_HOLDER = "0xe2fc31F816A9b94326492132018C3aEcC4a93aE1";
const INITIAL_VTOKENS = parseUnits("1", 8); // to be revised

forking(32961083, () => {
  let comptroller: ethers.Contract;
  let uni: ethers.Contract;
  let vUni: ethers.Contract;
  let oracle: ethers.Contract;
  let uni_holder: any;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    uni = new ethers.Contract(UNI, UNI_ABI, provider);
    vUni = new ethers.Contract(VUNI, VUNI_ABI, provider);
    oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, provider);
    uni_holder = await initMainnetUser(UNI_HOLDER, ethers.utils.parseEther("1"));
    await uni.connect(uni_holder).transfer(VTOKEN_RECEIVER, parseUnits("1", 18));
  });

  testVip("VIP-195 Add UNI Market", vip195(24 * 60 * 60 * 3), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VUNI_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewReserveFactor",
          "VenusSupplySpeedUpdated",
          "VenusBorrowSpeedUpdated",
          "NewCollateralFactor",
          "Mint",
          "Failure",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 0],
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

    it("does not leave UNI on the balance of the governance", async () => {
      const timelockBalance = await uni.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("does not leave vUNI on the balance of the governance", async () => {
      const timelockBalance = await vUni.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("moves INITIAL_VTOKENS vUNI to VTOKEN_RECEIVER", async () => {
      const vTokenReceiverBalance = await vUni.balanceOf(VTOKEN_RECEIVER);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS);
    });

    it("sets the admin to governance", async () => {
      expect(await vUni.admin()).to.equal(NORMAL_TIMELOCK);
    });

    it("get correct price from oracle ", async () => {
      const price = await oracle.getUnderlyingPrice(VUNI);
      expect(price).to.equal(parseUnits("4.0705381", 18));
    });
    await checkInterestRate(RATE_MODEL, "UNI", { base: "0", kink: "0.5", multiplier: "0.20", jump: "3" });
  });
});
