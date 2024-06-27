import { makeProposal } from "src/utils";

const TREASURY = "0x740aF73D4AB6300dc4c8D707a424EFC5f1bd04DA";

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
