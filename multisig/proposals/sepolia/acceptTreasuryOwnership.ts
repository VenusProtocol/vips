import { makeProposal } from "../../../src/utils";

const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

export const acceptTreasuryOwnership = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};
