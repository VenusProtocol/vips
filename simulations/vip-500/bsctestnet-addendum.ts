import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { UNITROLLER, VUSD1, vip500Addendum } from "../../vips/vip-500/bsctestnet-addendum";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const Actions = {
  ENTER_MARKET: 7,
};

forking(51415815, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("enter market paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VUSD1, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(true);
    });
  });

  testVip("VIP-500-testnet-Addendum: Add USD1 Market", await vip500Addendum(), {});

  describe("Post-VIP behavior", async () => {
    it("enter market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(VUSD1, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(false);
    });
  });
});
