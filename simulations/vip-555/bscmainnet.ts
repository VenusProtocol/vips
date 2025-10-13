import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { asBNB_SUPPLY_CAP, vasBNB, vip555 } from "../../vips/vip-555/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(64530596, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(bscmainnet.UNITROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check asBNB supply cap", async () => {
      const OLD_asBNB_SUPPLY_CAP = ethers.utils.parseUnits("108000", 18);

      const supplyCap = await coreComptroller.supplyCaps(vasBNB);
      expect(supplyCap).equals(OLD_asBNB_SUPPLY_CAP);
    });
  });

  testVip("VIP-555", await vip555(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check asBNB supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vasBNB);
      expect(supplyCap).equals(asBNB_SUPPLY_CAP);
    });
  });
});
