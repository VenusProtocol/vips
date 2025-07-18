import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip533, { rewardDistributors } from "../../vips/vip-533/bscmainnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";

forking(21389776, async () => {
  describe("Post-VIP behaviour", async () => {
    it("check speed", async () => {
      for (const distributor of rewardDistributors) {
        if (distributor.chainId !== LzChainId.unichainmainnet) continue;

        const rewardDistributor = new ethers.Contract(distributor.address, REWARD_DISTRIBUTOR_ABI, ethers.provider);

        for (const market of distributor.markets) {
          const supplySpeed = await rewardDistributor.rewardTokenSupplySpeeds(market);
          const borrowSpeed = await rewardDistributor.rewardTokenBorrowSpeeds(market);

          expect(supplySpeed != 0 || borrowSpeed != 0).to.be.true;
        }
      }
    });
  });

  testForkedNetworkVipCommands("VIP 533", await vip533());

  describe("Post-VIP behaviour", async () => {
    it("check speed", async () => {
      for (const distributor of rewardDistributors) {
        if (distributor.chainId !== LzChainId.unichainmainnet) continue;

        const rewardDistributor = new ethers.Contract(distributor.address, REWARD_DISTRIBUTOR_ABI, ethers.provider);

        for (const market of distributor.markets) {
          const supplySpeed = await rewardDistributor.rewardTokenSupplySpeeds(market);
          const borrowSpeed = await rewardDistributor.rewardTokenBorrowSpeeds(market);

          expect(supplySpeed == 0 && borrowSpeed == 0).to.be.true;
        }
      }
    });
  });
});
