import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { Actions, ETH_COMPTROLLER, ETH_vTUSD, vip478 } from "../../vips/vip-478/bscmainnet";
import COMPTROLLER_ABI from "./abi/ilComptroller.json";

forking(22247241, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, ETH_COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("unpuased actions for TUSD", async () => {
      let paused = await comptroller.actionPaused(ETH_vTUSD, Actions.BORROW);
      expect(paused).to.be.true;

      paused = await comptroller.actionPaused(ETH_vTUSD, Actions.MINT);
      expect(paused).to.be.true;

      paused = await comptroller.actionPaused(ETH_vTUSD, Actions.ENTER_MARKET);
      expect(paused).to.be.true;
    });
  });

  testForkedNetworkVipCommands("VIP-478", await vip478(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("unpuased actions for TUSD", async () => {
      let paused = await comptroller.actionPaused(ETH_vTUSD, Actions.BORROW);
      expect(paused).to.be.false;

      paused = await comptroller.actionPaused(ETH_vTUSD, Actions.MINT);
      expect(paused).to.be.false;

      paused = await comptroller.actionPaused(ETH_vTUSD, Actions.ENTER_MARKET);
      expect(paused).to.be.false;
    });
  });
});
