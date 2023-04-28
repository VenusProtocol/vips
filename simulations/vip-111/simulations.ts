import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip111 } from "../../vips/vip-111";
import VTOKEN_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VBETH = "0x972207A639CC1B374B893cc33Fa251b55CEB7c07";

const Actions = {
  BORROW: 2,
};

forking(27716649, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let comptroller: ethers.Contract;
    let vBETH: ethers.Contract;

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      vBETH = new ethers.Contract(VBETH, VTOKEN_ABI, provider);
    });

    it("borrow not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VBETH, Actions.BORROW);
      expect(borrowPaused).to.equal(false);
    });

    it("reserve factor is 0.2", async () => {
      const newReserveFactor = await vBETH.reserveFactorMantissa();
      expect(newReserveFactor).to.equal(parseUnits("0.2", 18));
    });

    it("supply and borrow speeds is non zero", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VBETH);
      expect(supplySpeed).to.equal("596440972222220");

      const borrowSpeed = await comptroller.venusBorrowSpeeds(VBETH);
      expect(borrowSpeed).to.equal("596440972222220");
    });
  });

  testVip("VIP-111 Delist BETH", vip111(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket"], [1]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewReserveFactor"], [1]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["VenusSupplySpeedUpdated"], [1]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["VenusBorrowSpeedUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let comptroller: ethers.Contract;
    let vBETH: ethers.Contract;

    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
      vBETH = new ethers.Contract(VBETH, VTOKEN_ABI, provider);
    });

    it("borrow paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VBETH, Actions.BORROW);
      expect(borrowPaused).to.equal(true);
    });

    it("reserve factor is 1", async () => {
      const newReserveFactor = await vBETH.reserveFactorMantissa();
      expect(newReserveFactor).to.equal(parseUnits("1", 18));
    });

    it("supply and borrow speeds is zero", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VBETH);
      expect(supplySpeed).to.equal("0");

      const borrowSpeed = await comptroller.venusBorrowSpeeds(VBETH);
      expect(borrowSpeed).to.equal("0");
    });
  });
});
