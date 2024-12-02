import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip014, {
  REWARD_DISTRIBUTOR_CORE_0,
  VUSDC_E_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  VZK_CORE,
} from "../../../proposals/zksyncmainnet/vip-014";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

type RewardConfig = {
  vToken: string;
  supplySpeed: string;
  borrowSpeed: string;
};

const tokensRewardConfig: RewardConfig[] = [
  {
    vToken: VUSDT_CORE,
    supplySpeed: "277777777777777",
    borrowSpeed: "69444444444444",
  },
  {
    vToken: VUSDC_E_CORE,
    supplySpeed: "555555555555555",
    borrowSpeed: "138888888888888",
  },
  {
    vToken: VWBTC_CORE,
    supplySpeed: "370370370370370",
    borrowSpeed: "92592592592592",
  },
  {
    vToken: VWETH_CORE,
    supplySpeed: "370370370370370",
    borrowSpeed: "92592592592592",
  },
  {
    vToken: VZK_CORE,
    supplySpeed: "277777777777777",
    borrowSpeed: "69444444444444",
  },
];

forking(46537669, async () => {
  let rewardsDistributor: Contract;
  describe("Post-VIP behavior", async () => {
    before(async () => {
      rewardsDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR_CORE_0);
      await pretendExecutingVip(await vip014());
    });

    tokensRewardConfig.forEach(config => {
      it(`should have borrowSpeed = ${config.borrowSpeed.toString()}`, async () => {
        expect(await rewardsDistributor.rewardTokenBorrowSpeeds(config.vToken)).to.equal(config.borrowSpeed);
      });

      it(`should have supplySpeed = ${config.supplySpeed.toString()}`, async () => {
        expect(await rewardsDistributor.rewardTokenSupplySpeeds(config.vToken)).to.equal(config.supplySpeed);
      });
    });
  });
});
