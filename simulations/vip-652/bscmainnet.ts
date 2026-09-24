import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  DEV_RECIPIENT,
  NEW_PRIME_SPEED_FOR_USDT,
  NEW_PRIME_SPEED_FOR_WBNB,
  PRIME_LIQUIDITY_PROVIDER,
  U,
  USDT,
  U_TO_SWEEP,
  WBNB,
  vip652,
} from "../../vips/vip-652/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import ERC20_ABI from "./abi/erc20.json";

// July 2026 Prime distribution speeds set by VIP-639, live on-chain.
const JULY_SPEED_FOR_USDT = "2777777777777778";
const JULY_SPEED_FOR_WBNB = "5094511114801";

// Fork shortly before proposal preparation; the live speeds are still the
// July (VIP-639) values here and the PLP already holds enough idle U to sweep.
forking(113800000, async () => {
  let plp: Contract;
  let u: Contract;

  let plpUBefore: BigNumber;
  let recipientUBefore: BigNumber;

  before(async () => {
    plp = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    u = await ethers.getContractAt(ERC20_ABI, U);
    plpUBefore = await u.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    recipientUBefore = await u.balanceOf(DEV_RECIPIENT);
  });

  describe("Pre-VIP state", async () => {
    it("prime reward distribution speeds are the July 2026 values", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(JULY_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(JULY_SPEED_FOR_WBNB);
    });

    it("U held in the PLP is idle (no distribution speed, nothing accrued)", async () => {
      expect(await plp.tokenDistributionSpeeds(U)).to.equal(0);
      expect(await plp.tokenAmountAccrued(U)).to.equal(0);
    });

    it("PLP holds at least U_TO_SWEEP of U", async () => {
      expect(plpUBefore).to.be.gte(U_TO_SWEEP);
    });
  });

  testVip("VIP-652", await vip652(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [2]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["SweepToken"], [1]);
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

    it("sweeps U_TO_SWEEP of U from the PLP to the dev recipient", async () => {
      const plpUAfter = await u.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      const recipientUAfter = await u.balanceOf(DEV_RECIPIENT);
      expect(plpUBefore.sub(plpUAfter)).to.equal(U_TO_SWEEP);
      expect(recipientUAfter.sub(recipientUBefore)).to.equal(U_TO_SWEEP);
    });
  });
});
