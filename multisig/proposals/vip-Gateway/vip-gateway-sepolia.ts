import { makeProposal } from "../../../src/utils";

export const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
export const VTOKEN_BEACON = "0x0463a7E5221EAE1990cEddB51A5821a68cdA6008";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0xE5A008B6A0bAB405343B3ABe8895966EAaFb5790";
export const NEW_VTOKEN_IMPLEMENTATION = "0x062c7E0FB3E893d0fbB635F6911CDe7C2fB7E346";
export const NATIVE_TOKEN_GATEWAY = "0x13B3f65C0e2C64528F678B3C78ccac7341a2A66C";

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
