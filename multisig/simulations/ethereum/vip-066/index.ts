import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip066, {
  WBTC,
  WBTC_REWARD_AMOUNT_PER_BLOCK,
  WBTC_PRIME_CONVERTER,
  WETH,
  WETH_REWARD_AMOUNT_PER_BLOCK,
  WETH_PRIME_CONVERTER,
  PLP,
  PSR,
  USDC,
  USDC_REWARD_AMOUNT_PER_BLOCK,
  USDC_PRIME_CONVERTER,
  USDT,
  USDT_REWARD_AMOUNT_PER_BLOCK,
  USDT_PRIME_CONVERTER,
} from "../../../proposals/ethereum/vip-066";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

forking(20942802, async () => {
  let psr: Contract;
  let plp: Contract;
  const distributionTargets: object[] = [];

  describe("Post-VIP behavior", async () => {
    before(async () => {
      psr = await ethers.getContractAt(PSR_ABI, PSR);
      plp = await ethers.getContractAt(PLP_ABI, PLP);
  
      const distributionsLength = await psr.totalDistributions();
      for (let i = 0; i < distributionsLength; i++) {
        distributionTargets.push(await psr.distributionTargets(i));
      }
      await pretendExecutingVip(await vip066());
    });

    it("should update the distribution config", async () => {
      const distributionsLength = await psr.totalDistributions();
      expect(distributionsLength).to.be.equal(distributionTargets.length);

      for (let i = 0; i < distributionsLength; i++) {
        const target = await psr.distributionTargets(i);

        if (target[2] === WBTC_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.equal(100);
        } else if (target[2] === WETH_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.equal(1700);
        } else if (target[2] === USDC_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.deep.equal(100);
        } else if (target[2] === USDT_PRIME_CONVERTER && target[0] == 0) {
          expect(target[1]).to.be.deep.equal(100);
        }
      }
    });

    it("should update the distribution speeds in plp", async () => {
      expect(await plp.tokenDistributionSpeeds(WBTC)).to.be.equal(WBTC_REWARD_AMOUNT_PER_BLOCK);
      expect(await plp.tokenDistributionSpeeds(WETH)).to.be.equal(WETH_REWARD_AMOUNT_PER_BLOCK);
      expect(await plp.tokenDistributionSpeeds(USDC)).to.be.equal(USDC_REWARD_AMOUNT_PER_BLOCK);
      expect(await plp.tokenDistributionSpeeds(USDT)).to.be.equal(USDT_REWARD_AMOUNT_PER_BLOCK);
    });
  });
});
