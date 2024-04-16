import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip289, {
  BTC,
  BTC_DISTRIBUTION_SPEED,
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
} from "../../vips/vip-289/bscmainnet";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

forking(37874421, () => {
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

  testVip("VIP-289 Prime Adjustment", vip289(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [2]);
      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [4]);
    },
  });

  describe("Post-Execution", () => {
    it("should update the distribution config", async () => {
      const distributionsLength = await psr.totalDistributions();
      expect(distributionsLength).to.be.equal(distributionTargets.length);

      for (let i = 0; i < distributionsLength; i++) {
        const target = await psr.distributionTargets(i);

        if (target[2] === ETH_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.equal(150);
        } else if (target[2] === USDC_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.equal(400);
        } else {
          expect(target).to.be.deep.equal(distributionTargets[i]);
        }
      }
    });

    it("should update the distribution speeds in plp", async () => {
      expect(await plp.tokenDistributionSpeeds(BTC)).to.be.equal(BTC_DISTRIBUTION_SPEED);
      expect(await plp.tokenDistributionSpeeds(ETH)).to.be.equal(ETH_DISTRIBUTION_SPEED);
      expect(await plp.tokenDistributionSpeeds(USDC)).to.be.equal(USDC_DISTRIBUTION_SPEED);
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.equal(USDT_DISTRIBUTION_SPEED);
    });
  });
});
