import { makeProposal } from "../../../../src/utils";

const XVS_BRIDGE_ADMIN = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";
const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const vip013 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setWhitelist(address,bool)",
      params: [TREASURY, true],
    },
  ]);
};

export default vip013
