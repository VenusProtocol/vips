import { makeProposal } from "../../../../src/utils";

const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

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
