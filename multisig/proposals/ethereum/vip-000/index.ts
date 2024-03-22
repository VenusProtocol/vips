import { makeProposal } from "../../../../src/utils";

const TREASURY = "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa";

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
