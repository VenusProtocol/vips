import { makeProposal } from "src/utils";

export const TREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";

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
