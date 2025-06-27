import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip526, { Actions, COMPTROLLER_Core, VToken_vPT_sUSDE_26JUN2025 } from "../../vips/vip-526/bsctestnet";
import COMPTROLLER_ABI from "./abi/SetterFacet.json";

const provider = ethers.provider;

forking(56145209, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER_Core, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Check mint action is not paused", async () => {
      const isPaused = await comptroller.actionPaused(VToken_vPT_sUSDE_26JUN2025, Actions.MINT); // Mint action
      expect(isPaused).to.be.false;
    });

    it("Check enter market action is not paused", async () => {
      const isPaused = await comptroller.actionPaused(VToken_vPT_sUSDE_26JUN2025, Actions.ENTER_MARKET); // Enter market action
      expect(isPaused).to.be.false;
    });
  });

  testVip("VIP-526 bscmainnet", await vip526(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Mint action should be paused", async () => {
      const isPaused = await comptroller.actionPaused(VToken_vPT_sUSDE_26JUN2025, Actions.MINT);
      expect(isPaused).to.be.true;
    });

    it("Enter market action should be paused", async () => {
      const isPaused = await comptroller.actionPaused(VToken_vPT_sUSDE_26JUN2025, Actions.ENTER_MARKET); // Enter market action
      expect(isPaused).to.be.true;
    });
  });
});
