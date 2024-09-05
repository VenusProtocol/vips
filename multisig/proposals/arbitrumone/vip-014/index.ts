import { makeProposal } from "src/utils";

export const PRIME = "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49";
export const COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
export const COMPTROLLER_LIQUID_STAKED_ETH = "0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16";
export const NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL = "0xD1e89806BAB8Cd7680DFc7425D1fA6d7D5F0C3FE";

const vip014 = () => {
  return makeProposal([
    {
      target: NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: COMPTROLLER_LIQUID_STAKED_ETH,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
  ]);
};

export default vip014;
