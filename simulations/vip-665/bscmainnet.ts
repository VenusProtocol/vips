import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  DEV_RECIPIENT,
  NEW_PRIME_SPEED_FOR_U,
  NEW_PRIME_SPEED_FOR_USDT,
  PRIME_LIQUIDITY_PROVIDER,
  U,
  USDT,
  U_TO_SWEEP,
  vip665,
} from "../../vips/vip-665/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import PRIME_V2_ABI from "./abi/PrimeV2.json";

const PRIME = "0x059EabA8676b03e4e8f009eFb7F587C28450F50f";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// September 2026 Prime distribution speeds set by VIP-660, live on-chain at the fork block.
const SEPTEMBER_SPEED_FOR_USDT = "11111111111111111";
const SEPTEMBER_SPEED_FOR_U = "2777777777777777";

// Fork after VIP-660 executed: the September speeds are live and the Prime market set is
// vUSDT / vWBNB / vU.
const FORK_BLOCK = 124835000;

// At the fork block the default proposer Safe (VIP Proposal 1.67M) still has VIP-664 in its
// voting period, and GovernorBravo allows one live proposal per proposer, so the simulation
// proposes from the other VIP proposer Safe (VIP Proposal 1M). The 1.67M Safe can still vote,
// so it joins the framework's default supporters to clear quorum.
const PROPOSER = "0xe5e62386933b74eA81BFd73A6a6591598E7f8cED";
const SUPPORTERS = [
  "0x34221485302f6F2029660a000908B5FCABB9BC6e",
  "0xc444949e0054a23c44fc45789738bdf64aed2391",
  "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
];

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

forking(FORK_BLOCK, async () => {
  let prime: Contract;
  let plp: Contract;
  let u: Contract;
  let marketsBefore: string[];
  let plpUBefore: BigNumber;
  let recipientUBefore: BigNumber;

  before(async () => {
    prime = await ethers.getContractAt(PRIME_V2_ABI, PRIME);
    plp = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    u = await ethers.getContractAt(ERC20_ABI, U);
    marketsBefore = await prime.getAllMarkets();
    plpUBefore = await u.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    recipientUBefore = await u.balanceOf(DEV_RECIPIENT);
  });

  describe("Pre-VIP state", async () => {
    it("PLP rewards vault is pointed at PrimeV2", async () => {
      expect(await plp.prime()).to.equal(PRIME);
    });

    it("prime reward distribution speeds are the September 2026 values", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(SEPTEMBER_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(U)).to.equal(SEPTEMBER_SPEED_FOR_U);
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(0);
    });

    it("USDT and U are already configured reward tokens (max speed 1e18)", async () => {
      expect(await plp.maxTokenDistributionSpeeds(USDT)).to.equal(ethers.utils.parseUnits("1", 18));
      expect(await plp.maxTokenDistributionSpeeds(U)).to.equal(ethers.utils.parseUnits("1", 18));
    });

    it("PLP holds enough unaccrued U for the sweep plus the October U leg", async () => {
      const accrued = await plp.tokenAmountAccrued(U);
      const octoberULeg = NEW_PRIME_SPEED_FOR_U.mul(192000 * 30);
      expect(plpUBefore.sub(accrued)).to.be.gte(U_TO_SWEEP.add(octoberULeg));
    });
  });

  testVip("VIP-665 Prime Rewards Allocation — October 2026", await vip665(), {
    proposer: PROPOSER,
    supporters: SUPPORTERS,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // Exactly one speed update per token, one sweep, and no market change.
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [2]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["SweepToken"], [1]);
      await expectEvents(txResponse, [PRIME_V2_ABI], ["MarketAdded"], [0]);
      await expect(txResponse).to.emit(plp, "SweepToken").withArgs(U, DEV_RECIPIENT, U_TO_SWEEP);

      await expect(txResponse)
        .to.emit(plp, "TokenDistributionSpeedUpdated")
        .withArgs(USDT, SEPTEMBER_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_USDT);
      await expect(txResponse)
        .to.emit(plp, "TokenDistributionSpeedUpdated")
        .withArgs(U, SEPTEMBER_SPEED_FOR_U, NEW_PRIME_SPEED_FOR_U);
    },
  });

  describe("Post-VIP state", async () => {
    it("October 2026 prime reward distribution speeds applied ($40K USDT, $10K U over 30 days)", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.equal(NEW_PRIME_SPEED_FOR_USDT);
      expect(await plp.tokenDistributionSpeeds(U)).to.equal(NEW_PRIME_SPEED_FOR_U);
      expect(NEW_PRIME_SPEED_FOR_USDT).to.equal("6944444444444444");
      expect(NEW_PRIME_SPEED_FOR_U).to.equal("1736111111111111");
    });

    it("wBNB Prime rewards stay ended", async () => {
      expect(await plp.tokenDistributionSpeeds(WBNB)).to.equal(0);
    });

    it("new speeds stay under the configured maximum", async () => {
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.lte(await plp.maxTokenDistributionSpeeds(USDT));
      expect(await plp.tokenDistributionSpeeds(U)).to.be.lte(await plp.maxTokenDistributionSpeeds(U));
    });

    it("sweeps 20,000 U from the PLP to the dev recipient", async () => {
      expect(plpUBefore.sub(await u.balanceOf(PRIME_LIQUIDITY_PROVIDER))).to.equal(U_TO_SWEEP);
      expect((await u.balanceOf(DEV_RECIPIENT)).sub(recipientUBefore)).to.equal(U_TO_SWEEP);
    });

    it("the sweep leaves every U already accrued to Prime in the PLP", async () => {
      expect(await u.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.be.gte(await plp.tokenAmountAccrued(U));
    });

    it("the Prime market set is unchanged", async () => {
      expect(await prime.getAllMarkets()).to.deep.equal(marketsBefore);
    });
  });
});
