import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip650, { BSTOCK_LIQUIDATOR, UNITROLLER } from "../../vips/vip-650/bscmainnet";
import FLASHLOAN_FACET_ABI from "./abi/FlashLoanFacet.json";

const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const FORK_BLOCK = 107818021;

const VUSDT_ABI = ["function isFlashLoanEnabled() view returns (bool)"];

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(UNITROLLER, FLASHLOAN_FACET_ABI, ethers.provider);
  const vUSDT = new ethers.Contract(VUSDT, VUSDT_ABI, ethers.provider);

  describe("VIP-650 Pre-VIP behavior", () => {
    it("BStockLiquidator is not yet whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(BSTOCK_LIQUIDATOR)).to.equal(false);
    });

    it("vUSDT flash loans are already enabled (set by a prior VIP)", async () => {
      expect(await vUSDT.isFlashLoanEnabled()).to.equal(true);
    });
  });

  testVip("VIP-650", await vip650(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [FLASHLOAN_FACET_ABI], ["IsAccountFlashLoanWhitelisted"], [1]);
    },
  });

  describe("VIP-650 Post-VIP behavior", () => {
    it("BStockLiquidator is whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(BSTOCK_LIQUIDATOR)).to.equal(true);
    });
  });
});
