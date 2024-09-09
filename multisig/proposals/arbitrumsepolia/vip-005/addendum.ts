import { makeProposal } from "../../../../src/utils";

export const PSR = "0x09267d30798B59c581ce54E861A084C6FC298666";
export const POOL_REGISTRY = "0xf93Df3135e0D555185c0BC888073374cA551C5fE";

const vip005 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "setPoolRegistry(address)",
      params: [POOL_REGISTRY],
    },
  ]);
};

export default vip005;
