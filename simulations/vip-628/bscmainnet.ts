import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip628, {
  BORROW_MULTIPLIER,
  NEW_PRIME_SPEED_FOR_U,
  NEW_PRIME_SPEED_FOR_USDT,
  NEW_PRIME_SPEED_FOR_WBNB,
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  SUPPLY_MULTIPLIER,
  TEAM_MULTISIG,
  U,
  USDT,
  U_TO_SWEEP,
  VWBNB_CORE,
  WBNB,
  WBNB_MAX_DISTRIBUTION_SPEED,
} from "../../vips/vip-628/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";

const FORK_BLOCK = 102030242;

const PRIME_MIN_ABI = [
  "function markets(address) view returns (uint256 supplyMultiplier, uint256 borrowMultiplier, uint256 rewardIndex, uint256 sumOfMembersScore, bool exists)",
];
const PLP_MIN_ABI = [
  "function tokenDistributionSpeeds(address) view returns (uint256)",
  "function maxTokenDistributionSpeeds(address) view returns (uint256)",
  "function lastAccruedBlockOrSecond(address) view returns (uint256)",
];

forking(FORK_BLOCK, async () => {
  const prime = new ethers.Contract(PRIME, PRIME_MIN_ABI, ethers.provider);
  const plp = new ethers.Contract(PRIME_LIQUIDITY_PROVIDER, PLP_MIN_ABI, ethers.provider);
  const wbnb = new ethers.Contract(WBNB, ERC20_ABI, ethers.provider);
  const u = new ethers.Contract(U, ERC20_ABI, ethers.provider);
  const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);

  let plpWbnbBalanceBefore: BigNumber;
  let plpUBalanceBefore: BigNumber;
  let plpUsdtBalanceBefore: BigNumber;
  let teamMultisigUBalanceBefore: BigNumber;

  before(async () => {
    plpWbnbBalanceBefore = await wbnb.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    plpUBalanceBefore = await u.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    plpUsdtBalanceBefore = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    teamMultisigUBalanceBefore = await u.balanceOf(TEAM_MULTISIG);
  });

  describe("Pre-VIP state", () => {
    it("vWBNB_CORE is not yet a Prime market", async () => {
      const m = await prime.markets(VWBNB_CORE);
      expect(m.exists).to.be.false;
    });

    it("WBNB is not yet initialized in PrimeLiquidityProvider", async () => {
      expect(await plp.lastAccruedBlockOrSecond(WBNB)).to.equal(0);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(0);
    });

    it("PLP holds at least U_TO_SWEEP of U (seeded by VIP-620)", async () => {
      expect(plpUBalanceBefore).to.be.gte(U_TO_SWEEP);
    });

    it("USDT distribution speed is the VIP-620 value (sanity)", async () => {
      // VIP-620 set this; we will overwrite to the same nominal target.
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.gt(0);
    });
  });

  testVip("VIP-628 Prime Jun-2026 (add WBNB, sideline U)", await vip628(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_ABI], ["MarketAdded"], [1]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionInitialized"], [1]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["MaxTokenDistributionSpeedUpdated"], [1]);
      // 3 entries in setTokensDistributionSpeed (USDT, WBNB, U).
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [3]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["SweepToken"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("vWBNB_CORE registered as a Prime market with supply-only multipliers", async () => {
      const m = await prime.markets(VWBNB_CORE);
      expect(m.exists, "exists").to.be.true;
      expect(m.supplyMultiplier, "supplyMultiplier").to.equal(SUPPLY_MULTIPLIER);
      expect(m.borrowMultiplier, "borrowMultiplier").to.equal(BORROW_MULTIPLIER);
    });

    it("WBNB initialized in PrimeLiquidityProvider", async () => {
      expect(await plp.lastAccruedBlockOrSecond(WBNB)).to.be.gt(0);
    });

    it("WBNB max distribution speed set to canonical 1e18", async () => {
      expect(await plp.maxTokenDistributionSpeeds(WBNB)).to.equal(WBNB_MAX_DISTRIBUTION_SPEED);
    });

    it("distribution speeds: USDT + WBNB on, U zeroed", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT), "USDT speed").to.equal(NEW_PRIME_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(WBNB), "WBNB speed").to.equal(NEW_PRIME_SPEED_FOR_WBNB);
      expect(await plp.tokenDistributionSpeeds(U), "U speed").to.equal(NEW_PRIME_SPEED_FOR_U);
    });

    it("PLP U balance decreased by exactly U_TO_SWEEP", async () => {
      const after = await u.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(plpUBalanceBefore.sub(after)).to.equal(U_TO_SWEEP);
    });

    it("Team Multisig U balance increased by exactly U_TO_SWEEP", async () => {
      const after = await u.balanceOf(TEAM_MULTISIG);
      expect(after.sub(teamMultisigUBalanceBefore)).to.equal(U_TO_SWEEP);
    });

    it("PLP WBNB balance unchanged (swap is executed off-chain by the Team Multisig)", async () => {
      const after = await wbnb.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(after).to.equal(plpWbnbBalanceBefore);
    });

    it("PLP USDT balance unchanged (VIP does not touch USDT)", async () => {
      const after = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(after).to.equal(plpUsdtBalanceBefore);
    });
  });
});
