import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vasBNB_BSC, vasBNB_BSC_SUPPLY_CAP, vip527 } from "../../vips/vip-527/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(52607590, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(bscmainnet.UNITROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vasBNB supply cap", async () => {
      const OLD_vasBNB_BSC_SUPPLY_CAP = ethers.utils.parseUnits("24000", 18);

      const supplyCap = await coreComptroller.supplyCaps(vasBNB_BSC);
      expect(supplyCap).equals(OLD_vasBNB_BSC_SUPPLY_CAP);
    });
  });

  testVip("VIP-527", await vip527(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check vasBNB supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vasBNB_BSC);
      expect(supplyCap).equals(vasBNB_BSC_SUPPLY_CAP);
    });
  });
});
