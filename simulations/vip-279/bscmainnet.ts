import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { UNITROLLER, vip279 } from "../../vips/vip-279/bscmainnet";
import { accounts3, accounts4, accounts5, accounts6 } from "../../vips/vip-279/users";
import CORE_POOL_ABI from "./abi/CorePoolComptroller.json";

const accounts = [...accounts3, ...accounts4, ...accounts5, ...accounts6];

const provider = ethers.provider;
let unitroller: Contract;

forking(37478158, async () => {
  before(async () => {
    unitroller = new ethers.Contract(UNITROLLER, CORE_POOL_ABI, provider);
  });

  testVip("VIP-279", await vip279(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_POOL_ABI], ["VenusSeized", "VenusGranted"], [12, 4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("venus accrued of users should be zero", async () => {
      for (const account of accounts) {
        const venusAccrued = await unitroller.venusAccrued(account);
        expect(venusAccrued).to.be.equal(0);
      }
    });
  });
});
