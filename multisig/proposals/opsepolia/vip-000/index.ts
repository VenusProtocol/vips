import { makeProposal } from "../../../../src/utils";

const TREASURY = "0x5A1a12F47FA7007C9e23cf5e025F3f5d3aC7d755";

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
