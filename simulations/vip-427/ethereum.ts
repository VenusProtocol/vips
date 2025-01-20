import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ETHEREUM_PLP,
  ETHEREUM_PSR,
  ETHEREUM_USDC,
  ETHEREUM_USDC_PER_BLOCK_REWARD,
  ETHEREUM_USDC_PRIME_CONVERTER,
  ETHEREUM_USDT,
  ETHEREUM_USDT_PER_BLOCK_REWARD,
  ETHEREUM_USDT_PRIME_CONVERTER,
  ETHEREUM_WBTC,
  ETHEREUM_WBTC_PER_BLOCK_REWARD,
  ETHEREUM_WBTC_PRIME_CONVERTER,
  ETHEREUM_WETH,
  ETHEREUM_WETH_PER_BLOCK_REWARD,
  ETHEREUM_WETH_PRIME_CONVERTER,
  vip427,
} from "../../vips/vip-427/bscmainnet";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

forking(21666859, async () => {
  let plp: Contract;
  let psr: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, ETHEREUM_PLP);
    psr = await ethers.getContractAt(PSR_ABI, ETHEREUM_PSR);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check PSR config", async () => {
      let config = await psr.distributionTargets(3);
      expect(config[1]).to.equal(100);
      expect(config[2]).to.equal(ETHEREUM_USDC_PRIME_CONVERTER);

      config = await psr.distributionTargets(4);
      expect(config[1]).to.equal(100);
      expect(config[2]).to.equal(ETHEREUM_USDT_PRIME_CONVERTER);

      config = await psr.distributionTargets(5);
      expect(config[1]).to.equal(100);
      expect(config[2]).to.equal(ETHEREUM_WBTC_PRIME_CONVERTER);

      config = await psr.distributionTargets(6);
      expect(config[1]).to.equal(1700);
      expect(config[2]).to.equal(ETHEREUM_WETH_PRIME_CONVERTER);
    });

    it("check PLP config", async () => {
      let speed = await plp.tokenDistributionSpeeds(ETHEREUM_WBTC);
      expect(speed).to.equal("6");

      speed = await plp.tokenDistributionSpeeds(ETHEREUM_WETH);
      expect(speed).to.equal("24018264840182");

      speed = await plp.tokenDistributionSpeeds(ETHEREUM_USDC);
      expect(speed).to.equal("3424");

      speed = await plp.tokenDistributionSpeeds(ETHEREUM_USDT);
      expect(speed).to.equal("3424");
    });
  });

  testForkedNetworkVipCommands("VIP 427", await vip427(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [4]);
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check PSR config", async () => {
      let config = await psr.distributionTargets(3);
      expect(config[1]).to.equal(120);
      expect(config[2]).to.equal(ETHEREUM_USDC_PRIME_CONVERTER);

      config = await psr.distributionTargets(4);
      expect(config[1]).to.equal(120);
      expect(config[2]).to.equal(ETHEREUM_USDT_PRIME_CONVERTER);

      config = await psr.distributionTargets(5);
      expect(config[1]).to.equal(60);
      expect(config[2]).to.equal(ETHEREUM_WBTC_PRIME_CONVERTER);

      config = await psr.distributionTargets(6);
      expect(config[1]).to.equal(1700);
      expect(config[2]).to.equal(ETHEREUM_WETH_PRIME_CONVERTER);
    });

    it("check PLP config", async () => {
      let speed = await plp.tokenDistributionSpeeds(ETHEREUM_WBTC);
      expect(speed).to.equal(ETHEREUM_WBTC_PER_BLOCK_REWARD);

      speed = await plp.tokenDistributionSpeeds(ETHEREUM_WETH);
      expect(speed).to.equal(ETHEREUM_WETH_PER_BLOCK_REWARD);

      speed = await plp.tokenDistributionSpeeds(ETHEREUM_USDC);
      expect(speed).to.equal(ETHEREUM_USDC_PER_BLOCK_REWARD);

      speed = await plp.tokenDistributionSpeeds(ETHEREUM_USDT);
      expect(speed).to.equal(ETHEREUM_USDT_PER_BLOCK_REWARD);
    });
  });
});
