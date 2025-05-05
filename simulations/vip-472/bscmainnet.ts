import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BSCMAINNET_BLOCKS_PER_QUARTER,
  BSCMAINNET_BTCB,
  BSCMAINNET_BTCB_PER_BLOCK_REWARD,
  BSCMAINNET_ETH,
  BSCMAINNET_ETH_PER_BLOCK_REWARD,
  BSCMAINNET_PLP,
  BSCMAINNET_USDC,
  BSCMAINNET_USDC_PER_BLOCK_REWARD,
  BSCMAINNET_USDT,
  BSCMAINNET_USDT_PER_BLOCK_REWARD,
  vip472,
} from "../../vips/vip-472/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";

forking(47735000, async () => {
  let plp: Contract;

  before(async () => {
    plp = await ethers.getContractAt(PLP_ABI, BSCMAINNET_PLP);
  });

  describe("Pre-VIP behaviour", async () => {
    it("has the old BTCB distribution speed", async () => {
      const OLD_BSCMAINNET_BTCB_PER_BLOCK_REWARD = parseUnits("0.38", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER);
      expect(await plp.tokenDistributionSpeeds(BSCMAINNET_BTCB)).to.equal(OLD_BSCMAINNET_BTCB_PER_BLOCK_REWARD);
    });

    it("has the old ETH distribution speed", async () => {
      const OLD_BSCMAINNET_WETH_PER_BLOCK_REWARD = parseUnits("21.38", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER);
      expect(await plp.tokenDistributionSpeeds(BSCMAINNET_ETH)).to.equal(OLD_BSCMAINNET_WETH_PER_BLOCK_REWARD);
    });

    it("has the old USDC distribution speed", async () => {
      const OLD_BSCMAINNET_USDC_PER_BLOCK_REWARD = parseUnits("216000", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER);
      expect(await plp.tokenDistributionSpeeds(BSCMAINNET_USDC)).to.equal(OLD_BSCMAINNET_USDC_PER_BLOCK_REWARD);
    });

    it("has the old USDT distribution speed", async () => {
      const OLD_BSCMAINNET_USDT_PER_BLOCK_REWARD = parseUnits("396000", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER);
      expect(await plp.tokenDistributionSpeeds(BSCMAINNET_USDT)).to.equal(OLD_BSCMAINNET_USDT_PER_BLOCK_REWARD);
    });
  });

  testVip("VIP-472", await vip472(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );

      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has the new BTCB destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(BSCMAINNET_BTCB)).to.equal(BSCMAINNET_BTCB_PER_BLOCK_REWARD);
    });

    it("has the new ETH destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(BSCMAINNET_ETH)).to.equal(BSCMAINNET_ETH_PER_BLOCK_REWARD);
    });

    it("has the new USDC destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(BSCMAINNET_USDC)).to.equal(BSCMAINNET_USDC_PER_BLOCK_REWARD);
    });

    it("has the new USDT destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(BSCMAINNET_USDT)).to.equal(BSCMAINNET_USDT_PER_BLOCK_REWARD);
    });
  });
});
