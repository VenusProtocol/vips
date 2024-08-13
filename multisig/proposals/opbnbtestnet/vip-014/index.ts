import { makeProposal } from "../../../../src/utils";

export const XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
export const XVS_VAULT_TEMP_IMPLEMENTATION = "0xc8614663Cc4ee868EF5267891E177586d7105D7F";
export const XVS_VAULT_IMPLEMENTATION = "0x85B0711FB5Bef4CfeDb90BD2F392b943fd9f556D";
export const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";

const vip014 = () => {
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

export default vip014;
