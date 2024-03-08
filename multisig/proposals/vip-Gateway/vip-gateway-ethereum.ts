import { makeProposal } from "../../../src/utils";

export const COMPTROLLER_BEACON = "0xAE2C3F21896c02510aA187BdA0791cDA77083708";
export const VTOKEN_BEACON = "0xfc08aADC7a1A93857f6296C3fb78aBA1d286533a";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0x13B3f65C0e2C64528F678B3C78ccac7341a2A66C";
export const NEW_VTOKEN_IMPLEMENTATION = "0xE5A008B6A0bAB405343B3ABe8895966EAaFb5790";
export const NATIVE_TOKEN_GATEWAY_VWETH_CORE = "0x062c7E0FB3E893d0fbB635F6911CDe7C2fB7E346";
export const NATIVE_TOKEN_GATEWAY_VWETH_LST = "0x664488124Df6D48670fE38930F0e4Ce2a4faEdE1";

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
      target: NATIVE_TOKEN_GATEWAY_VWETH_CORE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: NATIVE_TOKEN_GATEWAY_VWETH_LST,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};
