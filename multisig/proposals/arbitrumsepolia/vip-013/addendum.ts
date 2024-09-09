import { makeProposal } from "src/utils";

export const NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL = "0x63cEE24b12648E36d708163587aC17a777096a47";

const vip013 = () => {
  return makeProposal([
    {
      target: NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip013;
