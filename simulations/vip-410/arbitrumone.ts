import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip410, {
  ARBITRUM_XVS,
  ARBITRUM_XVS_VAULT,
  ARBITRUM_XVS_VAULT_REWARD,
  emissions,
} from "../../vips/vip-410/bscmainnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

forking(288053557, async () => {
  testForkedNetworkVipCommands("VIP 410", await vip410(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [REWARDS_DISTRIBUTOR_ABI],
        ["RewardTokenSupplySpeedUpdated", "RewardTokenBorrowSpeedUpdated"],
        [5, 6],
      );
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Check reward distirbutor speed", async () => {
      for (const {
        chainId,
        newAllocation,
        isSupplierAllocation,
        isBorrowerAllocation,
        vToken,
        rewardsDistributor,
        blocksOrSecondsPerMonth,
      } of emissions) {
        if (chainId == LzChainId.arbitrumone) {
          const rewardDistirbutor = new ethers.Contract(rewardsDistributor, REWARDS_DISTRIBUTOR_ABI, ethers.provider);
          if (isSupplierAllocation) {
            expect(await rewardDistirbutor.rewardTokenSupplySpeeds(vToken)).to.equals(
              newAllocation.div(blocksOrSecondsPerMonth),
            );
            expect(await rewardDistirbutor.rewardTokenBorrowSpeeds(vToken)).to.equals(0);
          }

          if (isBorrowerAllocation) {
            expect(await rewardDistirbutor.rewardTokenSupplySpeeds(vToken)).to.equals(0);
            expect(await rewardDistirbutor.rewardTokenBorrowSpeeds(vToken)).to.equals(
              newAllocation.div(blocksOrSecondsPerMonth),
            );
          }
        }
      }
    });

    it("check xvs vault speed", async () => {
      const xvsVault = new ethers.Contract(ARBITRUM_XVS_VAULT, XVS_VAULT_ABI, ethers.provider);
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(ARBITRUM_XVS)).to.equals(ARBITRUM_XVS_VAULT_REWARD);
    });
  });
});
