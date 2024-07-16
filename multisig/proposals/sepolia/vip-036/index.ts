import { makeProposal } from "../../../../src/utils";

export const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const NORMAL_TIMELOCK = "0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF";

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
