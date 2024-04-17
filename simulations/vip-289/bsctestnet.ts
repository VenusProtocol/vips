import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip289, { BNBx, RESILIENT_ORACLE, SlisBNB, StkBNB, WBETH, ankrBNB } from "../../vips/vip-289/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

forking(39541360, () => {
  let resilientOracle: Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).to.be.equal(parseUnits("342.50005266", "18"));
    });

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("217", "18"));
    });

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("328.36", "18"));
    });

    it("check WBETH price", async () => {
      await expect(resilientOracle.getPrice(WBETH)).to.be.reverted;
    });

    it("check ankrBNB price", async () => {
      await expect(resilientOracle.getPrice(ankrBNB)).to.be.reverted;
    });
  });

  testVip("VIP-189", vip289(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).to.be.equal(parseUnits("1009.413273929366176833", "18"));
    });

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("2278.035993181323985178", "18"));
    });

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("548.923483688548352386", "18"));
    });

    it("check WBETH price", async () => {
      const price = await resilientOracle.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3205.63805656681001445", "18"));
    });

    it("check ankrBNB price", async () => {
      const price = await resilientOracle.getPrice(ankrBNB);
      expect(price).to.be.equal(parseUnits("587.125592249864601686", "18"));
    });
  });
});
