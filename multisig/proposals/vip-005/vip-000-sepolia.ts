import { makeProposal } from "../../../src/utils";

const XVS_BRIDGE_ADMIN = "0x4A4a5f6Ecc4DB4ad199E8f1Db388FFFb707fad52";
const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

export const vip005 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setWhitelist(address,bool)",
      params: [TREASURY, true],
    },
  ]);
};
