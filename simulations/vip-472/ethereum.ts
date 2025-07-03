import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ETHEREUM_BLOCKS_PER_QUARTER,
  ETHEREUM_PLP,
  ETHEREUM_USDC,
  ETHEREUM_USDC_PER_BLOCK_REWARD,
  ETHEREUM_USDT,
  ETHEREUM_USDT_PER_BLOCK_REWARD,
  ETHEREUM_WBTC,
  ETHEREUM_WBTC_PER_BLOCK_REWARD,
  ETHEREUM_WETH,
  ETHEREUM_WETH_PER_BLOCK_REWARD,
  vip472,
} from "../../vips/vip-472/bscmainnet";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";

forking(22114400, async () => {
  let plp: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, ETHEREUM_PLP);
  });

  describe("Pre-VIP behaviour", async () => {
    it("has the old WBTC distribution speed", async () => {
      const OLD_ETHEREUM_WBTC_PER_BLOCK_REWARD = parseUnits("0.01", 8).div(ETHEREUM_BLOCKS_PER_QUARTER);
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_WBTC)).to.equal(OLD_ETHEREUM_WBTC_PER_BLOCK_REWARD);
    });

    it("has the old WETH distribution speed", async () => {
      const OLD_ETHEREUM_WETH_PER_BLOCK_REWARD = parseUnits("11.36", 18).div(ETHEREUM_BLOCKS_PER_QUARTER);
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_WETH)).to.equal(OLD_ETHEREUM_WETH_PER_BLOCK_REWARD);
    });

    it("has the old USDC distribution speed", async () => {
      const OLD_ETHEREUM_USDC_PER_BLOCK_REWARD = parseUnits("2700", 6).div(ETHEREUM_BLOCKS_PER_QUARTER);
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_USDC)).to.equal(OLD_ETHEREUM_USDC_PER_BLOCK_REWARD);
    });

    it("has the old USDT distribution speed", async () => {
      const OLD_ETHEREUM_USDT_PER_BLOCK_REWARD = parseUnits("2700", 6).div(ETHEREUM_BLOCKS_PER_QUARTER);
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_USDT)).to.equal(OLD_ETHEREUM_USDT_PER_BLOCK_REWARD);
    });
  });

  testForkedNetworkVipCommands("VIP-472", await vip472(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has the new WBTC destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_WBTC)).to.equal(ETHEREUM_WBTC_PER_BLOCK_REWARD);
    });

    it("has the new WETH destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_WETH)).to.equal(ETHEREUM_WETH_PER_BLOCK_REWARD);
    });

    it("has the new USDC destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_USDC)).to.equal(ETHEREUM_USDC_PER_BLOCK_REWARD);
    });

    it("has the new USDT destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_USDT)).to.equal(ETHEREUM_USDT_PER_BLOCK_REWARD);
    });
  });
});
