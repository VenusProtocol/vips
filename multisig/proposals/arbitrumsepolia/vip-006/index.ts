import { makeProposal } from "../../../../src/utils";

export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0xa9D6d0dc76a9f0B87E52df1326F2f0E4e422BC52";

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
