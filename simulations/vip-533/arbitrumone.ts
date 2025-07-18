import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip533, { rewardDistributors } from "../../vips/vip-533/bscmainnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";

export const allRewardDistributors = [
  {
    address: "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a",
    markets: [
      "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6",
      "0x4f3a73f318C5EA67A86eaaCE24309F29f89900dF",
      "0x9bb8cEc9C0d46F53b4f2173BB2A0221F66c353cC",
      "0x7D8609f8da70fF9027E9bc5229Af4F6727662707",
      "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD",
      "0xaDa57840B372D4c28623E87FC175dE8490792811",
      "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0",
    ],
  },
  {
    address: "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D",
    markets: [
      "0x246a35E79a3a0618535A469aDaF5091cAA9f7E88",
      "0x39D6d13Ea59548637104E40e729E4aABE27FE106",
      "0x9df6B5132135f14719696bBAe3C54BAb272fDb16",
    ],
  },
];

forking(356174917, async () => {
  describe("Post-VIP behaviour", async () => {
    it("check speed", async () => {
      for (const distributor of rewardDistributors) {
        if (distributor.chainId !== LzChainId.arbitrumone) continue;

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
