import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip535, {
  Actions,
  BTC_POOL_COMPTROLLER_BSC,
  vPT_SolvBTC_BBN_27MAR2025_BTC,
} from "../../vips/vip-535/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const provider = ethers.provider;

forking(53658652, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(BTC_POOL_COMPTROLLER_BSC, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market CF and LT is zero", async () => {
      const market = await comptroller.markets(vPT_SolvBTC_BBN_27MAR2025_BTC);
      expect(market.collateralFactorMantissa).to.be.equal(0);
      expect(market.liquidationThresholdMantissa).to.be.equal(parseUnits("0.85", 18));
    });

    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market actions are paused or not", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await comptroller.actionPaused(vPT_SolvBTC_BBN_27MAR2025_BTC, actionId);
        if (actionId === 1 || actionId === 3 || actionId === 4 || actionId === 5 || actionId === 6 || actionId === 8) {
          expect(isPaused, `${actionName} should be paused`).to.be.false;
        } else {
          expect(isPaused, `${actionName} should be paused`).to.be.true;
        }
      }
    });

    it("check borrow and supply caps for vPT_SolvBTC_BBN_27MAR2025_BTC", async () => {
      const borrowCap = await comptroller.borrowCaps(vPT_SolvBTC_BBN_27MAR2025_BTC);
      const supplyCap = await comptroller.supplyCaps(vPT_SolvBTC_BBN_27MAR2025_BTC);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.not.equal(0);
    });

    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market is listed", async () => {
      const market = await comptroller.markets(vPT_SolvBTC_BBN_27MAR2025_BTC);
      expect(market.isListed).to.be.true;
    });
  });

  testVip("VIP-535 bscmainnet", await vip535(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewSupplyCap", "MarketUnlisted", "ActionPausedMarket"],
        [1, 1, 6],
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
    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market CF and LT is zero", async () => {
      const market = await comptroller.markets(vPT_SolvBTC_BBN_27MAR2025_BTC);
      expect(market.collateralFactorMantissa).equal(0);
      expect(market.liquidationThresholdMantissa).to.be.equal(parseUnits("0.85", 18));
    });

    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market actions are paused", async () => {
      for (const [actionName, actionId] of Object.entries(Actions)) {
        const isPaused = await comptroller.actionPaused(vPT_SolvBTC_BBN_27MAR2025_BTC, actionId);
        expect(isPaused, `${actionName} should be paused`).to.be.true;
      }
    });

    it("check borrow and supply caps for vPT_SolvBTC_BBN_27MAR2025_BTC", async () => {
      const borrowCap = await comptroller.borrowCaps(vPT_SolvBTC_BBN_27MAR2025_BTC);
      const supplyCap = await comptroller.supplyCaps(vPT_SolvBTC_BBN_27MAR2025_BTC);
      expect(borrowCap).to.be.equal(0);
      expect(supplyCap).to.be.equal(0);
    });

    it("Check vPT_SolvBTC_BBN_27MAR2025_BTC market is listed", async () => {
      const market = await comptroller.markets(vPT_SolvBTC_BBN_27MAR2025_BTC);
      expect(market.isListed).to.be.false;
    });
  });
});
