import { makeProposal } from "src/utils";

export const TREASURY = "0x07e880DaA6572829cE8ABaaf0f5323A4eFC417A6";

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
