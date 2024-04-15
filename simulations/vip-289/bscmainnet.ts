import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip289, { ETH_PRIME_CONVERTER, PSR, USDC_PRIME_CONVERTER } from "../../vips/vip-289/bscmainnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

forking(37874421, () => {
  let psr: Contract;
  const distributionTargets: object[] = [];

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, PSR);

    const distributionsLength = await psr.totalDistributions();
    for (let i = 0; i < distributionsLength; i++) {
      distributionTargets.push(await psr.distributionTargets(i));
    }
  });

  testVip("VIP-289 Prime Adjustment", vip289(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [2]);
    },
  });

  describe("Post-Execution", () => {
    it("should update the distribution config", async () => {
      const distributionsLength = await psr.totalDistributions();

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
  });
});
