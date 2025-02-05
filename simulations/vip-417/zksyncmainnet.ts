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
  ZK_SUPPLY_CAP,
  vip417,
} from "../../vips/vip-417/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const USDC_E_SUPPLY_CAP_PREV = parseUnits("6000000", 6);
const USDC_E_BORROW_CAP_PREV = parseUnits("5400000", 6);
const ZK_SUPPLY_CAP_PREV = parseUnits("50000000", 18);

forking(52967946, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply cap for ZK", async () => {
      const supplyCap = await comptroller.supplyCaps(VZK_CORE);

      expect(supplyCap).to.eq(ZK_SUPPLY_CAP_PREV);
    });

    it("check supply and borrow cap for USDC.e", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_E_CORE);
      const borrowCap = await comptroller.borrowCaps(VUSDC_E_CORE);

      expect(supplyCap).to.eq(USDC_E_SUPPLY_CAP_PREV);
      expect(borrowCap).to.eq(USDC_E_BORROW_CAP_PREV);
    });
  });

  testForkedNetworkVipCommands("VIP 417 Multichain Governance - Permissions", await vip417(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [2, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply cap for ZK", async () => {
      const supplyCap = await comptroller.supplyCaps(VZK_CORE);

      expect(supplyCap).to.eq(ZK_SUPPLY_CAP);
    });

    it("check supply and borrow cap for USDC.e", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_E_CORE);
      const borrowCap = await comptroller.borrowCaps(VUSDC_E_CORE);

      expect(supplyCap).to.eq(USDC_E_SUPPLY_CAP);
      expect(borrowCap).to.eq(USDC_E_BORROW_CAP);
    });
  });
});
