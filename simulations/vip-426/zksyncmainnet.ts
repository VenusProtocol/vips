import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { USDC_BORROW_CAP, USDC_SUPPLY_CAP, VUSDC_CORE, ZK_COMPTROLLER, vip426 } from "../../vips/vip-426/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const USDC_SUPPLY_CAP_PREV = parseUnits("6000000", 6);
const USDC_BORROW_CAP_PREV = parseUnits("5400000", 6);

forking(54069492, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(ZK_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply and borrow cap for USDC", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_CORE);
      const borrowCap = await comptroller.borrowCaps(VUSDC_CORE);

      expect(supplyCap).to.eq(USDC_SUPPLY_CAP_PREV);
      expect(borrowCap).to.eq(USDC_BORROW_CAP_PREV);
    });
  });

  testForkedNetworkVipCommands("VIP 426", await vip426(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply and borrow cap for USDC", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_CORE);
      const borrowCap = await comptroller.borrowCaps(VUSDC_CORE);

      expect(supplyCap).to.eq(USDC_SUPPLY_CAP);
      expect(borrowCap).to.eq(USDC_BORROW_CAP);
    });
  });
});
