import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const CURVE_COMPTROLLER = "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796";
export const vcrvUSD_CURVE = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
export const SUPPLY_CAP = parseUnits("5000000", 18);
export const BORROW_CAP = parseUnits("4000000", 18);

export const vip023 = () => {
  return makeProposal([
    {
      target: CURVE_COMPTROLLER,
      signature: "setMarketSupplyCaps(address[],uint256[])",
      params: [[vcrvUSD_CURVE], [SUPPLY_CAP]],
    },
    {
      target: CURVE_COMPTROLLER,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [[vcrvUSD_CURVE], [BORROW_CAP]],
    },
  ]);
};

export default vip023;
