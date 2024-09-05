import { makeProposal } from "src/utils";

export const NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL = "0xD1e89806BAB8Cd7680DFc7425D1fA6d7D5F0C3FE";

const vip014 = () => {
  return makeProposal([
    {
      target: NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip014;
