import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import bsctestnetVip491, {
  Actions,
  COMPTROLLER_LiquidStakedBNB,
  VToken_vPT_clisBNB_APR25_LiquidStakedBNB,
} from "../../vips/vip-491/bsctestnet";
import bsctestnet2Vip491 from "../../vips/vip-491/bsctestnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const provider = ethers.provider;

forking(51867242, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER_LiquidStakedBNB, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Check market CF is not zero", async () => {
      const market = await comptroller.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
      expect(market.collateralFactorMantissa).not.equal(0);
    });

    it("Check mint action is not paused", async () => {
      const isPaused = await comptroller.actionPaused(VToken_vPT_clisBNB_APR25_LiquidStakedBNB, Actions.MINT); // Mint action
      expect(isPaused).to.be.false;
    });

    it("Check enter market action is not paused", async () => {
      const isPaused = await comptroller.actionPaused(VToken_vPT_clisBNB_APR25_LiquidStakedBNB, Actions.ENTER_MARKET); // Enter market action
      expect(isPaused).to.be.false;
    });
  });

  testVip("VIP-491 bsctestnet", await bsctestnetVip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor", "ActionPausedMarket"], [1, 2]);
    },
  });

  testVip("VIP-491 bsctestnet-2", await bsctestnet2Vip491());

  describe("Post-VIP behavior", async () => {
    it("Market CF should be zero", async () => {
      const market = await comptroller.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("Mint action should be paused", async () => {
      const isPaused = await comptroller.actionPaused(VToken_vPT_clisBNB_APR25_LiquidStakedBNB, Actions.MINT);
      expect(isPaused).to.be.true;
    });

    it("Enter market action should be paused", async () => {
      const isPaused = await comptroller.actionPaused(VToken_vPT_clisBNB_APR25_LiquidStakedBNB, Actions.ENTER_MARKET); // Enter market action
      expect(isPaused).to.be.true;
    });
  });
});
