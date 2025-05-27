import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip503, {
  Actions,
  COMPTROLLER_LiquidStakedBNB,
  VToken_vPT_clisBNB_APR25_LiquidStakedBNB,
} from "../../vips/vip-503/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const provider = ethers.provider;

forking(52148327, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER_LiquidStakedBNB, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Check market CF is not zero", async () => {
      const market = await comptroller.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
      expect(market.collateralFactorMantissa).not.equal(0);
    });

    it("Check market LI is not zero", async () => {
      const market = await comptroller.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
      expect(market.liquidationIncentiveMantissa).not.equal(0);
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

  testVip("VIP-503 bsctestnet", await vip503(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor", "ActionPausedMarket"], [1, 2]);
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Market CF should be zero", async () => {
      const market = await comptroller.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("Check market LI remains uneffected", async () => {
      const market = await comptroller.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
      expect(market.liquidationIncentiveMantissa).not.equal(0);
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
