import { makeProposal } from "../../../../src/utils";

export const XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
export const XVS_VAULT_TEMP_IMPLEMENTATION = "0xF23CB7f0e4742506EB45ad3D663Fa461512B56B8";
export const XVS_VAULT_IMPLEMENTATION = "0xc3D1F7CC89dce0A1245803fe9e0E62B8EC351196";
export const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";

const vip019 = () => {
  return makeProposal([
    {
      target: XVS_VAULT_PROXY,
      signature: "_setPendingImplementation(address)",
      params: [XVS_VAULT_TEMP_IMPLEMENTATION],
    },
    {
      target: XVS_VAULT_TEMP_IMPLEMENTATION,
      signature: "_become(address)",
      params: [XVS_VAULT_PROXY],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setXvsAddress(address)",
      params: [XVS],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "_setPendingImplementation(address)",
      params: [XVS_VAULT_IMPLEMENTATION],
    },
    {
      target: XVS_VAULT_IMPLEMENTATION,
      signature: "_become(address)",
      params: [XVS_VAULT_PROXY],
    },
  ]);
};

export default vip019;
