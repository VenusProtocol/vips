import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip485 from "../../vips/vip-485/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

forking(48492804, async () => {
  const provider = ethers.provider;

  const vBNB = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check reserve factor", async () => {
      expect(await vBNB.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.3", 18));
    });
  });

  testVip("VIP-485", await vip485(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_CORE_POOL_ABI], ["NewReserveFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check reserve factor", async () => {
      expect(await vBNB.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.1", 18));
    });
  });
});
