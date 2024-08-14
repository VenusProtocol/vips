import { makeProposal } from "src/utils";

export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0xC2bc5881f2c1ee08a1f0fee65Fbf2BB4C4DD81e9";

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
