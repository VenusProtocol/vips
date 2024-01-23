import { ethers } from "hardhat";
import { forking, testVip } from "../../../src/vip-framework";
import { vip244, ACM, NORMAL_TIMELOCK, UNITROLLER } from "../../../vips/vip-244/vip-244-testnet";

import ACM_ABI from "./abi/ACM.json";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

forking(37099393, () => {
  let acm: ethers.Contract

  before(async () => {
    impersonateAccount(UNITROLLER);
    acm = new ethers.Contract(ACM, ACM_ABI, await ethers.getSigner(UNITROLLER));
  });

  testVip("VIP-244 Unlist Market", vip244(), {
    callbackAfterExecution: async txResponse => {
    },
  });

  describe("ACM", () => {
    it("should have the correct call permissions", async () => {
      const callPermissions = await acm.isAllowedToCall(NORMAL_TIMELOCK, "unlistMarket(address)");
      expect(callPermissions).to.be.true;
    });
  })
});
