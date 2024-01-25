import { ethers } from "hardhat";
import { forking, testVip } from "../../../src/vip-framework";
import { vip244, ACM, NORMAL_TIMELOCK, UNITROLLER } from "../../../vips/vip-244/bsctestnet";

import ACM_ABI from "./abi/ACM.json";
import COMPTROLLER_FACET_ABI from "./abi/comptroller.json";
import UPGRADABLE_BEACON_ABI from "./abi/upgradableBeacon.json";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { expectEvents } from "../../../src/utils";

forking(37164546, () => {
  let acm: ethers.Contract
  let comptroller: ethers.Contract

  before(async () => {
    impersonateAccount(UNITROLLER);
    impersonateAccount(NORMAL_TIMELOCK);

    acm = new ethers.Contract(ACM, ACM_ABI, await ethers.getSigner(UNITROLLER));
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_FACET_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
  });

  describe("Pre-VIP", () => {
    it("should have the correct call permissions", async () => {
      const callPermissions = await acm.isAllowedToCall(NORMAL_TIMELOCK, "unlistMarket(address)");
      expect(callPermissions).to.be.false;
    });
  })

  testVip("VIP-244 Unlist Market", vip244(), {
    callbackAfterExecution: async txResponse => {
      expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [3])
      expectEvents(
        txResponse, 
        [COMPTROLLER_FACET_ABI], 
        ["NewSupplyCap", "NewBorrowCap", "ActionPausedMarket", "NewCollateralFactor", "MarketUnlisted"], 
        [2, 2, 12, 2, 2]
      )
      expectEvents(txResponse, [UPGRADABLE_BEACON_ABI], ["Upgraded"], [1])
    },
  });

  describe("Post-VIP", () => {
    it("should have the correct call permissions", async () => {
      const callPermissions = await acm.isAllowedToCall(NORMAL_TIMELOCK, "unlistMarket(address)");
      expect(callPermissions).to.be.true;
    });
  })
});
