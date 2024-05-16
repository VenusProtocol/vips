import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import vip304, { RESILIENT_ORACLE, lisUSD } from "../../vips/vip-304/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

forking(40377063, () => {
  const provider = ethers.provider;
  let oracle: Contract;

  before(async () => {
    oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("get price", async () => {
      const price = await oracle.getPrice(lisUSD);
      expect(price).to.equal(parseUnits("0.9990706", 18));
    });
  });

  testVip("Update Oracle Config", vip304());

  describe("Post-VIP state", () => {
    it("get price", async () => {
      const price = await oracle.getPrice(lisUSD);
      expect(price).to.equal(parseUnits("1", 18));
    });
  });
});
