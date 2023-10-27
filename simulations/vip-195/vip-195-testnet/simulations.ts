import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkInterestRate } from "../../../src/vip-framework/checks/interestRateModel";
import { vip195Testnet } from "../../../vips/vip-195/vip-195-testnet";
import UNI_ABI from "./abi/UNI_ABI.json";
import VUNI_ABI from "./abi/VBep20_ABI.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/resilientOracle.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const UNI = "0x8D2f061C75780d8D91c10A7230B907411aCBC8fC";
const VUNI = "0x48ef03b6E6A8984cA0D561EE9c85407653EE6107";
const RATE_MODEL = "0x0FA6E7E2e978eF0B184a02E2A7870A5beac12024";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const VTOKEN_RECEIVER = "0x9cc6F5f16498fCEEf4D00A350Bd8F8921D304Dc9";
const INITIAL_VTOKENS = parseUnits("1", 8);

forking(34515794, () => {
  let comptroller: ethers.Contract;
  let uni: ethers.Contract;
  let vUni: ethers.Contract;
  let oracle: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    uni = new ethers.Contract(UNI, UNI_ABI, provider);
    vUni = new ethers.Contract(VUNI, VUNI_ABI, provider);
    oracle = new ethers.Contract(await comptroller.oracle(), PRICE_ORACLE_ABI, provider);
  });

  testVip("VIP-195-testnet Add UNI Market", vip195Testnet(), {
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
    it("adds a new UNI market and set collateral factor to 55%", async () => {
      const market = await comptroller.markets(VUNI);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.55", 18));
    });
    it("reserves factor equals 25%", async () => {
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
      expect(price).to.equal(parseUnits("4.10", 18));
    });
    await checkInterestRate(RATE_MODEL, "UNI", { base: "0", kink: "0.5", multiplier: "0.20", jump: "3" });
  });
});
