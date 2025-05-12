import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ETHEREUM_PLP, ETHEREUM_WBTC, ETHEREUM_WBTC_PER_BLOCK_REWARD, vip491 } from "../../vips/vip-491/bscmainnet";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";

forking(22418504, async () => {
  const plp = new ethers.Contract(ETHEREUM_PLP, PLP_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("has the old WBTC distribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_WBTC)).to.equal(0);
    });
  });

  testForkedNetworkVipCommands("VIP-491", await vip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has the new WBTC destribution speed", async () => {
      expect(await plp.tokenDistributionSpeeds(ETHEREUM_WBTC)).to.equal(ETHEREUM_WBTC_PER_BLOCK_REWARD);
    });
  });
});
