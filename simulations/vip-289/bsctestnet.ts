import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import vip289, {RESILIENT_ORACLE, BNBx, SlisBNB, StkBNB, WBETH} from "../../vips/vip-289/bsctestnet";
import { forking, testVip } from "../../src/vip-framework";

forking(39540184, () => {
  let resilientOracle: Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      console.log(price)
      expect(price).to.be.equal(parseUnits("342.50005266", "18"));
    })

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("217", "18"));
    })

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("328.36", "18"));
    })

    it("check WBETH price", async () => {
      await expect(resilientOracle.getPrice(WBETH)).to.be.reverted;
    })
  });

  testVip("VIP-189", vip289(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).to.be.equal(parseUnits("1009.963489981467902562", "18"));
    })

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("2279.277716470571684865", "18"));
    })

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("549.222693655270241816", "18"));
    })

    it("check WBETH price", async () => {
      const price = await resilientOracle.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("0.000000000000000001", "18"));
    })
  });
});
