import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip139 } from "../../vips/vip-139";
import VTOKEN_ABI from "./abi/VToken.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VBIFI_DEFI = "0xC718c51958d3fd44f5F9580c9fFAC2F89815C909";

const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

forking(29848811, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let comptroller: Contract;
    let vBIFI_DeFi: Contract;

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      vBIFI_DeFi = new ethers.Contract(VBIFI_DEFI, VTOKEN_ABI, provider);
    });

    it("mint not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VBIFI_DEFI, Actions.MINT);
      expect(borrowPaused).to.equal(false);
    });

    it("borrow not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VBIFI_DEFI, Actions.BORROW);
      expect(borrowPaused).to.equal(false);
    });

    it("enter market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VBIFI_DEFI, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(false);
    });

    it("reserve factor is 0.25", async () => {
      const newReserveFactor = await vBIFI_DeFi.reserveFactorMantissa();
      expect(newReserveFactor).to.equal(parseUnits("0.25", 18));
    });
  });

  testVip("VIP-139 Delist BIFI", vip139(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket"], [3]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewReserveFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let comptroller: Contract;
    let vBIFI_DeFi: Contract;

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      vBIFI_DeFi = new ethers.Contract(VBIFI_DEFI, VTOKEN_ABI, provider);
    });

    it("mint paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VBIFI_DEFI, Actions.MINT);
      expect(borrowPaused).to.equal(true);
    });

    it("borrow paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VBIFI_DEFI, Actions.BORROW);
      expect(borrowPaused).to.equal(true);
    });

    it("enter market paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VBIFI_DEFI, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(true);
    });

    it("reserve factor is 1", async () => {
      const newReserveFactor = await vBIFI_DeFi.reserveFactorMantissa();
      expect(newReserveFactor).to.equal(parseUnits("1", 18));
    });
  });
});
