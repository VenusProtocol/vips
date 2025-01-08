import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  COMPTROLLER,
  USDC_E_BORROW_CAP,
  USDC_E_SUPPLY_CAP,
  VUSDC_E_CORE,
  VZK_CORE,
  ZK_BORROW_CAP,
  vip420,
} from "../../vips/vip-420/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const USDC_E_SUPPLY_CAP_PREV = parseUnits("24000000", 6);
const USDC_E_BORROW_CAP_PREV = parseUnits("10800000", 6);
const ZK_BORROW_CAP_PREV = parseUnits("12500000", 18);

forking(53190210, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check borrow cap for ZK", async () => {
      const borrowCap = await comptroller.borrowCaps(VZK_CORE);

      expect(borrowCap).to.eq(ZK_BORROW_CAP_PREV);
    });

    it("check supply and borrow cap for USDC.e", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_E_CORE);
      const borrowCap = await comptroller.borrowCaps(VUSDC_E_CORE);

      expect(supplyCap).to.eq(USDC_E_SUPPLY_CAP_PREV);
      expect(borrowCap).to.eq(USDC_E_BORROW_CAP_PREV);
    });
  });

  testForkedNetworkVipCommands("VIP 420", await vip420(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check borrow cap for ZK", async () => {
      const borrowCap = await comptroller.borrowCaps(VZK_CORE);

      expect(borrowCap).to.eq(ZK_BORROW_CAP);
    });

    it("check supply and borrow cap for USDC.e", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_E_CORE);
      const borrowCap = await comptroller.borrowCaps(VUSDC_E_CORE);

      expect(supplyCap).to.eq(USDC_E_SUPPLY_CAP);
      expect(borrowCap).to.eq(USDC_E_BORROW_CAP);
    });
  });
});
