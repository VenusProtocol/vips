import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import { COMPTROLLER, vip258 } from "../../vips/vip-258/bsctestnet";
import ACM_ABI from "./abi/acm.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";

forking(37883328, () => {
  let comptroller: ethers.Contract;

  before(async () => {
    impersonateAccount(NORMAL_TIMELOCK);
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
  });

  testVip("VIP-258 Fix ACM in Comptroller", vip258(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewAccessControl"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [16]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("Check if normal timelock is allowed set CF", async () => {
      await expect(comptroller._setCollateralFactor(vBTC, 100)).to.be.not.reverted;
    });
  });
});
