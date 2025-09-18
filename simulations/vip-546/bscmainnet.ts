import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { SUPPLY_CAP, vSolvBTC, vip546 } from "../../vips/vip-546/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(60700331, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(bscmainnet.UNITROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vSolvBTC supply cap", async () => {
      const OLD_vSolvBTC_SUPPLY_CAP = ethers.utils.parseUnits("2000", 18);

      const supplyCap = await coreComptroller.supplyCaps(vSolvBTC);
      expect(supplyCap).equals(OLD_vSolvBTC_SUPPLY_CAP);
    });
  });

  testVip("VIP-546", await vip546(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check vSolvBTC supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vSolvBTC);
      expect(supplyCap).equals(SUPPLY_CAP);
    });
  });
});
