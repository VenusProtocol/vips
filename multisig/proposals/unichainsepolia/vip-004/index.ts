import { makeProposal } from "src/utils";

export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0x148C41b07A5c1f289CFB57C2F40d5EEF8ab30DB1";

const vip004 = () => {
  return makeProposal([
    {
      target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip004;
