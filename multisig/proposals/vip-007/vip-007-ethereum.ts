import { makeProposal } from "../../../src/utils";

const XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
const TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";

export const vip007 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setWhitelist(address,bool)",
      params: [TREASURY, true],
    },
  ]);
};
