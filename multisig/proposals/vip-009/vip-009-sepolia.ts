import { makeProposal } from "../../../src/utils";

const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x3cE617FCeb5e9Ed622F73b483aC7c94053795197";

export const vip009 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
  ]);
};
