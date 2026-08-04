import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  NEW_PRIME_SPEED_FOR_USDT,
  NEW_PRIME_SPEED_FOR_WBNB,
  PRIME_LIQUIDITY_PROVIDER,
  USDT,
  WBNB,
  vip664,
} from "../../vips/vip-664/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";

// July 2026 Prime distribution speeds set by VIP-639, live on-chain.
const JULY_SPEED_FOR_USDT = "2777777777777778";
const JULY_SPEED_FOR_WBNB = "5094511114801";

// Fork shortly before proposal preparation; the live speeds are still the
// July (VIP-639) values here.
forking(112000000, async () => {
  let plp: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
  });

  describe("Pre-VIP state", async () => {
    it("prime reward distribution speeds are the July 2026 values", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(JULY_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(JULY_SPEED_FOR_WBNB);
    });
  });

  testVip("VIP-664", await vip664(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [2]);
    },
  });

  describe("Post-VIP state", async () => {
    it("August 2026 prime reward distribution speeds applied", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(NEW_PRIME_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(NEW_PRIME_SPEED_FOR_WBNB);
    });

    it("new speeds stay under the configured maximum", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.lte(await plp.maxTokenDistributionSpeeds(USDT));
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.be.lte(await plp.maxTokenDistributionSpeeds(WBNB));
    });
  });
});
