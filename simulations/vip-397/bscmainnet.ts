import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip397, { Actions, LST_BNB_COMPTROLLER, RESILIENT_ORACLE } from "../../vips/vip-397/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const NATIVE_TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const BNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const BNBX = "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275";
const BNBX_VTOKEN = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const ANKRBNB_VTOKEN = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
const SLISBNB_VTOKEN = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const WBNB_VTOKEN = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";

forking(44051250, async () => {
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const comptroller = new ethers.Contract(LST_BNB_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await oracle.getPrice(BNBX);
      expect(price).to.be.equal(parseUnits("836.031062608011472369", "18"));
    });

    describe("BNBx actions", () => {
      it("mint paused", async () => {
        expect(await comptroller.actionPaused(BNBX_VTOKEN, Actions.MINT)).to.equal(true);
      });

      it("borrow paused", async () => {
        expect(await comptroller.actionPaused(BNBX_VTOKEN, Actions.BORROW)).to.equal(true);
      });

      it("enter market paused", async () => {
        expect(await comptroller.actionPaused(BNBX_VTOKEN, Actions.ENTER_MARKET)).to.equal(true);
      });
    });

    describe("Borrows on other markets", () => {
      it("ankrBNB borrows paused", async () => {
        expect(await comptroller.actionPaused(ANKRBNB_VTOKEN, Actions.BORROW)).to.equal(true);
      });

      it("slisBNB borrows paused", async () => {
        expect(await comptroller.actionPaused(SLISBNB_VTOKEN, Actions.BORROW)).to.equal(true);
      });

      it("WBNB borrows paused", async () => {
        expect(await comptroller.actionPaused(WBNB_VTOKEN, Actions.BORROW)).to.equal(true);
      });
    });
  });

  testVip("VIP-397", await vip397(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket"], [6]);
    },
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, NATIVE_TOKEN_ADDR, BNB_FEED, NORMAL_TIMELOCK);
    });

    it("check BNBx price", async () => {
      const price = parseUnits("682.912935326188597512", 18);
      expect(await oracle.getPrice(BNBX)).to.equal(price);
      expect(await oracle.getUnderlyingPrice(BNBX_VTOKEN)).to.equal(price);
    });

    describe("BNBx actions", () => {
      it("mint unpaused", async () => {
        expect(await comptroller.actionPaused(BNBX_VTOKEN, Actions.MINT)).to.equal(false);
      });

      it("borrow unpaused", async () => {
        expect(await comptroller.actionPaused(BNBX_VTOKEN, Actions.BORROW)).to.equal(false);
      });

      it("enter market unpaused", async () => {
        expect(await comptroller.actionPaused(BNBX_VTOKEN, Actions.ENTER_MARKET)).to.equal(false);
      });
    });

    describe("Borrows on other markets", () => {
      it("ankrBNB borrows unpaused", async () => {
        expect(await comptroller.actionPaused(ANKRBNB_VTOKEN, Actions.BORROW)).to.equal(false);
      });

      it("slisBNB borrows unpaused", async () => {
        expect(await comptroller.actionPaused(SLISBNB_VTOKEN, Actions.BORROW)).to.equal(false);
      });

      it("WBNB borrows unpaused", async () => {
        expect(await comptroller.actionPaused(WBNB_VTOKEN, Actions.BORROW)).to.equal(false);
      });
    });
  });
});
