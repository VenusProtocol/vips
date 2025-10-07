import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { TWT_SUPPLY_CAP, asBNB_SUPPLY_CAP, vTWT, vasBNB, vip553 } from "../../vips/vip-553/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(63757326, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(bscmainnet.UNITROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check asBNB supply cap", async () => {
      const OLD_asBNB_SUPPLY_CAP = ethers.utils.parseUnits("72000", 18);

      const supplyCap = await coreComptroller.supplyCaps(vasBNB);
      expect(supplyCap).equals(OLD_asBNB_SUPPLY_CAP);
    });

    it("check TWT supply cap", async () => {
      const OLD_TWT_SUPPLY_CAP = ethers.utils.parseUnits("4000000", 18);

      const supplyCap = await coreComptroller.supplyCaps(vTWT);
      expect(supplyCap).equals(OLD_TWT_SUPPLY_CAP);
    });
  });

  testVip("VIP-553", await vip553(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check asBNB supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vasBNB);
      expect(supplyCap).equals(asBNB_SUPPLY_CAP);
    });

    it("check TWT supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vTWT);
      expect(supplyCap).equals(TWT_SUPPLY_CAP);
    });
  });
});
