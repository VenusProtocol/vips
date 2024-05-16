import { makeProposal } from "../../../../src/utils";

export const vPTweETH = "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1";
export const COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";

export const vip023Addendum = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: COMPTROLLER,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [[vPTweETH], [0]],
    },
  ]);
};

export default vip023Addendum;
