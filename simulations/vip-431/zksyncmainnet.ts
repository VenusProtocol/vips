import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { VWBTC_CORE, WBTC_BORROW_CAP, WBTC_SUPPLY_CAP, ZK_COMPTROLLER, vip431 } from "../../vips/vip-431/bscmainnet";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";

const WBTC_SUPPLY_CAP_PREV = parseUnits("70", 8);
const WBTC_BORROW_CAP_PREV = parseUnits("35", 8);

forking(54277650, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(ZK_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply and borrow cap for WBTC", async () => {
      const supplyCap = await comptroller.supplyCaps(VWBTC_CORE);
      const borrowCap = await comptroller.borrowCaps(VWBTC_CORE);

      expect(supplyCap).to.eq(WBTC_SUPPLY_CAP_PREV);
      expect(borrowCap).to.eq(WBTC_BORROW_CAP_PREV);
    });
  });

  testForkedNetworkVipCommands("VIP 431", await vip431(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply and borrow cap for WBTC", async () => {
      const supplyCap = await comptroller.supplyCaps(VWBTC_CORE);
      const borrowCap = await comptroller.borrowCaps(VWBTC_CORE);

      expect(supplyCap).to.eq(WBTC_SUPPLY_CAP);
      expect(borrowCap).to.eq(WBTC_BORROW_CAP);
    });
  });
});
