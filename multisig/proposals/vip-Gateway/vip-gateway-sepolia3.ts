import { makeProposal } from "../../../src/utils";

export const NATIVE_TOKEN_GATEWAY_VWETH_CORE = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const NATIVE_TOKEN_GATEWAY_VWETH_LST = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

export const vipGateway = () => {
  return makeProposal([
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
