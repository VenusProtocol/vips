import { makeProposal } from "../../../../src/utils";

export const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const NORMAL_TIMELOCK = "0xeF9B3f8330352C7d09B7CD29A5A72f0410e901D1";

export const vip036 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "transferOwnership(address)",
      params: [NORMAL_TIMELOCK],
    },
  ]);
};

export default vip036;
