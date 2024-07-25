import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const TRANSFER_AMOUNT = parseUnits("6893", 18);
export const XVS_VAULT = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
export const SPEED = "43055555555555555";

export const vip049 = () => {
  return makeProposal([
    {
      target: XVS_VAULT_TREASURY,
      signature: "sweepToken(address,address,uint256)",
      params: [XVS, XVS_STORE, TRANSFER_AMOUNT],
    },
    {
      target: XVS_VAULT,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [XVS, SPEED],
    },
  ]);
};

export default vip049;
