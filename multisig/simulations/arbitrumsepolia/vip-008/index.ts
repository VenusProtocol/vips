import { parseUnits } from "ethers/lib/utils";

import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../../src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip008, {
  COMPTROLLER_CORE,
  REWARD_DISTRIBUTOR_CORE_0,
  USDT,
  VUSDT_CORE,
} from "../../../proposals/arbitrumsepolia/vip-008";

forking(44291286, () => {
  describe("Generic checks", async () => {
    before(async () => {
      await pretendExecutingVip(vip008());
    });

    checkRewardsDistributorPool(COMPTROLLER_CORE, 1);

    const usdtRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: USDT,
      vToken: VUSDT_CORE,
      borrowSpeed: "2893",
      supplySpeed: "2893",
      totalRewardsToDistribute: parseUnits("365000", 6),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_USDT", usdtRewardsDistributorConfig);
  });
});
