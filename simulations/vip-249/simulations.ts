import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { COMPTROLLER, FDUSD_SUPPLY, OLD_FDUSD_SUPPLY, vFDUSD, vip249 } from "../../vips/vip-249/bscmainnet";
import COMTROLLER_ABI from "./abi/comptroller.json";

forking(35700072, async () => {
  const provider = ethers.provider;
  let corePoolComptroller: Contract;

  before(async () => {
    corePoolComptroller = new ethers.Contract(COMPTROLLER, COMTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify FDUSD supply cap", async () => {
      const fdusdSupplyCap = await corePoolComptroller.supplyCaps(vFDUSD);
      expect(fdusdSupplyCap).equals(OLD_FDUSD_SUPPLY);
    });
  });

  testVip("VIP-249 Chaos Labs Recommendations", await vip249(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify FDUSD supply cap", async () => {
      const fdusdSupplyCap = await corePoolComptroller.supplyCaps(vFDUSD);
      expect(fdusdSupplyCap).equals(FDUSD_SUPPLY);
    });
  });
});
