import { makeProposal } from "../../../../src/utils";

export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0xc8e51418cadc001157506b306C6d0b878f1ff755";

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
