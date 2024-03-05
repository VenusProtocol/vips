import { makeProposal } from "../../../src/utils";

export const COMPTROLLER_BEACON = "0x11C3e19236ce17729FC66b74B537de00C54d44e7";
export const VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
export const NEW_COMPTROLLER_IMPLEMENTATION = "";
export const NEW_VTOKEN_IMPLEMENTATION = "";
export const NATIVE_TOKEN_GATEWAY = "";

export const vipGateway = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_VTOKEN_IMPLEMENTATION],
    },
    {
      target: NATIVE_TOKEN_GATEWAY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};
