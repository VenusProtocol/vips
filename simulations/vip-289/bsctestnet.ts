import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import vip289, {RESILIENT_ORACLE, BNBx, SlisBNB, StkBNB, WBETH, ankrBNB} from "../../vips/vip-289/bsctestnet";
import { forking, testVip } from "../../src/vip-framework";

forking(39540656, () => {
  let resilientOracle: Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
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

    it("check ankrBNB price", async () => {
      await expect(resilientOracle.getPrice(ankrBNB)).to.be.reverted;
    })
  });

  testVip("VIP-189", vip289(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check BNBx price", async () => {
      const price = await resilientOracle.getPrice(BNBx);
      expect(price).to.be.equal(parseUnits("1009.594241515682316144", "18"));
    })

    it("check SlisBNB price", async () => {
      const price = await resilientOracle.getPrice(SlisBNB);
      expect(price).to.be.equal(parseUnits("2278.444399416782466662", "18"));
    })

    it("check StkBNB price", async () => {
      const price = await resilientOracle.getPrice(StkBNB);
      expect(price).to.be.equal(parseUnits("549.021894676872956494", "18"));
    })

    it("check WBETH price", async () => {
      const price = await resilientOracle.getPrice(WBETH);
      expect(price).to.be.equal(parseUnits("3205.63805656681001445", "18"));
    })

    it("check ankrBNB price", async () => {
      const price = await resilientOracle.getPrice(ankrBNB);
      expect(price).to.be.equal(parseUnits("587.230852111249510215", "18"));
    })
  });
});
