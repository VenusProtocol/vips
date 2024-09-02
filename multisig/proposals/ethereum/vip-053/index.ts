import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const LST_POOL_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const LST_POOL_VWETH = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const NEW_IRM = "0x834078D691d431aAdC80197f7a61239F9F89547b";
export const COLLATERAL_FACTOR = "0";
export const RESERVE_FACTOR = parseUnits("0.25", 18);
export const LIQUIDATION_THRESHOLD = parseUnits("0.93", 18);

const vip053 = () => {
  return makeProposal([
    {
      target: LST_POOL_VWETH,
      signature: "setReserveFactor(uint256)",
      params: [RESERVE_FACTOR],
    },
    {
      target: LST_POOL_COMPTROLLER,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [LST_POOL_VWETH, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
    },
    {
      target: LST_POOL_VWETH,
      signature: "setInterestRateModel(address)",
      params: [NEW_IRM],
    },
  ]);
};

export default vip053;
