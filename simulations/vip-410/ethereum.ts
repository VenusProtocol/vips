import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip410, {
  ETHEREUM_XVS,
  ETHEREUM_XVS_VAULT,
  ETHEREUM_XVS_VAULT_REWARD,
  emissions,
} from "../../vips/vip-410/bscmainnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

forking(21470971, async () => {
  testForkedNetworkVipCommands("VIP 410", await vip410(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [REWARDS_DISTRIBUTOR_ABI],
        ["RewardTokenSupplySpeedUpdated", "RewardTokenBorrowSpeedUpdated"],
        [5, 5],
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
        if (chainId == LzChainId.ethereum) {
          const rewardDistirbutor = new ethers.Contract(rewardsDistributor, REWARDS_DISTRIBUTOR_ABI, ethers.provider);
          expect(await rewardDistirbutor.rewardTokenSupplySpeeds(vToken)).to.equals(
            isSupplierAllocation ? newAllocation.div(blocksOrSecondsPerMonth) : 0,
          );

          expect(await rewardDistirbutor.rewardTokenBorrowSpeeds(vToken)).to.equals(
            isBorrowerAllocation ? newAllocation.div(blocksOrSecondsPerMonth) : 0,
          );
        }
      }
    });

    it("check xvs vault speed", async () => {
      const xvsVault = new ethers.Contract(ETHEREUM_XVS_VAULT, XVS_VAULT_ABI, ethers.provider);
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(ETHEREUM_XVS)).to.equals(ETHEREUM_XVS_VAULT_REWARD);
    });
  });
});
