import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { Actions, COMPTROLLER, vFDUSD, vip478 } from "../../vips/vip-478/bscmainnet";
import SETTER_FACET_ABI from "./abi/SetterFacet.json";

forking(48263595, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(SETTER_FACET_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("unpuased actions", async () => {
      let paused = await comptroller.actionPaused(vFDUSD, Actions.BORROW);
      expect(paused).to.be.true;

      paused = await comptroller.actionPaused(vFDUSD, Actions.MINT);
      expect(paused).to.be.true;

      paused = await comptroller.actionPaused(vFDUSD, Actions.ENTER_MARKET);
      expect(paused).to.be.true;
    });
  });

  testVip("VIP-478", await vip478(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [SETTER_FACET_ABI], ["ActionPausedMarket"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("unpuased actions", async () => {
      let paused = await comptroller.actionPaused(vFDUSD, Actions.BORROW);
      expect(paused).to.be.false;

      paused = await comptroller.actionPaused(vFDUSD, Actions.MINT);
      expect(paused).to.be.false;

      paused = await comptroller.actionPaused(vFDUSD, Actions.ENTER_MARKET);
      expect(paused).to.be.false;
    });
  });
});
