import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip533, { rewardDistributors } from "../../vips/vip-533/bscmainnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";

export const allRewardDistributors = [
  {
    address: "0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb",
    markets: [
      "0xb953f92b9f759d97d2f2dec10a8a3cf75fce3a95",
      "0xDa7Ce7Ba016d266645712e2e4Ebc6cC75eA8E4CD",
      "0x68e2A6F7257FAc2F5a557b9E83E1fE6D5B408CE5",
      "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374",
      "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2",
      "0x0170398083eb0D0387709523baFCA6426146C218",
      "0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB",
    ],
  },
];

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
