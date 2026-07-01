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
  vip681,
} from "../../vips/vip-681/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";

// Fork after the PrimeV2 migration critical VIP, which zeroed every legacy Prime
// distribution speed — so both markets start at 0 here.
forking(107390000, async () => {
  let plp: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
  });

  describe("Pre-VIP state", async () => {
    it("prime reward distribution speeds are zeroed by the migration freeze", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(0);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(0);
    });
  });

  testVip("VIP-681", await vip681(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [2]);
    },
  });

  describe("Post-VIP state", async () => {
    it("July 2026 prime reward distribution speeds applied", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(NEW_PRIME_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(NEW_PRIME_SPEED_FOR_WBNB);
    });

    it("new speeds stay under the configured maximum", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.lte(await plp.maxTokenDistributionSpeeds(USDT));
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.be.lte(await plp.maxTokenDistributionSpeeds(WBNB));
    });
  });
});
