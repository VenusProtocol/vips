import { makeProposal } from "src/utils";

export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0xeEDE4e1BDaC489BD851970bE3952B729C4238A68";

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
