import { makeProposal } from "../../../../src/utils";

const TREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";

export const vip000 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};
