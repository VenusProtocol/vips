import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { NEW_PRIME_SPEED_FOR_USDT, PRIME_LIQUIDITY_PROVIDER, USDT, vip610 } from "../../vips/vip-610/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";

const FORK_BLOCK = 84413882;

forking(FORK_BLOCK, async () => {
  let primeLiquidityProvider: Contract;

  before(async () => {
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
  });

  describe("Speed calculation", () => {
    it("NEW_PRIME_SPEED_FOR_USDT distributes $22,000 over 31 days at 192,000 blocks/day", () => {
      const totalDistributed = NEW_PRIME_SPEED_FOR_USDT.mul(BigNumber.from(192000)).mul(BigNumber.from(31));
      expect(totalDistributed).to.be.closeTo(parseUnits("22000", 18), parseUnits("1", 18));
    });
  });

  describe("Pre-VIP behavior", () => {
    it("check current prime reward distribution speeds", async () => {
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(8556547619047620n);
    });
  });

  testVip("VIP-610 [BNB Chain] March 2026 Prime Rewards Adjustment", await vip610(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check updated prime reward distribution speeds", async () => {
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(NEW_PRIME_SPEED_FOR_USDT);
    });
  });
});
