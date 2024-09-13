import { makeProposal } from "src/utils";

export const TREASURY = "0xB2e9174e23382f7744CebF7e0Be54cA001D95599";

const vip000 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip000;
