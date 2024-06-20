import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const vsFRAX = "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe";
export const BORROW_CAP = parseUnits("2000000", 18);

export const vip038 = () => {
  return makeProposal([
    {
      target: COMPTROLLER,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [[vsFRAX], [BORROW_CAP]],
    },
  ]);
};

export default vip038;
