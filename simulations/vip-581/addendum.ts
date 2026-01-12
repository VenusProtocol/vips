import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vU, vip581GuardianAddendum } from "../../vips/vip-581/addendum";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const bscmainnet = NETWORK_ADDRESSES.bscmainnet;

forking(74980680, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  testVip("VIP-581", await vip581GuardianAddendum(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["BorrowAllowedUpdated"], [1]);
    },
  });

  describe("Post-VIP checks", () => {
    it("vu has borrowing enabled", async () => {
      const marketData = await comptroller.poolMarkets(0, vU);
      expect(marketData.isBorrowAllowed).to.be.equal(true);
    });
  });
});
