import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const REWARDS_DISTRIBUTOR_CORE_OLD = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const REWARDS_DISTRIBUTOR_CORE_NEW = "0x886767B62C7ACD601672607373048FFD96Cf27B2";
export const REWARDS_DISTRIBUTOR_CURVE_OLD = "0x8473B767F68250F5309bae939337136a899E43F9";
export const REWARDS_DISTRIBUTOR_CURVE_NEW = "0x461dE281c453F447200D67C9Dd31b3046c8f49f8";
export const REWARDS_DISTRIBUTOR_LST_OLD = "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98";
export const REWARDS_DISTRIBUTOR_LST_NEW = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const XVS_AMOUNT_CORE = parseUnits("20108806552309361821527", 0);
export const XVS_AMOUNT_CURVE = parseUnits("1778930600771835924226", 0);
export const XVS_AMOUNT_LST = parseUnits("19396992378063863636377", 0);
export const vip054 = () => {
  return makeProposal([
    {
      target: REWARDS_DISTRIBUTOR_CORE_OLD,
      signature: "grantRewardToken(address,uint256)",
      params: [REWARDS_DISTRIBUTOR_CORE_NEW, XVS_AMOUNT_CORE],
    },
    {
      target: REWARDS_DISTRIBUTOR_CURVE_OLD,
      signature: "grantRewardToken(address,uint256)",
      params: [REWARDS_DISTRIBUTOR_CURVE_NEW, XVS_AMOUNT_CURVE],
    },
    {
      target: REWARDS_DISTRIBUTOR_LST_OLD,
      signature: "grantRewardToken(address,uint256)",
      params: [REWARDS_DISTRIBUTOR_LST_NEW, XVS_AMOUNT_LST],
    },
  ]);
};
export default vip054;
