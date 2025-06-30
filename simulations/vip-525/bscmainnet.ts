import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  vasBNB_BSC,
  vasBNB_BSC_SUPPLY_CAP,
  vip525,
  vxSolvBTC_BSC,
  vxSolvBTC_BSC_SUPPLY_CAP,
} from "../../vips/vip-525/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(52200036, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(bscmainnet.UNITROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vasBNB supply cap", async () => {
      const OLD_vasBNB_BSC_SUPPLY_CAP = ethers.utils.parseUnits("6000", 18);

      const supplyCap = await coreComptroller.supplyCaps(vasBNB_BSC);
      expect(supplyCap).equals(OLD_vasBNB_BSC_SUPPLY_CAP);
    });

    it("check vxSolvBTC supply cap", async () => {
      const OLD_vxSolvBTC_BSC_SUPPLY_CAP = ethers.utils.parseUnits("500", 18);

      const supplyCap = await coreComptroller.supplyCaps(vxSolvBTC_BSC);
      expect(supplyCap).equals(OLD_vxSolvBTC_BSC_SUPPLY_CAP);
    });
  });

  testVip("VIP-525", await vip525(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check vasBNB supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vasBNB_BSC);
      expect(supplyCap).equals(vasBNB_BSC_SUPPLY_CAP);
    });

    it("check vxSolvBTC supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vxSolvBTC_BSC);
      expect(supplyCap).equals(vxSolvBTC_BSC_SUPPLY_CAP);
    });
  });
});
