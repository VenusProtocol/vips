import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip342, { NEW_IR, OLD_IR, VBNB } from "../../vips/vip-342/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

forking(40605412, async () => {
  let vbnb: Contract;
  const provider = ethers.provider;

  before(async () => {
    vbnb = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Validate IR address", async () => {
      const IR = await vbnb.interestRateModel();
      expect(IR).equals(OLD_IR);
    });

    it("OLD IRM parameters checks", async () => {
      await checkInterestRate(OLD_IR, "VBNB_CORE", {
        base: "0",
        multiplier: "0.225",
        jump: "6.8",
        kink: "0.8",
      });
    });
  });

  testVip("VIP-342 Chaos lab recommendation", await vip342(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_CORE_POOL_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Validate IR address", async () => {
      const IR = await vbnb.interestRateModel();
      expect(IR).equals(NEW_IR);
    });

    it("NEW IRM parameters checks", async () => {
      await checkInterestRate(NEW_IR, "VBNB_CORE", {
        base: "0",
        multiplier: "0.225",
        jump: "6.8",
        kink: "0.7",
      });
    });
  });
});
