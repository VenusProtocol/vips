import { makeProposal } from "../../../../src/utils";

export const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const NORMAL_TIMELOCK = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";

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
