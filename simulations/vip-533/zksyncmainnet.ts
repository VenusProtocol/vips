import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip533, { rewardDistributors } from "../../vips/vip-533/bscmainnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";

export const allRewardDistributors = [
  {
    address: "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894",
    markets: [
      "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a",
      "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D",
      "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46",
      "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719",
      "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8",
      "0x03CAd66259f7F34EE075f8B62D133563D249eDa4",
      "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c",
      "0x697a70779C1A03Ba2BD28b7627a902BFf831b616",
      "0xCEb7Da150d16aCE58F090754feF2775C23C8b631",
    ],
  },
];

forking(62675633, async () => {
  describe("Post-VIP behaviour", async () => {
    it("check speed", async () => {
      for (const distributor of rewardDistributors) {
        if (distributor.chainId !== LzChainId.zksyncmainnet) continue;

        const rewardDistributor = new ethers.Contract(distributor.address, REWARD_DISTRIBUTOR_ABI, ethers.provider);

        for (const market of distributor.markets) {
          const supplySpeed = await rewardDistributor.rewardTokenSupplySpeeds(market);
          const borrowSpeed = await rewardDistributor.rewardTokenBorrowSpeeds(market);

          expect(supplySpeed != 0 || borrowSpeed != 0).to.be.true;
        }
      }
    });
  });

  testForkedNetworkVipCommands("VIP 533", await vip533(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [REWARD_DISTRIBUTOR_ABI],
        ["RewardTokenBorrowSpeedUpdated", "RewardTokenSupplySpeedUpdated"],
        [2, 3],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check speed", async () => {
      for (const distributor of allRewardDistributors) {
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
