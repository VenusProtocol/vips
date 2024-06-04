import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import vip319 from "../../vips/vip-319/bscmainnet";
import vip320 from "../../vips/vip-320/bscmainnet";
import vip321, { NEW_IR, vBNBAdmin } from "../../vips/vip-321/bscmainnet";
import VTOKEN_ABI from "./abi/vToken.json";

const OLD_IR = "0xa741125f4d6b9777a115b326E577F9b4004CB481";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(39313449, async () => {
  let vBNBContract: Contract;

  before(async () => {
    await pretendExecutingVip(vip319());
    await pretendExecutingVip(vip320());
    await impersonateAccount(NORMAL_TIMELOCK);
    vBNBContract = new ethers.Contract(vBNBAdmin, VTOKEN_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
  });

  describe("Pre-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vBNBContract.interestRateModel();
      expect(ir).to.be.equal(OLD_IR);
    });

    it("IR parameters checks", async () => {
      checkInterestRate(OLD_IR, "vBNB", {
        base: "0",
        multiplier: "0.625",
        jump: "6.8",
        kink: "0.8",
      });
    });
  });

  testVip("VIP-321", vip321(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vBNBContract.interestRateModel();
      expect(ir).to.be.equal(NEW_IR);
    });

    it("IR parameters checks", async () => {
      checkInterestRate(NEW_IR, "vBNB", {
        base: "0",
        multiplier: "0.225",
        jump: "6.8",
        kink: "0.8",
      });
    });
  });
});
