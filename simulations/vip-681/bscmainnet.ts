import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  NEW_PRIME_SPEED_FOR_U,
  NEW_PRIME_SPEED_FOR_USDT,
  PRIME_LIQUIDITY_PROVIDER,
  U,
  USDT,
  vip681,
} from "../../vips/vip-681/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";

// Current on-chain speeds at the fork block (pre-VIP).
const CURRENT_USDT_SPEED = 2170138888888888n;
const CURRENT_U_SPEED = 0n;

forking(107050000, async () => {
  let plp: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
  });

  describe("Pre-VIP state", async () => {
    it("current prime reward distribution speeds", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(CURRENT_USDT_SPEED);
      expect(await plp.tokenDistributionSpeeds(U)).to.equal(CURRENT_U_SPEED);
    });
  });

  testVip("VIP-681", await vip681(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [2]);
    },
  });

  describe("Post-VIP state", async () => {
    it("new prime reward distribution speeds applied", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(NEW_PRIME_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(U)).to.equal(NEW_PRIME_SPEED_FOR_U);
    });

    it("new speeds stay under the configured maximum", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.lte(await plp.maxTokenDistributionSpeeds(USDT));
      expect(await plp.tokenDistributionSpeeds(U)).to.be.lte(await plp.maxTokenDistributionSpeeds(U));
    });
  });
});
