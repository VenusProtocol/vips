import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip485, { BORROW_CAP, vCAKE } from "../../vips/vip-485/bscmainnet";
import COMPTROLLER_ABI from "./abi/LegacyPoolComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(48581290, async () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", () => {
    it("check borrow cap", async () => {
      const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
      const borrowCap = await comptroller.borrowCaps(vCAKE);
      expect(borrowCap).equals(parseUnits("3749000", 18));
    });
  });

  testVip("VIP-485", await vip485(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check borrow cap", async () => {
      const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
      const borrowCap = await comptroller.borrowCaps(vCAKE);
      expect(borrowCap).equals(BORROW_CAP);
    });
  });
});
