import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { COMPTROLLER, FDUSD_SUPPLY, OLD_FDUSD_SUPPLY, vFDUSD, vip248 } from "../../vips/vip-248/bscmainnet";
import COMTROLLER_ABI from "./abi/comptroller.json";

forking(35700072, () => {
  const provider = ethers.provider;
  let corePoolComptroller: ethers.Contract;

  before(async () => {
    corePoolComptroller = new ethers.Contract(COMPTROLLER, COMTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify FDUSD supply cap", async () => {
      const fdusdSupplyCap = await corePoolComptroller.supplyCaps(vFDUSD);
      expect(fdusdSupplyCap).equals(OLD_FDUSD_SUPPLY);
    });
  });

  testVip("VIP-248 Chaos Labs Recommendations", vip248(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify UNI supply cap", async () => {
      const uniSupplyCap = await corePoolComptroller.supplyCaps(vFDUSD);
      expect(uniSupplyCap).equals(FDUSD_SUPPLY);
    });
  });
});
