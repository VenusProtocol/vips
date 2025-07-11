import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip530, { Actions, BTC_POOL_COMPTROLLER_BSC, vPT_SolvBTC_BBN_27MAR2025_BTC } from "../../vips/vip-530/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import COMPTROLLER_ABI from "./abi/SetterFacet.json";

const provider = ethers.provider;

forking(53658652, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(BTC_POOL_COMPTROLLER_BSC, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market CF is not zero", async () => {
      const market = await comptroller.markets(vPT_SolvBTC_BBN_27MAR2025_BTC);
      expect(market.collateralFactorMantissa).not.equal(0);
    });

    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market actions are not paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        if (actionId !== 2) {
          const isPaused = await comptroller.actionPaused(vPT_SolvBTC_BBN_27MAR2025_BTC, actionId);
          expect(isPaused, `${actionName} should be paused`).to.be.false;
        }
      }
    });
  });

  testVip("VIP-530 bscmainnet", await vip530(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "ActionPausedMarket",
          "NewCollateralFactor",
          "NewBorrowCap",
          "NewBorrowCap",
          "MarketUnlisted",
        ],
        [8, 1, 1, 1, 1],
      );
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market CF is zero", async () => {
      const market = await comptroller.markets(vPT_SolvBTC_BBN_27MAR2025_BTC);
      expect(market.collateralFactorMantissa).equal(0);
    });

    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        if (actionId !== 2) {
          const isPaused = await comptroller.actionPaused(vPT_SolvBTC_BBN_27MAR2025_BTC, actionId);
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        }
      }
    });
  });
});
