import { makeProposal } from "../../../src/utils";

const COMPTROLLER_BEACON = "0x2020BDa1F931E07B14C9d346E2f6D5943b4cd56D";
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
