import { makeProposal } from "../../../../src/utils";

const TREASURY = "0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da";

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
