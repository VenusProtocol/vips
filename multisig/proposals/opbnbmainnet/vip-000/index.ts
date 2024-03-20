import { makeProposal } from "../../../../src/utils";

const TREASURY = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";

const vip000 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip000
