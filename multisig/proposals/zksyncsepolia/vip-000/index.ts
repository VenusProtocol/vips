import { makeProposal } from "src/utils";

export const TREASURY = "0x943eBE4460a12F551D60A68f510Ea10CD8d564BA";

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
