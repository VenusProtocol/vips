import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  USDC_BORROW_CAP,
  USDC_SUPPLY_CAP,
  VUSDC_CORE,
  VWBTC_CORE,
  WBTC_BORROW_CAP,
  WBTC_SUPPLY_CAP,
  ZK_COMPTROLLER,
  vip425,
} from "../../vips/vip-425/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const USDC_SUPPLY_CAP_PREV = parseUnits("1250000", 6);
const USDC_BORROW_CAP_PREV = parseUnits("1000000", 6);
const WBTC_SUPPLY_CAP_PREV = parseUnits("40", 8);
const WBTC_BORROW_CAP_PREV = parseUnits("20", 8);

forking(53901122, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(ZK_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply and borrow cap for WBTC", async () => {
      const supplyCap = await comptroller.supplyCaps(VWBTC_CORE);
      const borrowCap = await comptroller.borrowCaps(VWBTC_CORE);

      expect(supplyCap).to.eq(WBTC_SUPPLY_CAP_PREV);
      expect(borrowCap).to.eq(WBTC_BORROW_CAP_PREV);
    });

    it("check supply and borrow cap for USDC", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_CORE);
      const borrowCap = await comptroller.borrowCaps(VUSDC_CORE);

      expect(supplyCap).to.eq(USDC_SUPPLY_CAP_PREV);
      expect(borrowCap).to.eq(USDC_BORROW_CAP_PREV);
    });
  });

  testForkedNetworkVipCommands("VIP 425", await vip425(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [2, 2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply and borrow cap for WBTC", async () => {
      const supplyCap = await comptroller.supplyCaps(VWBTC_CORE);
      const borrowCap = await comptroller.borrowCaps(VWBTC_CORE);

      expect(supplyCap).to.eq(WBTC_SUPPLY_CAP);
      expect(borrowCap).to.eq(WBTC_BORROW_CAP);
    });

    it("check supply and borrow cap for USDC.e", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_CORE);
      const borrowCap = await comptroller.borrowCaps(VUSDC_CORE);

      expect(supplyCap).to.eq(USDC_SUPPLY_CAP);
      expect(borrowCap).to.eq(USDC_BORROW_CAP);
    });
  });
});
