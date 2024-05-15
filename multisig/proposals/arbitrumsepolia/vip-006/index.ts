import { makeProposal } from "../../../../src/utils";

export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0x196b19C2037863409C65CbF63592ae2a3CD2Dc2C";

const vip006 = () => {
  return makeProposal([
    {
      target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip006;
