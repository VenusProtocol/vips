import { makeProposal } from "src/utils";

export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const COMPTROLLER_CURVE = "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796";
export const PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";

const vip047 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_CORE,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: COMPTROLLER_CURVE,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
  ]);
};

export default vip047;
