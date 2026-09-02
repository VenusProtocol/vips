import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BORROW_MULTIPLIER,
  NEW_PRIME_SPEED_FOR_U,
  NEW_PRIME_SPEED_FOR_USDT,
  NEW_PRIME_SPEED_FOR_WBNB,
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  SUPPLY_MULTIPLIER,
  U,
  USDT,
  VU,
  WBNB,
  vip665,
} from "../../vips/vip-665/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import PRIME_V2_ABI from "./abi/PrimeV2.json";

// August 2026 Prime distribution speeds set by VIP-652, live on-chain at the fork block.
const AUGUST_SPEED_FOR_USDT = "8506944444444444";
const AUGUST_SPEED_FOR_WBNB = "6166906433170";

// Fork before proposal preparation: PrimeV2 is live (VIP-637 executed), vU is not yet a
// Prime market, and the August (VIP-652) speeds are still the live values.
const FORK_BLOCK = 118190000;

forking(FORK_BLOCK, async () => {
  let prime: Contract;
  let plp: Contract;

  before(async () => {
    prime = await ethers.getContractAt(PRIME_V2_ABI, PRIME);
    plp = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
  });

  describe("Pre-VIP state", async () => {
    it("PLP rewards vault is pointed at PrimeV2", async () => {
      expect(await plp.prime()).to.equal(PRIME);
    });

    it("vU is not yet a Prime market", async () => {
      const market = await prime.markets(VU);
      expect(market.exists).to.equal(false);
      expect(await prime.vTokenForAsset(U)).to.equal(ethers.constants.AddressZero);
      expect(await prime.getAllMarkets()).to.not.include(VU);
    });

    it("prime reward distribution speeds are the August 2026 values", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(AUGUST_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(U)).to.equal(0);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(AUGUST_SPEED_FOR_WBNB);
    });

    it("USDT, U and WBNB are already configured reward tokens (max speed 1e18)", async () => {
      expect(await plp.maxTokenDistributionSpeeds(USDT)).to.equal(ethers.utils.parseUnits("1", 18));
      expect(await plp.maxTokenDistributionSpeeds(U)).to.equal(ethers.utils.parseUnits("1", 18));
      expect(await plp.maxTokenDistributionSpeeds(WBNB)).to.equal(ethers.utils.parseUnits("1", 18));
    });
  });

  testVip("VIP-665 September 2026 Prime Allocation", await vip665(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // Exactly one MarketAdded (vU) and one speed update per token.
      await expectEvents(txResponse, [PRIME_V2_ABI], ["MarketAdded"], [1]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [3]);

      // Argument-level assertions: the vU market is added on the borrow side, and each token's
      // speed transitions from its August value to the September value.
      await expect(txResponse).to.emit(prime, "MarketAdded").withArgs(VU, SUPPLY_MULTIPLIER, BORROW_MULTIPLIER);
      await expect(txResponse)
        .to.emit(plp, "TokenDistributionSpeedUpdated")
        .withArgs(USDT, AUGUST_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_USDT);
      await expect(txResponse).to.emit(plp, "TokenDistributionSpeedUpdated").withArgs(U, 0, NEW_PRIME_SPEED_FOR_U);
      await expect(txResponse)
        .to.emit(plp, "TokenDistributionSpeedUpdated")
        .withArgs(WBNB, AUGUST_SPEED_FOR_WBNB, NEW_PRIME_SPEED_FOR_WBNB);
    },
  });

  describe("Post-VIP state", async () => {
    it("vU is enabled as a Prime market on the borrow side (supplyMultiplier 0, borrowMultiplier 2e18)", async () => {
      const market = await prime.markets(VU);
      expect(market.exists).to.equal(true);
      expect(market.supplyMultiplier).to.equal(SUPPLY_MULTIPLIER);
      expect(market.borrowMultiplier).to.equal(BORROW_MULTIPLIER);
      expect(await prime.vTokenForAsset(U)).to.equal(VU);
      expect(await prime.getAllMarkets()).to.include(VU);
    });

    it("September 2026 prime reward distribution speeds applied (wBNB rewards ended)", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(NEW_PRIME_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(U)).to.equal(NEW_PRIME_SPEED_FOR_U);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(NEW_PRIME_SPEED_FOR_WBNB);
      expect(NEW_PRIME_SPEED_FOR_WBNB).to.equal(0);
    });

    it("new speeds stay under the configured maximum", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.lte(await plp.maxTokenDistributionSpeeds(USDT));
      expect(await plp.tokenDistributionSpeeds(U)).to.be.lte(await plp.maxTokenDistributionSpeeds(U));
    });
  });
});
