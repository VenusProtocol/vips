import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vU, vip581AddendumTestnet } from "../../vips/vip-581/addendum-testnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;

forking(84046862, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  testVip("VIP-581 Testnet", await vip581AddendumTestnet(), {
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
