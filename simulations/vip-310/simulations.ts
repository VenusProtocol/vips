import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip310, { BNB, BTC, RESILIENT_ORACLE } from "../../vips/vip-310/bscmainnet";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import REDSTONE_ORACLE_ABI from "./abi/redstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

forking(38912197, () => {
  const provider = ethers.provider;
  let oracle: Contract;

  before(async () => {
    oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("validate price", async () => {
      const bnbPrice = await oracle.getPrice(BNB);
      expect(bnbPrice).to.equal(parseUnits("620.30", 18));

      const btcPrice = await oracle.getPrice(BTC);
      expect(btcPrice).to.equal(parseUnits("70979.20075", 18));
    });
  });

  testVip("Update BTC and BNB Price Config", vip310(60 * 60 * 24 * 7), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [REDSTONE_ORACLE_ABI], ["TokenConfigAdded"], [4]);
      await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [2]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [2]);
    },
  });

  describe("Post-VIP state", () => {
    it("validate price", async () => {
      const bnbPrice = await oracle.getPrice(BNB);
      expect(bnbPrice).to.equal(parseUnits("620.17", 18));

      const btcPrice = await oracle.getPrice(BTC);
      expect(btcPrice).to.equal(parseUnits("71016.69433197", 18));
    });
  });
});
