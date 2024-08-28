import { makeProposal } from "src/utils";

export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0x8730de2744E5e8EDC339605326B1DF9F99C0c00B";

const vip005 = () => {
  return makeProposal([
    {
      target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip005;
