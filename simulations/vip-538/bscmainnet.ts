import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vSolvBTC, vSolvBTC_SUPPLY_CAP, vip538, vxSolvBTC, vxSolvBTC_SUPPLY_CAP } from "../../vips/vip-538/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(56888647, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(bscmainnet.UNITROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vSolvBTC supply cap", async () => {
      const OLD_vSolvBTC_SUPPLY_CAP = ethers.utils.parseUnits("1720", 18);

      const supplyCap = await coreComptroller.supplyCaps(vSolvBTC);
      expect(supplyCap).equals(OLD_vSolvBTC_SUPPLY_CAP);
    });

    it("check vxSolvBTC supply cap", async () => {
      const OLD_vxSolvBTC_SUPPLY_CAP = ethers.utils.parseUnits("750", 18);

      const supplyCap = await coreComptroller.supplyCaps(vxSolvBTC);
      expect(supplyCap).equals(OLD_vxSolvBTC_SUPPLY_CAP);
    });
  });

  testVip("VIP-538", await vip538(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check vSolvBTC supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vSolvBTC);
      expect(supplyCap).equals(vSolvBTC_SUPPLY_CAP);
    });

    it("check vxSolvBTC supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vxSolvBTC);
      expect(supplyCap).equals(vxSolvBTC_SUPPLY_CAP);
    });
  });
});
