import { makeProposal } from "../../../../src/utils";

export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0x4602BCddAE1636093c72335007a23BaA0241672D";

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
