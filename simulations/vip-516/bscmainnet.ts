import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip516, vxSolvBTC_BSC, vxSolvBTC_BSC_SUPPLY_CAP } from "../../vips/vip-516/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(51606568, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(bscmainnet.UNITROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vxSolvBTC supply cap", async () => {
      const OLD_vxSolvBTC_BSC_SUPPLY_CAP = ethers.utils.parseUnits("150", 18);

      const supplyCap = await coreComptroller.supplyCaps(vxSolvBTC_BSC);
      expect(supplyCap).equals(OLD_vxSolvBTC_BSC_SUPPLY_CAP);
    });
  });

  testVip("VIP-516", await vip516(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check vxSolvBTC supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vxSolvBTC_BSC);
      expect(supplyCap).equals(vxSolvBTC_BSC_SUPPLY_CAP);
    });
  });
});
