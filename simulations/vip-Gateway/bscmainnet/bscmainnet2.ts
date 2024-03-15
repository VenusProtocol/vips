import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import vipGateway from "../../../vips/vip-Gateway/bscmainnet";
import { UNITROLLER, vipSeizeVenus } from "../../../vips/vip-Gateway/bscmainnet2";
import { accounts3, accounts4, accounts5, accounts6 } from "../../../vips/vip-Gateway/users";
import CORE_POOL_ABI from "../abi/CorePoolComptroller.json";

const accounts = [...accounts3, ...accounts4, ...accounts5, ...accounts6];

const provider = ethers.provider;
let unitroller: Contract;

forking(36962090, () => {
  before(async () => {
    unitroller = new ethers.Contract(UNITROLLER, CORE_POOL_ABI, provider);

    await pretendExecutingVip(vipGateway());
  });

  testVip("VIP-SeizeVenus", vipSeizeVenus(), {
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
