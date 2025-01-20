import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BSCMAINNET_PLP,
  BSCMAINNET_PSR,
  BSCMAINNET_USDC,
  BSCMAINNET_USDC_PER_BLOCK_REWARD,
  BSCMAINNET_USDC_PRIME_CONVERTER,
  BSCMAINNET_USDT,
  BSCMAINNET_USDT_PER_BLOCK_REWARD,
  BSCMAINNET_USDT_PRIME_CONVERTER,
  BSCMAINNET_WBTC,
  BSCMAINNET_WBTC_PER_BLOCK_REWARD,
  BSCMAINNET_WBTC_PRIME_CONVERTER,
  BSCMAINNET_WETH,
  BSCMAINNET_WETH_PER_BLOCK_REWARD,
  BSCMAINNET_WETH_PRIME_CONVERTER,
  vip427,
} from "../../vips/vip-427/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

forking(45936743, async () => {
  let plp: Contract;
  let psr: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, BSCMAINNET_PLP);
    psr = await ethers.getContractAt(PSR_ABI, BSCMAINNET_PSR);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check PSR config", async () => {
      let config = await psr.distributionTargets(3);
      expect(config[1]).to.equal(600);
      expect(config[2]).to.equal(BSCMAINNET_USDC_PRIME_CONVERTER);

      config = await psr.distributionTargets(4);
      expect(config[1]).to.equal(1000);
      expect(config[2]).to.equal(BSCMAINNET_USDT_PRIME_CONVERTER);

      config = await psr.distributionTargets(5);
      expect(config[1]).to.equal(100);
      expect(config[2]).to.equal(BSCMAINNET_WBTC_PRIME_CONVERTER);

      config = await psr.distributionTargets(6);
      expect(config[1]).to.equal(300);
      expect(config[2]).to.equal(BSCMAINNET_WETH_PRIME_CONVERTER);
    });

    it("check PLP config", async () => {
      let speed = await plp.tokenDistributionSpeeds(BSCMAINNET_WBTC);
      expect(speed).to.equal("156012176560");

      speed = await plp.tokenDistributionSpeeds(BSCMAINNET_WETH);
      expect(speed).to.equal("11506849315068");

      speed = await plp.tokenDistributionSpeeds(BSCMAINNET_USDC);
      expect(speed).to.equal("59931506849315068");

      speed = await plp.tokenDistributionSpeeds(BSCMAINNET_USDT);
      expect(speed).to.equal("99885844748858447");
    });
  });

  testVip("VIP-424", await vip427(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );

      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [4]);
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check PSR config", async () => {
      let config = await psr.distributionTargets(3);
      expect(config[1]).to.equal(600);
      expect(config[2]).to.equal(BSCMAINNET_USDC_PRIME_CONVERTER);

      config = await psr.distributionTargets(4);
      expect(config[1]).to.equal(1100);
      expect(config[2]).to.equal(BSCMAINNET_USDT_PRIME_CONVERTER);

      config = await psr.distributionTargets(5);
      expect(config[1]).to.equal(100);
      expect(config[2]).to.equal(BSCMAINNET_WBTC_PRIME_CONVERTER);

      config = await psr.distributionTargets(6);
      expect(config[1]).to.equal(200);
      expect(config[2]).to.equal(BSCMAINNET_WETH_PRIME_CONVERTER);
    });

    it("check PLP config", async () => {
      let speed = await plp.tokenDistributionSpeeds(BSCMAINNET_WBTC);
      expect(speed).to.equal(BSCMAINNET_WBTC_PER_BLOCK_REWARD);

      speed = await plp.tokenDistributionSpeeds(BSCMAINNET_WETH);
      expect(speed).to.equal(BSCMAINNET_WETH_PER_BLOCK_REWARD);

      speed = await plp.tokenDistributionSpeeds(BSCMAINNET_USDC);
      expect(speed).to.equal(BSCMAINNET_USDC_PER_BLOCK_REWARD);

      speed = await plp.tokenDistributionSpeeds(BSCMAINNET_USDT);
      expect(speed).to.equal(BSCMAINNET_USDT_PER_BLOCK_REWARD);
    });
  });
});
