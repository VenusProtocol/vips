import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip380, {
  BTC,
  BTC_DISTRIBUTION_SPEED,
  BTC_PRIME_CONVERTER,
  ETH,
  ETH_DISTRIBUTION_SPEED,
  ETH_PRIME_CONVERTER,
  PLP,
  PSR,
  USDC,
  USDC_DISTRIBUTION_SPEED,
  USDC_PRIME_CONVERTER,
  USDT,
  USDT_DISTRIBUTION_SPEED,
  USDT_PRIME_CONVERTER,
} from "../../vips/vip-380/bscmainnet";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

forking(42825391, async () => {
  let psr: Contract;
  let plp: Contract;
  const distributionTargets: object[] = [];

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, PSR);
    plp = await ethers.getContractAt(PLP_ABI, PLP);

    const distributionsLength = await psr.totalDistributions();
    for (let i = 0; i < distributionsLength; i++) {
      distributionTargets.push(await psr.distributionTargets(i));
    }
  });

  testVip("VIP-380 Prime Adjustment", await vip380(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [4]);
      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [4]);
    },
  });

  describe("Post-Execution", () => {
    it("should update the distribution config", async () => {
      const distributionsLength = await psr.totalDistributions();
      expect(distributionsLength).to.be.equal(distributionTargets.length);

      for (let i = 0; i < distributionsLength; i++) {
        const target = await psr.distributionTargets(i);

        if (target[2] === BTC_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.equal(100);
        } else if (target[2] === ETH_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.equal(300);
        } else if (target[2] === USDC_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.deep.equal(600);
        } else if (target[2] === USDT_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.deep.equal(1000);
        }
      }
    });

    it("should update the distribution speeds in plp", async () => {
      expect((await plp.tokenDistributionSpeeds(BTC)).times()).to.be.equal(BTC_DISTRIBUTION_SPEED);
      expect(await plp.tokenDistributionSpeeds(ETH)).to.be.equal(ETH_DISTRIBUTION_SPEED);
      expect(await plp.tokenDistributionSpeeds(USDC)).to.be.equal(USDC_DISTRIBUTION_SPEED);
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.equal(USDT_DISTRIBUTION_SPEED);
    });
  });
});
